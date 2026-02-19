import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// Get notifications
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = { userId: req.user!.id };

  if (unreadOnly === 'true') {
    whereClause.isRead = false;
  }

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.notification.count({
    where: whereClause
  });

  res.json({
    success: true,
    notifications,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Mark notification as read
router.put('/:id/read', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  if (notification.userId !== req.user!.id) {
    throw createError('Not authorized to update this notification', 403);
  }

  await prisma.notification.update({
    where: { id },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'Notification marked as read'
  });
}));

// Mark all notifications as read
router.put('/read-all', asyncHandler(async (req: AuthRequest, res) => {
  await prisma.notification.updateMany({
    where: {
      userId: req.user!.id,
      isRead: false
    },
    data: { isRead: true }
  });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// Delete notification
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  if (notification.userId !== req.user!.id) {
    throw createError('Not authorized to delete this notification', 403);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get notification count
router.get('/count', asyncHandler(async (req: AuthRequest, res) => {
  const unreadCount = await prisma.notification.count({
    where: {
      userId: req.user!.id,
      isRead: false
    }
  });

  res.json({
    success: true,
    unreadCount
  });
}));

export default router;

