import express from 'express';
import { prisma } from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { uploadPost, getFileUrl } from '../utils/upload';
import { io } from '../index';

const router = express.Router();

// Create a story
router.post('/', authenticateToken, uploadPost.single('file'), asyncHandler(async (req: AuthRequest, res) => {
    const { content, mediaType = 'IMAGE' } = req.body;

    if (!req.file) {
        throw createError('Media file is required for a story', 400);
    }

    const mediaUrl = getFileUrl(req.file.path, 'post');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const story = await prisma.story.create({
        data: {
            content,
            mediaUrl,
            mediaType: mediaType as any,
            authorId: req.user!.id,
            expiresAt,
        },
        include: {
            author: {
                select: { id: true, firstName: true, lastName: true, profileImage: true }
            }
        }
    });

    // Notify followers
    const followers = await prisma.follow.findMany({
        where: { followingId: req.user!.id },
        select: { followerId: true }
    });

    followers.forEach(f => {
        io.to(f.followerId).emit('new-story', {
            story,
            author: story.author
        });
    });

    res.status(201).json({
        success: true,
        story
    });
}));

// Get stories from users the current user follows
router.get('/feed', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const now = new Date();

    // Get following IDs
    const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true }
    });
    const followingIds = following.map(f => f.followingId);

    // Get active stories from followed users OR user's own stories
    const stories = await prisma.story.findMany({
        where: {
            isActive: true,
            expiresAt: { gt: now },
            OR: [
                { authorId: { in: followingIds } },
                { authorId: userId }
            ]
        },
        include: {
            author: {
                select: { id: true, firstName: true, lastName: true, profileImage: true }
            },
            _count: {
                select: { views: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Group stories by author for the Instagram-like UI
    const groupedStories = stories.reduce((acc: any, story) => {
        const authorId = story.authorId;
        if (!acc[authorId]) {
            acc[authorId] = {
                author: story.author,
                stories: []
            };
        }
        acc[authorId].stories.push(story);
        return acc;
    }, {});

    res.json({
        success: true,
        feed: Object.values(groupedStories)
    });
}));

// View a story (mark as viewed)
router.post('/:storyId/view', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const { storyId } = req.params;
    const userId = req.user!.id;

    await prisma.storyView.upsert({
        where: {
            userId_storyId: { userId, storyId }
        },
        create: { userId, storyId },
        update: {} // No update needed if already viewed
    });

    res.json({ success: true });
}));

// Delete a story
router.delete('/:storyId', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
    const { storyId } = req.params;

    const story = await prisma.story.findUnique({ where: { id: storyId } });

    if (!story) {
        throw createError('Story not found', 404);
    }

    if (story.authorId !== req.user!.id) {
        throw createError('Unauthorized', 403);
    }

    await prisma.story.update({
        where: { id: storyId },
        data: { isActive: false }
    });

    res.json({ success: true, message: 'Story deleted' });
}));

export default router;
