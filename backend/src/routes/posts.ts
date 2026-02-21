import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { uploadPost, getFileUrl } from '../utils/upload';

const router = express.Router();

// Upload post image/video
router.post('/upload', uploadPost.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No file provided', 400);
  }

  const fileUrl = getFileUrl(req.file.path, 'post');

  res.json({
    success: true,
    fileUrl
  });
}));

// Get posts by user ID
router.get('/user/:userId', asyncHandler(async (req: AuthRequest, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Check if current user follows this user for privacy
  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: req.user!.id,
        followingId: userId
      }
    }
  });

  const isFollowing = !!existingFollow;

  const whereClause: any = {
    authorId: userId,
    isActive: true,
    OR: [
      { privacy: 'PUBLIC' },
      { authorId: req.user!.id },
      ...(isFollowing ? [{ privacy: 'FOLLOWERS_ONLY' }] : [])
    ]
  };

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true,
          university: { select: { name: true } }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      },
      likes: {
        where: { userId: req.user!.id },
        select: { id: true }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.post.count({ where: whereClause });

  res.json({
    success: true,
    posts: posts.map(post => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      privacy: post.privacy,
      isActive: post.isActive,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      isLiked: post.likes.length > 0,
      isFollowing,
      likes: post._count.likes,
      comments: post._count.comments
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get posts feed
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20, universityOnly = false, followingOnly = false } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Pre-fetch following IDs for privacy checks
  const following = await prisma.follow.findMany({
    where: { followerId: req.user!.id },
    select: { followingId: true }
  });
  const followingIds = new Set(following.map(u => u.followingId));

  const whereClause: any = {
    isActive: true,
    AND: [
      {
        OR: [
          { privacy: 'PUBLIC' },
          { authorId: req.user!.id },
          {
            AND: [
              { privacy: 'FOLLOWERS_ONLY' },
              { authorId: { in: followingIds } }
            ]
          }
        ]
      }
    ]
  };

  // If follow-only filter is active
  if (followingOnly === 'true') {
    whereClause.AND.push({
      authorId: { in: [...Array.from(followingIds), req.user!.id] }
    });
  } else if (universityOnly === 'true') {
    const userProfile = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { universityId: true }
    });
    if (userProfile?.universityId) {
      whereClause.AND.push({
        author: { universityId: userProfile.universityId }
      });
    }
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true,
          university: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      },
      likes: {
        where: {
          userId: req.user!.id
        },
        select: {
          id: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  // Get user roles to check if super admin
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  const isSuperAdmin = user?.roles.some(ur => ur.role.name === 'SUPER_ADMIN') || false;

  const total = await prisma.post.count({
    where: whereClause
  });



  res.json({
    success: true,
    posts: posts.map(post => ({
      id: post.id,
      content: post.content,
      imageUrl: post.imageUrl,
      videoUrl: post.videoUrl,
      privacy: post.privacy,
      isActive: post.isActive,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: post.author,
      isLiked: post.likes.length > 0,
      isFollowing: followingIds.has(post.author.id),
      likes: post._count.likes,
      comments: post._count.comments,
      canEdit: post.author.id === req.user!.id || isSuperAdmin,
      canDelete: post.author.id === req.user!.id || isSuperAdmin
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Create new post
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { content, imageUrl, videoUrl, privacy = 'PUBLIC' } = req.body;

  if (!content && !imageUrl && !videoUrl) {
    throw createError('Post content, image, or video is required', 400);
  }

  if (content && content.length > 2000) {
    throw createError('Post content cannot exceed 2000 characters', 400);
  }

  const post = await prisma.post.create({
    data: {
      content,
      imageUrl,
      videoUrl,
      privacy: privacy as any,
      authorId: req.user!.id
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true,
          university: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      }
    }
  });

  // Emit real-time update to followers
  const followers = await prisma.follow.findMany({
    where: { followingId: req.user!.id },
    select: { followerId: true }
  });

  followers.forEach(follower => {
    io.to(follower.followerId).emit('new-post', {
      ...post,
      isLiked: false,
      likes: 0,
      comments: 0
    });
  });

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    post: {
      ...post,
      isLiked: false,
      likes: 0,
      comments: 0
    }
  });
}));

// Get post by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true,
          university: {
            select: {
              name: true
            }
          }
        }
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              year: true
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      },
      likes: {
        where: {
          userId: req.user!.id
        },
        select: {
          id: true
        }
      }
    }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  res.json({
    success: true,
    post: {
      ...post,
      isLiked: post.likes.length > 0,
      likes: post._count.likes,
      comments: post._count.comments
    }
  });
}));

