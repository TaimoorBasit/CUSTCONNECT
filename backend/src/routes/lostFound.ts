import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { uploadLostFound, getFileUrl } from '../utils/upload';

const router = express.Router();

// Get all lost & found items (Students)
router.get('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { category, status, universityId } = req.query;

  // Get user's university
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  const whereClause: any = {};

  if (category && (category === 'Lost' || category === 'Found')) {
    whereClause.category = category;
  }

  if (status && (status === 'ACTIVE' || status === 'RESOLVED' || status === 'CLOSED')) {
    whereClause.status = status;
  } else {
    // Default to active items
    whereClause.status = 'ACTIVE';
  }

  // Filter by university if user has one, otherwise show all
  if (universityId) {
    whereClause.universityId = universityId;
  } else if (user?.universityId) {
    // Show items from user's university OR items without universityId (general)
    whereClause.OR = [
      { universityId: user.universityId },
      { universityId: null }
    ];
  }

  const items = await prisma.lostFound.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      university: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    items
  });
}));

// Get single lost & found item
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const item = await prisma.lostFound.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      university: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  if (!item) {
    throw createError('Item not found', 404);
  }

  res.json({
    success: true,
    item
  });
}));

// Create lost & found item (Student)
router.post('/', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { title, description, category, itemType, location, contactInfo } = req.body;

  if (!title || !category || (category !== 'Lost' && category !== 'Found')) {
    throw createError('Title and category (Lost/Found) are required', 400);
  }

  // Get user's university
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  const item = await prisma.lostFound.create({
    data: {
      title,
      description,
      category,
      itemType: itemType || 'Other',
      location,
      contactInfo: contactInfo || req.user!.email,
      userId: req.user!.id,
      universityId: user?.universityId || null,
      status: 'ACTIVE',
      isResolved: false
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: `${category} item posted successfully`,
    item
  });
}));

// Upload image for lost & found item
router.post('/:id/image', authenticateToken, uploadLostFound.single('image'), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  // Verify item exists and user owns it
  const item = await prisma.lostFound.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!item) {
    throw createError('Item not found', 404);
  }

  if (item.userId !== req.user!.id) {
    throw createError('Not authorized to update this item', 403);
  }

  const imageUrl = getFileUrl(req.file.path, 'lost-found');

  // Update item with image URL
  const updatedItem = await prisma.lostFound.update({
    where: { id },
    data: { imageUrl },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Image uploaded successfully',
    item: updatedItem
  });
}));

// Mark item as resolved (Student who posted it or Super Admin)
router.put('/:id/resolve', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { resolvedBy } = req.body;

  const item = await prisma.lostFound.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!item) {
    throw createError('Item not found', 404);
  }

  const userRoles = req.user!.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isOwner = item.userId === req.user!.id;

  if (!isOwner && !isSuperAdmin) {
    throw createError('Not authorized to resolve this item', 403);
  }

  const updatedItem = await prisma.lostFound.update({
    where: { id },
    data: {
      status: 'RESOLVED',
      isResolved: true,
      resolvedAt: new Date(),
      resolvedBy: resolvedBy || req.user!.id
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Item marked as resolved',
    item: updatedItem
  });
}));

// Delete lost & found item (Owner or Super Admin)
router.delete('/:id', authenticateToken, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const item = await prisma.lostFound.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!item) {
    throw createError('Item not found', 404);
  }

  const userRoles = req.user!.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isOwner = item.userId === req.user!.id;

  if (!isOwner && !isSuperAdmin) {
    throw createError('Not authorized to delete this item', 403);
  }

  await prisma.lostFound.delete({
    where: { id: id as string }
  });

  res.json({
    success: true,
    message: 'Item deleted successfully'
  });
}));

export default router;

