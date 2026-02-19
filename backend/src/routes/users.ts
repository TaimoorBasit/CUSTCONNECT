import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { uploadLostFound, getFileUrl } from '../utils/upload';

const router = express.Router();

// Get departments for user's university
router.get('/departments', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (!user?.universityId) {
    return res.json({
      success: true,
      departments: []
    });
  }

  const departments = await prisma.department.findMany({
    where: {
      universityId: user.universityId,
      isActive: true
    },
    select: {
      id: true,
      name: true,
      code: true
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    departments
  });
}));

// Get user profile
router.get('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      isVerified: true,
      year: true,
      studentId: true,
      university: {
        select: {
          id: true,
          name: true,
          city: true,
          country: true
        }
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      roles: {
        include: {
          role: true
        }
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true
        }
      },
      createdAt: true
    }
  });

  res.json({
    success: true,
    user
  });
}));

// Update user profile
router.put('/profile', asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, year, studentId, profileImage, departmentId } = req.body;

  const updateData: any = {};
  if (firstName !== undefined) updateData.firstName = firstName;
  if (lastName !== undefined) updateData.lastName = lastName;
  if (year !== undefined) updateData.year = year ? parseInt(year) : null;
  if (studentId !== undefined) updateData.studentId = studentId;
  if (profileImage !== undefined) updateData.profileImage = profileImage;
  if (departmentId !== undefined) updateData.departmentId = departmentId || null;

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      year: true,
      studentId: true,
      university: {
        select: {
          id: true,
          name: true,
          city: true,
          country: true
        }
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user
  });
}));

// Upload profile picture
router.post('/profile/picture', uploadLostFound.single('image'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No image file provided', 400);
  }

  const imageUrl = getFileUrl(req.file.path, 'lost-found');

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { profileImage: imageUrl },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      year: true,
      studentId: true,
      university: {
        select: {
          id: true,
          name: true,
          city: true,
          country: true
        }
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      updatedAt: true
    }
  });

  res.json({
    success: true,
    message: 'Profile picture uploaded successfully',
    user
  });
}));

// Get user by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profileImage: true,
      year: true,
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      department: {
        select: {
          id: true,
          name: true,
          code: true
        }
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true
        }
      },
      createdAt: true
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  res.json({
    success: true,
    user
  });
}));

// Follow user
router.post('/follow', asyncHandler(async (req: AuthRequest, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  if (userId === req.user!.id) {
    throw createError('Cannot follow yourself', 400);
  }

  // Check if user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!targetUser) {
    throw createError('User not found', 404);
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: userId
      }
    }
  });

  if (existingFollow) {
    throw createError('Already following this user', 400);
  }

  // Create follow relationship
  await prisma.follow.create({
    data: {
      followerId: req.user!.id,
      followingId: userId
    }
  });

  // Send notification
  await prisma.notification.create({
    data: {
      userId,
      title: 'New Follower',
      message: `${req.user!.firstName} ${req.user!.lastName} started following you`,
      type: 'INFO'
    }
  });

  // Emit real-time notification
  io.to(userId).emit('notification', {
    title: 'New Follower',
    message: `${req.user!.firstName} ${req.user!.lastName} started following you`
  });

  res.json({
    success: true,
    message: 'Successfully followed user'
  });
}));

// Unfollow user
router.delete('/follow', asyncHandler(async (req: AuthRequest, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: userId
      }
    }
  });

  if (!follow) {
    throw createError('Not following this user', 400);
  }

  await prisma.follow.delete({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: userId
      }
    }
  });

  res.json({
    success: true,
    message: 'Successfully unfollowed user'
  });
}));

// Get followers
router.get('/:id/followers', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const followers = await prisma.follow.findMany({
    where: { followingId: id as string },
    include: {
      follower: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.follow.count({
    where: { followingId: id as string }
  });

  res.json({
    success: true,
    followers: followers.map((f: any) => f.follower),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get following
router.get('/:id/following', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const offset = (Number(page) - 1) * Number(limit);

  const following = await prisma.follow.findMany({
    where: { followerId: id as string },
    include: {
      following: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.follow.count({
    where: { followerId: id as string }
  });

  res.json({
    success: true,
    following: following.map((f: any) => f.following),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

export default router;