// Update post
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { content, imageUrl, videoUrl, privacy } = req.body;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  // Check if user is author or super admin
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  const isSuperAdmin = user?.roles.some(ur => ur.role.name === 'SUPER_ADMIN') || false;

  if (post.authorId !== req.user!.id && !isSuperAdmin) {
    throw createError('Not authorized to update this post', 403);
  }

  const updatedPost = await prisma.post.update({
    where: { id: id as string },
    data: {
      content,
      imageUrl,
      videoUrl,
      privacy: privacy as any
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true,
          university: {
            select: {
              name: true
            }
          }
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true
        }
      },
      likes: {
        where: {
          userId: req.user!.id
        },
        select: {
          id: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Post updated successfully',
    post: {
      ...updatedPost,
      isLiked: updatedPost.likes.length > 0,
      likes: updatedPost._count.likes,
      comments: updatedPost._count.comments
    }
  });
}));

// Delete post
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { authorId: true }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  // Check if user is author or super admin
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      roles: {
        include: {
          role: true
        }
      }
    }
  });

  const isSuperAdmin = user?.roles.some(ur => ur.role.name === 'SUPER_ADMIN') || false;

  if (post.authorId !== req.user!.id && !isSuperAdmin) {
    throw createError('Not authorized to delete this post', 403);
  }

  await prisma.post.update({
    where: { id: id as string },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

// Like/Unlike post
router.post('/:id/like', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: {
        userId: req.user!.id,
        postId: id
      }
    }
  });

  if (existingLike) {
    // Unlike
    await prisma.like.delete({
      where: {
        userId_postId: {
          userId: req.user!.id,
          postId: id
        }
      }
    });

    res.json({
      success: true,
      message: 'Post unliked',
      liked: false
    });
  } else {
    // Like
    await prisma.like.create({
      data: {
        userId: req.user!.id,
        postId: id
      }
    });

    // Send notification to post author
    if (post.authorId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: post.authorId,
          title: 'New Like',
          message: `${req.user!.firstName} ${req.user!.lastName} liked your post`,
          type: 'INFO'
        }
      });

      io.to(post.authorId).emit('notification', {
        title: 'New Like',
        message: `${req.user!.firstName} ${req.user!.lastName} liked your post`
      });
    }

    res.json({
      success: true,
      message: 'Post liked',
      liked: true
    });
  }
}));

// Add comment
router.post('/:id/comment', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw createError('Comment content is required', 400);
  }

  if (content.length > 500) {
    throw createError('Comment cannot exceed 500 characters', 400);
  }

  const post = await prisma.post.findUnique({
    where: { id },
    select: { id: true, authorId: true }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      authorId: req.user!.id,
      postId: id
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      }
    }
  });

  // Send notification to post author
  if (post.authorId !== req.user!.id) {
    await prisma.notification.create({
      data: {
        userId: post.authorId,
        title: 'New Comment',
        message: `${req.user!.firstName} ${req.user!.lastName} commented on your post`,
        type: 'INFO'
      }
    });

    io.to(post.authorId).emit('notification', {
      title: 'New Comment',
      message: `${req.user!.firstName} ${req.user!.lastName} commented on your post`
    });
  }

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    comment
  });
}));

