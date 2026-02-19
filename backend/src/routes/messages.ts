
import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();

// Get conversations (users communicated with)
router.get('/conversations', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;

    // Find all messages where user is sender or receiver
    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: userId },
                { receiverId: userId }
            ]
        },
        include: {
            sender: {
                select: { id: true, firstName: true, lastName: true, email: true, profileImage: true, roles: { include: { role: true } } }
            },
            receiver: {
                select: { id: true, firstName: true, lastName: true, email: true, profileImage: true, roles: { include: { role: true } } }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Extract unique conversation partners
    const conversationsMap = new Map();

    messages.forEach(msg => {
        const isSender = msg.senderId === userId;
        const partner = isSender ? msg.receiver : msg.sender;

        if (!conversationsMap.has(partner.id)) {
            conversationsMap.set(partner.id, {
                partner,
                lastMessage: msg.content,
                timestamp: msg.createdAt,
                unreadCount: !isSender && !msg.isRead ? 1 : 0
            });
        } else {
            const conv = conversationsMap.get(partner.id);
            if (!isSender && !msg.isRead) {
                conv.unreadCount++;
            }
        }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
        success: true,
        conversations
    });
}));

// Get messages with a specific user
router.get('/:userId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const currentUserId = req.user!.id;
    const otherUserId = req.params.userId;

    const messages = await prisma.message.findMany({
        where: {
            OR: [
                { senderId: currentUserId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: currentUserId }
            ]
        },
        orderBy: { createdAt: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
        where: {
            senderId: otherUserId,
            receiverId: currentUserId,
            isRead: false
        },
        data: { isRead: true }
    });

    res.json({
        success: true,
        messages
    });
}));

// Send a message
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const senderId = req.user!.id;
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
        throw createError('Receiver ID and content are required', 400);
    }

    const message = await prisma.message.create({
        data: {
            senderId,
            receiverId,
            content,
        }
    });

    res.status(201).json({
        success: true,
        message
    });
}));

export default router;
