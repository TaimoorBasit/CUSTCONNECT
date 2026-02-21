
import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { io } from '../index';

const router = express.Router();

// Get conversations (Inbox)
router.get('/conversations', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;

    const memberships = await prisma.conversationMember.findMany({
        where: { userId },
        include: {
            conversation: {
                include: {
                    members: {
                        where: {
                            NOT: { userId }
                        },
                        include: {
                            user: {
                                select: { id: true, firstName: true, lastName: true, profileImage: true, roles: { include: { role: true } } }
                            }
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1
                    }
                }
            }
        },
        orderBy: { conversation: { updatedAt: 'desc' } }
    });

    const conversations = memberships.map(m => {
        const conv = m.conversation;
        const lastMessage = conv.messages[0];

        // For direct messages, the partner is the other member
        // For groups, we might show group name or members
        const partner = !conv.isGroup ? conv.members[0]?.user : null;

        return {
            id: conv.id,
            name: conv.name,
            imageUrl: conv.imageUrl,
            isGroup: conv.isGroup,
            partner,
            lastMessage: lastMessage?.content || '',
            lastMessageAt: lastMessage?.createdAt || conv.createdAt,
            unread: lastMessage ? lastMessage.createdAt > m.lastReadAt : false
        };
    });

    res.json({
        success: true,
        conversations
    });
}));

// Get or Create Direct Conversation with a user
router.get('/direct/:userId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const currentUserId = req.user!.id;
    const targetUserId = req.params.userId;

    // Find if a direct conversation already exists between these two
    let conversation = await prisma.conversation.findFirst({
        where: {
            isGroup: false,
            AND: [
                { members: { some: { userId: currentUserId } } },
                { members: { some: { userId: targetUserId } } }
            ]
        },
        include: {
            messages: {
                orderBy: { createdAt: 'asc' },
                include: {
                    sender: {
                        select: { id: true, firstName: true }
                    }
                }
            },
            members: {
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, profileImage: true }
                    }
                }
            }
        }
    });

    // If not, create one
    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                members: {
                    create: [
                        { userId: currentUserId, role: 'ADMIN' },
                        { userId: targetUserId, role: 'MEMBER' }
                    ]
                }
            },
            include: {
                messages: true,
                members: {
                    include: {
                        user: {
                            select: { id: true, firstName: true, lastName: true, profileImage: true }
                        }
                    }
                }
            }
        }) as any;
    }

    // Update last read for current user
    await prisma.conversationMember.update({
        where: {
            userId_conversationId: {
                userId: currentUserId,
                conversationId: conversation!.id
            }
        },
        data: { lastReadAt: new Date() }
    });

    res.json({
        success: true,
        conversation
    });
}));

// Create Group Conversation
router.post('/group', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const { name, members } = req.body; // members is array of user IDs
    const currentUserId = req.user!.id;

    if (!name || !members || !Array.isArray(members)) {
        throw createError('Group name and members list are required', 400);
    }

    const conversation = await prisma.conversation.create({
        data: {
            name,
            isGroup: true,
            members: {
                create: [
                    { userId: currentUserId, role: 'ADMIN' },
                    ...members.map((userId: string) => ({ userId, role: 'MEMBER' }))
                ]
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, profileImage: true }
                    }
                }
            }
        }
    });

    res.status(201).json({
        success: true,
        conversation
    });
}));

// Send a message to a conversation
router.post('/:conversationId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const senderId = req.user!.id;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content) {
        throw createError('Content is required', 400);
    }

    // Check if user is a member
    const membership = await prisma.conversationMember.findUnique({
        where: { userId_conversationId: { userId: senderId, conversationId } }
    });

    if (!membership) {
        throw createError('You are not a member of this conversation', 403);
    }

    const message = await prisma.message.create({
        data: {
            senderId,
            conversationId,
            content,
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, profileImage: true }
            }
        }
    });

    // Update conversation updatedAt
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    // Update last read for current user (since they sent it)
    await prisma.conversationMember.update({
        where: { userId_conversationId: { userId: senderId, conversationId } },
        data: { lastReadAt: new Date() }
    });

    // Emit real-time message
    io.to(conversationId).emit('new-message', {
        conversationId,
        message
    });

    res.status(201).json({
        success: true,
        message
    });
}));

// Backward compatibility: Send to userId
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const { userId, receiverId, content } = req.body;
    const targetId = userId || receiverId;
    const senderId = req.user!.id;

    if (!targetId || !content) {
        throw createError('Receiver ID and content are required', 400);
    }

    // Find or create direct conversation
    let conversation = await prisma.conversation.findFirst({
        where: {
            isGroup: false,
            AND: [
                { members: { some: { userId: senderId } } },
                { members: { some: { userId: targetId } } }
            ]
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                members: {
                    create: [
                        { userId: senderId, role: 'ADMIN' },
                        { userId: targetId, role: 'MEMBER' }
                    ]
                }
            }
        });
    }

    const message = await prisma.message.create({
        data: {
            senderId,
            conversationId: conversation.id,
            content,
        }
    });

    // Emit real-time message
    io.to(conversation.id).emit('new-message', {
        conversationId: conversation.id,
        message
    });

    res.status(201).json({
        success: true,
        message
    });
}));

export default router;