// Get post comments
router.get('/:id/comments', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const comments = await prisma.comment.findMany({
    where: { postId: id as string },
    include: {
      author: {
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
    orderBy: { createdAt: 'asc' }
  });

  const total = await prisma.comment.count({
    where: { postId: id as string }
  });

  res.json({
    success: true,
    comments: comments.map(comment => ({
      ...comment,
      canEdit: comment.author.id === req.user!.id,
      canDelete: comment.author.id === req.user!.id
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Update comment
router.put('/comments/:commentId', asyncHandler(async (req: AuthRequest, res) => {
  const { commentId } = req.params as any;
  const { content } = req.body;

  if (!content || content.trim().length === 0) {
    throw createError('Comment content is required', 400);
  }

  if (content.length > 500) {
    throw createError('Comment cannot exceed 500 characters', 400);
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true }
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.authorId !== req.user!.id) {
    throw createError('Not authorized to update this comment', 403);
  }

  const updatedComment = await prisma.comment.update({
    where: { id: commentId as string },
    data: {
      content: content.trim()
    },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Comment updated successfully',
    comment: updatedComment
  });
}));

// Delete comment
router.delete('/comments/:commentId', asyncHandler(async (req: AuthRequest, res) => {
  const { commentId } = req.params as any;

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true }
  });

  if (!comment) {
    throw createError('Comment not found', 404);
  }

  if (comment.authorId !== req.user!.id) {
    throw createError('Not authorized to delete this comment', 403);
  }

  await prisma.comment.delete({
    where: { id: commentId }
  });

  res.json({
    success: true,
    message: 'Comment deleted successfully'
  });
}));

// Report post
router.post('/:id/report', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { reason } = req.body;

  const post: any = await prisma.post.findUnique({
    where: { id: id as string },
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  try {
    // Check if user already reported this post
    // Note: Column names in MySQL may be camelCase or snake_case depending on Prisma settings
    const existingReport = await prisma.$queryRaw`
      SELECT * FROM post_reports 
      WHERE postId = ${id} AND reporterId = ${req.user!.id}
      LIMIT 1
    ` as any[];

    if (existingReport && existingReport.length > 0) {
      throw createError('You have already reported this post', 400);
    }

    // Generate report ID
    const { randomBytes } = require('crypto');
    const reportId = `report_${Date.now()}_${randomBytes(4).toString('hex')}`;

    // Create report - handle case where table might not exist yet
    const reasonValue = reason || null;
    try {
      await prisma.$executeRaw`
        INSERT INTO post_reports (id, postId, reporterId, reason, status, createdAt, updatedAt)
        VALUES (${reportId}, ${id}, ${req.user!.id}, ${reasonValue}, 'PENDING', NOW(), NOW())
      `;
    } catch (dbError: any) {
      // Log the full error for debugging
      console.error('Database error when creating report:', dbError);
      // If table doesn't exist, provide helpful error message
      if (dbError.message && (dbError.message.includes("doesn't exist") ||
        dbError.message.includes("Unknown table") ||
        dbError.message.includes("Table") && dbError.message.includes("doesn't exist"))) {
        throw createError('Database table not found. Please run: npx prisma db push', 500);
      }
      // Check for column name errors
      if (dbError.message && dbError.message.includes("Unknown column")) {
        throw createError(`Database column error: ${dbError.message}. Please check your database schema.`, 500);
      }
      throw createError(`Database error: ${dbError.message || 'Failed to create report'}`, 500);
    }

    // Fetch the created report with related data
    let reportData = null;
    try {
      const report = await prisma.$queryRaw`
        SELECT pr.id, pr.postId, pr.reporterId, pr.reason, pr.status, pr.createdAt, pr.updatedAt,
               u1.firstName as author_firstName, u1.lastName as author_lastName,
               u2.firstName as reporter_firstName, u2.lastName as reporter_lastName, u2.email as reporter_email
        FROM post_reports pr
        JOIN posts p ON pr.postId = p.id
        JOIN users u1 ON p.authorId = u1.id
        JOIN users u2 ON pr.reporterId = u2.id
        WHERE pr.id = ${reportId}
        LIMIT 1
      ` as any[];

      reportData = report && report.length > 0 ? report[0] : null;
    } catch (queryError) {
      // If query fails, we still have the report created, just use basic data
      console.warn('Failed to fetch report details:', queryError);
    }

    // Find all super admins
    const superAdmins = await prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              name: 'SUPER_ADMIN'
            }
          }
        },
        isActive: true
      },
      select: {
        id: true,
        email: true
      }
    });

    // Send notification to all super admins
    const notificationPromises = superAdmins.map(admin =>
      prisma.notification.create({
        data: {
          userId: admin.id,
          title: 'Post Reported',
          message: `Post by ${(post as any).author.firstName} ${(post as any).author.lastName} has been reported by ${req.user!.firstName} ${req.user!.lastName}. Reason: ${reason || 'No reason provided'}`,
          type: 'WARNING'
        }
      })
    );

    await Promise.all(notificationPromises);

    // Emit real-time notification to super admins
    superAdmins.forEach(admin => {
      io.to(admin.id).emit('notification', {
        title: 'Post Reported',
        message: `Post by ${(post as any).author.firstName} ${(post as any).author.lastName} has been reported`,
        type: 'WARNING'
      });
    });

    res.status(201).json({
      success: true,
      message: 'Post reported successfully. Admin will review it shortly.',
      report: reportData || {
        id: reportId,
        postId: id,
        reporterId: req.user!.id,
        reason: reason || null,
        status: 'PENDING'
      }
    });
  } catch (error: any) {
    // Re-throw if it's already a createError
    if (error.statusCode) {
      throw error;
    }
    // Otherwise wrap in a generic error
    console.error('Error reporting post:', error);
    throw createError(error.message || 'Failed to report post. Please ensure database migration has been run.', 500);
  }
}));

export default router;

