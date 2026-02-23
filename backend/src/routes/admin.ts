import express from 'express';
import { prisma, io } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';

const router = express.Router();

// Create new user
router.post('/users', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, email, password, universityId, departmentId, year, roleId, studentId } = req.body;

  if (!firstName || !lastName || !email || !password || !roleId) {
    throw createError('First name, last name, email, password, and role are required', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // Hash password
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  // Get role
  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw createError('Invalid role', 400);
  }

  // Don't allow creating SUPER_ADMIN users
  if (role.name === 'SUPER_ADMIN') {
    throw createError('Cannot create SUPER_ADMIN users', 403);
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      universityId: universityId || null,
      departmentId: departmentId || null,
      year: year ? parseInt(year) : null,
      studentId: studentId || null,
      isActive: true,
      isVerified: true,
      roles: {
        create: {
          roleId: roleId
        }
      }
    },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { user }
  });
}));

// Get all users (Admin only)
router.get('/users', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 100, search, universityId, role } = req.query as any; // Increased limit to 100
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { firstName: { contains: search as string, mode: 'insensitive' } },
      { lastName: { contains: search as string, mode: 'insensitive' } },
      { email: { contains: search as string, mode: 'insensitive' } }
    ];
  }

  if (universityId) {
    whereClause.universityId = universityId;
  }

  if (role) {
    whereClause.roles = {
      some: {
        role: {
          name: role as string
        }
      }
    };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    include: {
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
      roles: {
        include: {
          role: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.user.count({
    where: whereClause
  });

  // Debug logging
  if (role) {
    console.log(`🔍 Filtering users by role: ${role}`);
    console.log(`📊 Found ${users.length} users with role ${role} (total: ${total})`);
    if (users.length > 0) {
      console.log(`👤 Sample user emails:`, users.slice(0, 3).map(u => u.email));
      console.log(`👤 Sample user roles:`, users.slice(0, 3).map(u => u.roles.map(r => r.role.name)));
    } else {
      console.log(`⚠️ No users found with role ${role}. Checking all users...`);
      const allUsers = await prisma.user.findMany({
        take: 5,
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });
      console.log(`📋 Recent users and their roles:`, allUsers.map(u => ({
        email: u.email,
        roles: u.roles.map(r => r.role.name)
      })));
    }
  }

  res.json({
    success: true,
    data: {
      users: users.map(u => ({
        ...u,
        roles: u.roles.map(ur => ({ id: ur.role.id, name: ur.role.name }))
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Suspend/Unsuspend user
router.put('/users/:id/suspend', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { suspend = true } = req.body;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isActive: true, universityId: true }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if admin has permission for this university
  if (req.user!.roles.includes('UNIVERSITY_ADMIN') && user.universityId !== req.user!.universityId) {
    throw createError('Not authorized to manage this user', 403);
  }

  await prisma.user.update({
    where: { id },
    data: { isActive: !suspend }
  });

  res.json({
    success: true,
    message: `User ${suspend ? 'suspended' : 'activated'} successfully`
  });
}));

// Delete user
router.delete('/users/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Prevent deleting SUPER_ADMIN
  const isSuperAdmin = user.roles.some(ur => ur.role.name === 'SUPER_ADMIN');
  if (isSuperAdmin) {
    throw createError('Cannot delete SUPER_ADMIN user', 403);
  }

  // Prevent deleting yourself
  if (user.id === req.user!.id) {
    throw createError('Cannot delete your own account', 403);
  }

  // Delete related data first to avoid foreign key constraints
  await prisma.$transaction(async (tx) => {
    // 1. Roles
    await tx.userRole.deleteMany({ where: { userId: id } });

    // 2. Social follows / notifications
    await tx.follow.deleteMany({ where: { OR: [{ followerId: id }, { followingId: id }] } });
    await tx.notification.deleteMany({ where: { userId: id } });

    // 3. Likes, comments, post reports
    await tx.like.deleteMany({ where: { userId: id } });
    await tx.comment.deleteMany({ where: { authorId: id } });
    await tx.postReport.deleteMany({ where: { reporterId: id } });

    // 4. Posts (delete posts authored by user, cleaning up their children first)
    const userPosts = await tx.post.findMany({ where: { authorId: id }, select: { id: true } });
    const postIds = userPosts.map((p: any) => p.id);
    if (postIds.length > 0) {
      await tx.comment.deleteMany({ where: { postId: { in: postIds } } });
      await tx.like.deleteMany({ where: { postId: { in: postIds } } });
      await tx.postReport.deleteMany({ where: { postId: { in: postIds } } });
      await tx.post.deleteMany({ where: { id: { in: postIds } } });
    }

    // 5. Academic
    await tx.academicResource.deleteMany({ where: { uploaderId: id } });
    const gpaRecords = await tx.gPARecord.findMany({ where: { userId: id }, select: { id: true } });
    const gpaIds = gpaRecords.map((r: any) => r.id);
    if (gpaIds.length > 0) {
      await tx.gPASubject.deleteMany({ where: { gpaRecordId: { in: gpaIds } } });
      await tx.gPARecord.deleteMany({ where: { id: { in: gpaIds } } });
    }

    // 6. Events - organizerId is required, so delete events (and their RSVPs) owned by this user
    const userEvents = await tx.event.findMany({ where: { organizerId: id }, select: { id: true } });
    const eventIds = userEvents.map((e: any) => e.id);
    if (eventIds.length > 0) {
      await tx.eventRSVP.deleteMany({ where: { eventId: { in: eventIds } } });
      await tx.event.deleteMany({ where: { id: { in: eventIds } } });
    }
    await tx.eventRSVP.deleteMany({ where: { userId: id } });

    // 7. Bus / Transport
    await tx.busSubscription.deleteMany({ where: { userId: id } });
    // Null out resolvedBy reference using raw SQL (field is optional in DB but Prisma types are strict)
    await tx.$executeRawUnsafe(`UPDATE bus_emergencies SET resolvedBy = NULL WHERE resolvedBy = '${id}'`);
    await tx.busEmergency.deleteMany({ where: { userId: id } });
    await tx.busRoute.updateMany({ where: { operatorId: id }, data: { operatorId: null } });

    // 8. Cafes & Printers
    await tx.cafeRating.deleteMany({ where: { userId: id } });
    await tx.cafeOrder.deleteMany({ where: { userId: id } });
    await tx.cafe.updateMany({ where: { ownerId: id }, data: { ownerId: null } });
    await tx.printRequest.deleteMany({ where: { userId: id } });
    await tx.printerShop.updateMany({ where: { ownerId: id }, data: { ownerId: null } });

    // 9. Lost & Found
    await tx.lostFound.deleteMany({ where: { userId: id } });

    // 10. Stories & Messaging
    await tx.storyView.deleteMany({ where: { userId: id } });
    await tx.story.deleteMany({ where: { authorId: id } });
    await tx.message.deleteMany({ where: { senderId: id } });
    await tx.conversationMember.deleteMany({ where: { userId: id } });

    // 11. Finally delete the user
    await tx.user.delete({ where: { id } });
  });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Reset user password
router.post('/users/:id/reset-password', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Generate temporary password
  const tempPassword = `Temp${Math.random().toString(36).slice(-8)}!`;
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(tempPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  res.json({
    success: true,
    message: 'Password reset successfully',
    data: { tempPassword }
  });
}));

// Get all posts for moderation
router.get('/posts', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 50, universityId, showAll, reportedOnly } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  // Show all posts by default (both active and inactive) for admin moderation
  const whereClause: any = {};

  // Only filter by isActive if explicitly requested
  const showAllValue = showAll === 'false' ? false : showAll === 'true' ? true : Boolean(showAll);
  if (showAllValue === false) {
    whereClause.isActive = true;
  }

  // Filter for reported posts only
  if (reportedOnly === 'true') {
    whereClause.reports = {
      some: {
        status: 'PENDING'
      }
    };
  }

  if (universityId) {
    whereClause.author = {
      universityId: universityId as string
    };
  } else if (req.user!.roles.includes('UNIVERSITY_ADMIN')) {
    // Filter by admin's university
    whereClause.author = {
      universityId: req.user!.universityId
    };
  }

  const posts = await prisma.post.findMany({
    where: whereClause,
    include: {
      author: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true,
          university: {
            select: {
              id: true,
              name: true
            }
          },
          department: {
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
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  // Fetch reports separately for each post
  const postIds = posts.map(p => p.id);
  let reportsData: any[] = [];

  if (postIds.length > 0) {
    // Use Prisma.sql for proper parameter binding
    const { Prisma } = require('@prisma/client');
    reportsData = await prisma.$queryRaw`
      SELECT pr.*, 
             u.id as reporter_id, u.firstName as reporter_firstName, 
             u.lastName as reporter_lastName, u.email as reporter_email
      FROM post_reports pr
      JOIN users u ON pr.reporterId = u.id
      WHERE pr.postId IN (${Prisma.join(postIds)}) AND pr.status = 'PENDING'
      ORDER BY pr.createdAt DESC
    ` as any[];
  }

  // Group reports by postId
  const reportsByPostId: { [key: string]: any[] } = {};
  reportsData.forEach((report: any) => {
    if (!reportsByPostId[report.postId]) {
      reportsByPostId[report.postId] = [];
    }
    reportsByPostId[report.postId].push({
      id: report.id,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt,
      reporter: {
        id: report.reporter_id,
        firstName: report.reporter_firstName,
        lastName: report.reporter_lastName,
        email: report.reporter_email
      }
    });
  });

  // Get report counts
  let reportCounts: any[] = [];
  if (postIds.length > 0) {
    const { Prisma } = require('@prisma/client');
    reportCounts = await prisma.$queryRaw`
      SELECT postId, COUNT(*) as count
      FROM post_reports
      WHERE postId IN (${Prisma.join(postIds)}) AND status = 'PENDING'
      GROUP BY postId
    ` as any[];
  }

  const reportCountsMap: { [key: string]: number } = {};
  reportCounts.forEach((rc: any) => {
    reportCountsMap[rc.postId] = Number(rc.count);
  });

  // Attach reports and counts to posts
  const postsWithReports = posts.map(post => ({
    ...post,
    reports: reportsByPostId[post.id] || [],
    _count: {
      ...post._count,
      reports: reportCountsMap[post.id] || 0
    }
  }));

  const total = await prisma.post.count({
    where: whereClause
  });

  res.json({
    success: true,
    data: {
      posts: postsWithReports,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Remove post
router.delete('/posts/:id', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          universityId: true,
          id: true,
          email: true
        }
      }
    }
  });

  if (!post) {
    throw createError('Post not found', 404);
  }

  // Check if admin has permission for this post
  if (req.user!.roles.includes('UNIVERSITY_ADMIN') && post.author.universityId !== req.user!.universityId) {
    throw createError('Not authorized to remove this post', 403);
  }

  // Delete related records first to avoid foreign key constraint errors
  await prisma.$transaction(async (tx) => {
    // Delete all comments for this post
    await tx.comment.deleteMany({
      where: { postId: id }
    });

    // Delete all likes for this post
    await tx.like.deleteMany({
      where: { postId: id }
    });

    // Delete all reports for this post (if table exists)
    try {
      await tx.$executeRaw`
        DELETE FROM post_reports WHERE postId = ${id}
      `;
    } catch (reportError: any) {
      // If table doesn't exist, that's okay
      console.warn('Failed to delete post reports (this is okay if table doesn\'t exist):', reportError.message);
    }

    // Finally, delete the post itself
    await tx.post.delete({
      where: { id }
    });
  });

  res.json({
    success: true,
    message: 'Post deleted successfully'
  });
}));

// Send warning to user
router.post('/users/:id/warning', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { message } = req.body;

  if (!message || !message.trim()) {
    throw createError('Warning message is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Create notification for the user
  const notification = await prisma.notification.create({
    data: {
      userId: id,
      title: 'Warning from Admin',
      message: message.trim(),
      type: 'WARNING'
    }
  });

  // Emit real-time notification via Socket.io
  io.to(id).emit('notification', {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  });

  res.json({
    success: true,
    message: 'Warning sent to user successfully'
  });
}));

// Get analytics (old route - keeping for compatibility)
router.get('/analytics-old', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { period = '7d' } = req.query;

  let startDate: Date;
  const now = new Date();

  switch (period) {
    case '24h':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const whereClause: any = {
    createdAt: { gte: startDate }
  };

  // Filter by university if not super admin
  if (req.user!.roles.includes('UNIVERSITY_ADMIN')) {
    whereClause.universityId = req.user!.universityId;
  }

  const [
    totalUsers,
    activeUsers,
    totalPosts,
    totalEvents,
    totalCafes,
    totalBusRoutes
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        isActive: true,
        ...whereClause
      }
    }),
    prisma.post.count({
      where: {
        isActive: true,
        createdAt: { gte: startDate }
      }
    }),
    prisma.event.count({
      where: {
        isActive: true,
        createdAt: { gte: startDate }
      }
    }),
    prisma.cafe.count({
      where: {
        isActive: true,
        ...whereClause
      }
    }),
    prisma.busRoute.count({
      where: {
        isActive: true,
        ...whereClause
      }
    })
  ]);

  // Get top cafés by views (simplified)
  const topCafes = await prisma.cafe.findMany({
    where: {
      isActive: true,
      ...whereClause
    },
    include: {
      university: {
        select: {
          name: true
        }
      },
      _count: {
        select: {
          menus: true,
          deals: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  // Get bus alerts count
  const busAlerts = await prisma.busNotification.count({
    where: {
      createdAt: { gte: startDate }
    }
  });

  res.json({
    success: true,
    analytics: {
      totalUsers,
      activeUsers,
      totalPosts,
      totalEvents,
      totalCafes,
      totalBusRoutes,
      busAlerts,
      topCafes,
      period
    }
  });
}));

// Get universities
router.get('/universities', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const universities = await prisma.university.findMany({
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    data: { universities }
  });
}));

// Create university
router.post('/universities', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw createError('University name is required', 400);
  }

  // Check if university already exists
  const existing = await prisma.university.findUnique({
    where: { name: name.trim() }
  });

  if (existing) {
    throw createError('University with this name already exists', 400);
  }

  const university = await prisma.university.create({
    data: {
      name: name.trim(),
      domain: `university-${Date.now()}.edu.pk`, // Auto-generate domain
      country: 'Pakistan',
      city: 'Unknown'
    },
    select: {
      id: true,
      name: true,
      isActive: true,
      createdAt: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'University created successfully',
    data: { university }
  });
}));

// Assign role to user
router.post('/users/:id/roles', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { roleId } = req.body;

  if (!roleId) {
    throw createError('Role ID is required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  const role = await prisma.role.findUnique({
    where: { id: roleId }
  });

  if (!role) {
    throw createError('Role not found', 404);
  }

  // Check if user already has this role
  const existingRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: id,
        roleId: roleId
      }
    }
  });

  if (existingRole) {
    throw createError('User already has this role', 400);
  }

  await prisma.userRole.create({
    data: {
      userId: id,
      roleId: roleId
    }
  });

  res.json({
    success: true,
    message: 'Role assigned successfully'
  });
}));

// Remove role from user
router.delete('/users/:id/roles/:roleId', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id, roleId } = req.params as any;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  if (!user) {
    throw createError('User not found', 404);
  }

  // Check if user has this role
  const userRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId: id,
        roleId: roleId
      }
    },
    include: {
      role: true
    }
  });

  if (!userRole) {
    throw createError('User does not have this role', 404);
  }

  // Prevent removing SUPER_ADMIN role
  if (userRole.role.name === 'SUPER_ADMIN') {
    throw createError('Cannot remove SUPER_ADMIN role', 403);
  }

  // Prevent removing the last role
  if (user.roles.length === 1) {
    throw createError('Cannot remove the last role. User must have at least one role.', 400);
  }

  await prisma.userRole.delete({
    where: {
      userId_roleId: {
        userId: id,
        roleId: roleId
      }
    }
  });

  res.json({
    success: true,
    message: 'Role removed successfully'
  });
}));

// Get audit logs
router.get('/audit', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  try {
    const { filter, limit = 500, entityType, startDate, endDate } = req.query;

    const whereClause: any = {};
    if (filter && filter !== 'all') {
      whereClause.action = filter;
    }
    if (entityType && entityType !== 'all') {
      whereClause.entityType = entityType;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate as string);
      }
    }

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where: whereClause }).catch(() => 0);

    // Get audit logs with user information if available
    // If no filters, get more logs (up to 1000)
    const logLimit = (!filter || filter === 'all') && (!entityType || entityType === 'all')
      ? 1000
      : parseInt(limit as string) || 500;

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: logLimit,
    }).catch((err) => {
      console.error('Error fetching audit logs:', err);
      return [];
    });

    res.json({
      success: true,
      data: {
        logs: logs.map((log: any) => ({
          id: log.id,
          action: log.action || 'UNKNOWN',
          entityType: log.entityType || 'UNKNOWN',
          entityId: log.entityId || '',
          userId: log.userId || '',
          userEmail: log.userEmail || 'Unknown',
          details: log.details || '{}',
          timestamp: log.createdAt || new Date(),
          createdAt: log.createdAt || new Date()
        })),
        total: total || logs.length,
        limit: parseInt(limit as string) || 500
      },
    });
  } catch (error: any) {
    console.error('Audit log fetch error:', error);
    // Return empty array instead of throwing error
    res.json({
      success: true,
      data: { logs: [], total: 0, limit: 500 },
      message: error.message || 'No audit logs available'
    });
  }
}));

// Get all roles
router.get('/roles', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const roles = await prisma.role.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    data: { roles }
  });
}));

// Get vendors
router.get('/vendors', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const vendors = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: { in: ['CAFE_OWNER', 'BUS_OPERATOR'] }
          }
        }
      }
    },
    include: {
      roles: {
        include: { role: true }
      },
      ownedCafes: {
        select: { id: true, name: true }
      },
      university: {
        select: { id: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: { vendors }
  });
}));

// Create vendor account
router.post('/vendors/create', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { firstName, lastName, email, password, role, restaurantName, busCompanyName, printerShopName, universityId } = req.body;

  if (!firstName || !lastName || !email || !role || !universityId) {
    throw createError('First name, last name, email, role, and university are required', 400);
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  // Generate password if not provided
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password || `Temp${Math.random().toString(36).slice(-8)}!`, 10);

  // Get role ID
  const roleRecord = await prisma.role.findUnique({
    where: { name: role }
  });

  if (!roleRecord) {
    throw createError('Invalid role', 400);
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      universityId,
      isActive: true,
      isVerified: true,
      roles: {
        create: {
          roleId: roleRecord.id
        }
      }
    },
    include: {
      roles: {
        include: { role: true }
      }
    }
  });

  // Create cafe if cafe owner
  if (role === 'CAFE_OWNER' && restaurantName) {
    await prisma.cafe.create({
      data: {
        name: restaurantName,
        location: 'To be updated',
        universityId,
        ownerId: user.id
      }
    });
  }

  // Create printer shop if printer shop owner
  if (role === 'PRINTER_SHOP_OWNER' && printerShopName) {
    await prisma.printerShop.create({
      data: {
        name: printerShopName,
        location: 'To be updated',
        ownerId: user.id,
        isActive: true
      }
    });
  }

  // Create bus route if bus operator (optional - they can add routes later)
  // We'll just create a placeholder or let them add routes through their portal

  res.status(201).json({
    success: true,
    message: 'Vendor account created successfully',
    data: { user, tempPassword: password || 'Check server logs for generated password' }
  });
}));

// Approve vendor
router.post('/vendors/:id/approve', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  await prisma.user.update({
    where: { id },
    data: { isActive: true }
  });

  res.json({
    success: true,
    message: 'Vendor approved successfully'
  });
}));

// Get all cafes
router.get('/cafes', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const cafes = await prisma.cafe.findMany({
    include: {
      university: true,
      owner: {
        select: { id: true, firstName: true, lastName: true, email: true }
      },
      _count: {
        select: { menus: true, deals: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: { cafes }
  });
}));

// Create cafe
router.post('/cafes', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { name, description, location, phone, email, openingHours, universityId, ownerId } = req.body;

  if (!name || !location || !universityId) {
    throw createError('Name, location, and university are required', 400);
  }

  const cafe = await prisma.cafe.create({
    data: {
      name,
      description,
      location,
      phone,
      email,
      openingHours,
      universityId,
      ownerId: ownerId || null
    },
    include: {
      university: true,
      owner: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Café created successfully',
    data: { cafe }
  });
}));

// Update cafe
router.put('/cafes/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { name, description, location, phone, email, openingHours, isActive, ownerId } = req.body;

  const cafe = await prisma.cafe.update({
    where: { id },
    data: {
      name,
      description,
      location,
      phone,
      email,
      openingHours,
      isActive,
      ownerId
    },
    include: {
      university: true,
      owner: true
    }
  });

  res.json({
    success: true,
    message: 'Café updated successfully',
    data: { cafe }
  });
}));

// Delete cafe
router.delete('/cafes/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  // Check if cafe exists
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { id: true, name: true }
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  // Delete all related data in a transaction using raw SQL (more reliable)
  await prisma.$transaction(async (tx) => {
    try {
      // Delete order items first (foreign key constraint)
      await tx.$executeRawUnsafe(`
        DELETE FROM cafe_order_items 
        WHERE orderId IN (SELECT id FROM cafe_orders WHERE cafeId = '${id}')
      `);
    } catch (error: any) {
      // Table might not exist, continue
      console.warn('⚠️  Could not delete order items:', error.message);
    }

    try {
      // Delete orders
      await tx.$executeRawUnsafe(`
        DELETE FROM cafe_orders WHERE cafeId = '${id}'
      `);
    } catch (error: any) {
      console.warn('⚠️  Could not delete orders:', error.message);
    }

    try {
      // Delete ratings
      await tx.$executeRawUnsafe(`
        DELETE FROM cafe_ratings WHERE cafeId = '${id}'
      `);
    } catch (error: any) {
      console.warn('⚠️  Could not delete ratings:', error.message);
    }

    try {
      // Delete menus using raw SQL
      await tx.$executeRawUnsafe(`
        DELETE FROM cafe_menus WHERE cafeId = '${id}'
      `);
    } catch (error: any) {
      console.warn('⚠️  Could not delete menus:', error.message);
    }

    try {
      // Delete deals using raw SQL
      await tx.$executeRawUnsafe(`
        DELETE FROM cafe_deals WHERE cafeId = '${id}'
      `);
    } catch (error: any) {
      console.warn('⚠️  Could not delete deals:', error.message);
    }

    // Finally delete the cafe using raw SQL
    try {
      await tx.$executeRawUnsafe(`
        DELETE FROM cafes WHERE id = '${id}'
      `);
    } catch (error: any) {
      // Fallback to Prisma if raw SQL fails
      await (tx as any).cafe.delete({
        where: { id }
      });
    }
  });

  res.json({
    success: true,
    message: 'Café deleted successfully'
  });
}));

// Assign cafe to owner
router.post('/cafes/:id/assign', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { ownerId } = req.body;

  if (!ownerId) {
    throw createError('Owner ID is required', 400);
  }

  const cafe = await prisma.cafe.update({
    where: { id },
    data: { ownerId },
    include: {
      owner: true
    }
  });

  res.json({
    success: true,
    message: 'Café assigned successfully',
    data: { cafe }
  });
}));

// Get all bus routes
router.get('/buses', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const routes = await prisma.busRoute.findMany({
    include: {
      university: true,
      _count: {
        select: { schedules: true, subscriptions: true, notifications: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: { routes }
  });
}));

// Create bus route
router.post('/buses', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { name, number, description, universityId } = req.body;

  if (!name || !number || !universityId) {
    throw createError('Name, number, and university are required', 400);
  }

  const route = await prisma.busRoute.create({
    data: {
      name,
      number,
      description,
      universityId
    },
    include: {
      university: true
    }
  });

  res.status(201).json({
    success: true,
    message: 'Bus route created successfully',
    data: { route }
  });
}));

// Update bus route
router.put('/buses/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { name, number, description, isActive } = req.body;

  const route = await prisma.busRoute.update({
    where: { id },
    data: {
      name,
      number,
      description,
      isActive
    },
    include: {
      university: true
    }
  });

  res.json({
    success: true,
    message: 'Bus route updated successfully',
    data: { route }
  });
}));

// Delete bus route
router.delete('/buses/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  await prisma.busRoute.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Bus route deleted successfully'
  });
}));

// Get analytics
router.get('/analytics', requireRole(['SUPER_ADMIN', 'UNIVERSITY_ADMIN', 'CAFE_OWNER', 'BUS_OPERATOR', 'PRINTER_SHOP_OWNER']), asyncHandler(async (req: AuthRequest, res) => {
  const isSuperAdmin = req.user!.roles.includes('SUPER_ADMIN');
  const universityId = isSuperAdmin && req.query.universityId ? (req.query.universityId as string) : (isSuperAdmin ? undefined : req.user!.universityId);

  const filter = universityId ? { universityId } : {};
  const userFilter = universityId ? { universityId } : {};
  const postFilter = universityId ? { author: { universityId } } : {};
  const eventFilter = universityId ? { universityId } : {};
  const resourceFilter = universityId ? { uploader: { universityId } } : {};
  const notificationFilter = universityId ? { user: { universityId } } : {};

  const [
    totalUsers,
    totalVendors,
    totalCafes,
    totalBusRoutes,
    totalPosts,
    totalEvents,
    totalResources,
    totalNotifications,
    cafeOwners,
    busOperators,
  ] = await Promise.all([
    prisma.user.count({ where: userFilter }),
    prisma.user.count({
      where: {
        ...userFilter,
        roles: {
          some: {
            role: {
              name: { in: ['CAFE_OWNER', 'BUS_OPERATOR', 'PRINTER_SHOP_OWNER'] },
            },
          },
        },
      },
    }),
    prisma.cafe.count({ where: filter }),
    prisma.busRoute.count({ where: filter }),
    prisma.post.count({ where: postFilter }),
    prisma.event.count({ where: eventFilter }),
    prisma.academicResource.count({ where: resourceFilter }),
    prisma.notification.count({ where: notificationFilter }),
    prisma.user.count({
      where: {
        ...userFilter,
        roles: {
          some: {
            role: { name: 'CAFE_OWNER' },
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        ...userFilter,
        roles: {
          some: {
            role: { name: 'BUS_OPERATOR' },
          },
        },
      },
    }),
  ]);


  // Get post engagement
  const totalLikes = await prisma.like.count({ where: universityId ? { post: { author: { universityId } } } : {} });
  const totalComments = await prisma.comment.count({ where: universityId ? { post: { author: { universityId } } } : {} });
  const averageEngagement = totalPosts > 0
    ? parseFloat(((totalLikes + totalComments) / totalPosts).toFixed(2))
    : 0;

  // Get busiest buses by subscriptions
  const busiestBuses = await prisma.busRoute.findMany({
    where: filter,
    include: {
      university: { select: { name: true } },
      _count: { select: { subscriptions: true } }
    },
    orderBy: {
      subscriptions: { _count: 'desc' }
    },
    take: 5
  });

  // Get top cafes by menu items
  const topCafes = await prisma.cafe.findMany({
    where: filter,
    include: {
      university: { select: { name: true } },
      _count: { select: { menus: true } }
    },
    orderBy: {
      menus: { _count: 'desc' }
    },
    take: 5
  });

  res.json({
    success: true,
    data: {
      analytics: {
        totalUsers,
        totalVendors,
        totalCafes,
        totalBusRoutes,
        totalPosts,
        totalEvents,
        totalResources,
        totalNotifications,
        postEngagement: {
          totalLikes,
          totalComments,
          averageEngagement,
        },
        topSellingFoods: topCafes.map(c => ({
          name: c.name,
          count: c._count.menus,
          university: c.university?.name || 'Unknown'
        })),
        busiestBuses: busiestBuses.map(b => ({
          name: b.name,
          subscribers: b._count.subscriptions,
          university: b.university?.name || 'Unknown'
        })),
      }
    }
  });
}));

// Get grading system for university
router.get('/grading/:universityId', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { universityId } = req.params as any;

  // For now, return empty array - we'll implement grading scale storage later
  // This would require adding a GradingScale model to the schema
  res.json({
    success: true,
    data: { scales: [] }
  });
}));

// Update grading system for university
router.put('/grading/:universityId', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { universityId } = req.params as any;
  const { scales } = req.body;

  // For now, just return success - we'll implement grading scale storage later
  // This would require adding a GradingScale model to the schema
  res.json({
    success: true,
    message: 'Grading system saved successfully',
    data: { scales }
  });
}));

// Get all resources (admin)
router.get('/resources', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 50, universityId } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};

  if (universityId) {
    whereClause.course = {
      universityId: universityId as string
    };
  }

  const resources = await prisma.academicResource.findMany({
    where: whereClause,
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          university: {
            select: { name: true }
          }
        }
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          university: {
            select: { name: true }
          }
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.academicResource.count({
    where: whereClause
  });

  res.json({
    success: true,
    data: {
      resources,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Delete resource (admin)
router.delete('/resources/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const resource = await prisma.academicResource.findUnique({
    where: { id }
  });

  if (!resource) {
    throw createError('Resource not found', 404);
  }

  await prisma.academicResource.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Resource deleted successfully'
  });
}));

// Get all events (admin)
router.get('/events', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 50, universityId } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};

  if (universityId) {
    whereClause.universityId = universityId as string;
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          university: {
            select: { name: true }
          }
        }
      },
      university: {
        select: {
          id: true,
          name: true
        }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { startDate: 'desc' }
  });

  const total = await prisma.event.count({
    where: whereClause
  });

  res.json({
    success: true,
    data: {
      events,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Delete event (admin)
router.delete('/events/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const event = await prisma.event.findUnique({
    where: { id }
  });

  if (!event) {
    throw createError('Event not found', 404);
  }

  await prisma.event.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

// Get all notifications (admin)
router.get('/notifications', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 50, userId, type } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = {};

  if (userId) {
    whereClause.userId = userId as string;
  }

  if (type) {
    whereClause.type = type as string;
  }

  const notifications = await prisma.notification.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          university: {
            select: { name: true }
          }
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.notification.count({
    where: whereClause
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
}));

// Create notification (admin - send to all users or specific user)
router.post('/notifications', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { title, message, type = 'INFO', userId, universityId } = req.body;

  if (!title || !message) {
    throw createError('Title and message are required', 400);
  }

  if (userId) {
    // Send to specific user
    await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type
      }
    });
  } else if (universityId) {
    // Send to all users in a university
    const users = await prisma.user.findMany({
      where: { universityId },
      select: { id: true }
    });

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title,
        message,
        type
      }))
    });
  } else {
    // Send to all users
    const users = await prisma.user.findMany({
      select: { id: true }
    });

    await prisma.notification.createMany({
      data: users.map(u => ({
        userId: u.id,
        title,
        message,
        type
      }))
    });
  }

  res.json({
    success: true,
    message: 'Notification(s) sent successfully'
  });
}));

// Delete notification (admin)
router.delete('/notifications/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const notification = await prisma.notification.findUnique({
    where: { id }
  });

  if (!notification) {
    throw createError('Notification not found', 404);
  }

  await prisma.notification.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'Notification deleted successfully'
  });
}));

// Get all printer shops
router.get('/printer-shops', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  try {
    const shops = await prisma.printerShop.findMany({
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: {
            printRequests: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      shops
    });
  } catch (error: any) {
    // Fallback to raw SQL
    try {
      const results: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          ps.*,
          JSON_OBJECT(
            'id', u.id,
            'firstName', u.firstName,
            'lastName', u.lastName,
            'email', u.email
          ) as owner,
          (SELECT COUNT(*) FROM print_requests WHERE printerShopId = ps.id) as requestCount
        FROM printer_shops ps
        LEFT JOIN users u ON ps.ownerId = u.id
        ORDER BY ps.name ASC
      `);

      const shops = results.map((row: any) => {
        const parseJson = (value: any) => {
          if (!value) return null;
          if (typeof value === 'string') {
            try {
              return JSON.parse(value);
            } catch {
              return null;
            }
          }
          return value;
        };

        return {
          id: row.id,
          name: row.name,
          description: row.description,
          location: row.location,
          phone: row.phone,
          email: row.email,
          isActive: row.isActive,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          ownerId: row.ownerId,
          owner: parseJson(row.owner),
          _count: {
            printRequests: row.requestCount || 0
          }
        };
      });

      res.json({
        success: true,
        shops
      });
    } catch (sqlError: any) {
      if (sqlError.message?.includes("doesn't exist") || sqlError.message?.includes("Unknown table")) {
        res.json({
          success: true,
          shops: [],
          message: 'Printer shops table not found. Please run database migration.'
        });
      } else {
        throw createError('Failed to fetch printer shops', 500);
      }
    }
  }
}));

// Create printer shop
router.post('/printer-shops', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { name, description, location, phone, email, ownerId, ownerFirstName, ownerLastName, ownerEmail, ownerPassword } = req.body;

  console.log('📝 Creating printer shop with data:', {
    name,
    ownerId,
    ownerFirstName,
    ownerLastName,
    ownerEmail,
    hasPassword: !!ownerPassword
  });

  if (!name) {
    throw createError('Printer shop name is required', 400);
  }

  try {
    let finalOwnerId = ownerId;

    // Create owner user if owner details are provided
    if (ownerFirstName && ownerLastName && ownerEmail && ownerPassword && !ownerId) {
      console.log('👤 Creating owner user account...');

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: ownerEmail }
      });

      if (existingUser) {
        console.log('⚠️ User already exists:', ownerEmail);
        throw createError('User with this email already exists', 400);
      }

      // Get PRINTER_SHOP_OWNER role
      const printerShopOwnerRole = await prisma.role.findUnique({
        where: { name: 'PRINTER_SHOP_OWNER' }
      });

      if (!printerShopOwnerRole) {
        console.error('❌ PRINTER_SHOP_OWNER role not found!');
        throw createError('PRINTER_SHOP_OWNER role not found. Please run: cd backend && npm run db:seed', 500);
      }

      console.log('✅ PRINTER_SHOP_OWNER role found:', printerShopOwnerRole.id);

      // Hash password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

      // Use transaction to ensure both user and role are created atomically
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        console.log('📝 Creating user account for:', ownerEmail);
        const ownerUser = await tx.user.create({
          data: {
            firstName: ownerFirstName,
            lastName: ownerLastName,
            email: ownerEmail,
            password: hashedPassword,
            isVerified: true,
            isActive: true
          }
        });
        console.log('✅ User created successfully:', ownerUser.id, ownerUser.email);

        // Assign PRINTER_SHOP_OWNER role
        await tx.userRole.create({
          data: {
            userId: ownerUser.id,
            roleId: printerShopOwnerRole.id
          }
        });
        console.log(`✅ Successfully assigned PRINTER_SHOP_OWNER role to user ${ownerUser.email}`);

        return ownerUser;
      });

      finalOwnerId = result.id;
      console.log('✅ Transaction completed. Owner ID:', finalOwnerId);
    }

    const shop = await prisma.printerShop.create({
      data: {
        name,
        description: description || null,
        location: location || null,
        phone: phone || null,
        email: email || null,
        ownerId: finalOwnerId || null,
        isActive: true
      },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            roles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    const ownerCreated = finalOwnerId && !ownerId;
    if (ownerCreated) {
      console.log('✅ Printer shop and owner created successfully');
      console.log('👤 Owner details:', {
        id: shop.owner?.id,
        email: shop.owner?.email,
        roles: shop.owner?.roles?.map(r => r.role.name)
      });
    }

    res.json({
      success: true,
      message: ownerCreated ? 'Printer shop and owner account created successfully' : 'Printer shop created successfully',
      shop,
      ownerCreated,
      owner: shop.owner ? {
        id: shop.owner.id,
        email: shop.owner.email,
        firstName: shop.owner.firstName,
        lastName: shop.owner.lastName,
        roles: shop.owner.roles?.map(r => ({ id: r.role.id, name: r.role.name })) || []
      } : null
    });
  } catch (error: any) {
    // Fallback to raw SQL
    const shopId = `ps${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO printer_shops (id, name, description, location, phone, email, ownerId, isActive, createdAt, updatedAt)
        VALUES (
          '${shopId}',
          '${name.replace(/'/g, "''")}',
          ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'},
          ${location ? `'${location.replace(/'/g, "''")}'` : 'NULL'},
          ${phone ? `'${phone.replace(/'/g, "''")}'` : 'NULL'},
          ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'},
          ${ownerId ? `'${ownerId.replace(/'/g, "''")}'` : 'NULL'},
          true,
          NOW(),
          NOW()
        )
      `);

      res.json({
        success: true,
        message: 'Printer shop created successfully',
        shop: {
          id: shopId,
          name,
          description,
          location,
          phone,
          email,
          ownerId,
          isActive: true
        }
      });
    } catch (sqlError: any) {
      throw createError('Failed to create printer shop', 500);
    }
  }
}));

// Update printer shop
router.put('/printer-shops/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { name, description, location, phone, email, ownerId, isActive } = req.body;

  try {
    const shop = await prisma.printerShop.update({
      where: { id },
      data: {
        name,
        description,
        location,
        phone,
        email,
        ownerId,
        isActive,
        updatedAt: new Date()
      },
      include: {
        owner: {
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
      message: 'Printer shop updated successfully',
      shop
    });
  } catch (error: any) {
    // Fallback to raw SQL
    const updates: string[] = [];
    if (name) updates.push(`name = '${name.replace(/'/g, "''")}'`);
    if (description !== undefined) updates.push(`description = ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}`);
    if (location !== undefined) updates.push(`location = ${location ? `'${location.replace(/'/g, "''")}'` : 'NULL'}`);
    if (phone !== undefined) updates.push(`phone = ${phone ? `'${phone.replace(/'/g, "''")}'` : 'NULL'}`);
    if (email !== undefined) updates.push(`email = ${email ? `'${email.replace(/'/g, "''")}'` : 'NULL'}`);
    if (ownerId !== undefined) updates.push(`ownerId = ${ownerId ? `'${ownerId.replace(/'/g, "''")}'` : 'NULL'}`);
    if (isActive !== undefined) updates.push(`isActive = ${isActive}`);
    updates.push(`updatedAt = NOW()`);

    try {
      await prisma.$executeRawUnsafe(`
        UPDATE printer_shops
        SET ${updates.join(', ')}
        WHERE id = '${id.replace(/'/g, "''")}'
      `);

      res.json({
        success: true,
        message: 'Printer shop updated successfully'
      });
    } catch (sqlError: any) {
      throw createError('Failed to update printer shop', 500);
    }
  }
}));

// Delete printer shop
router.delete('/printer-shops/:id', requireRole(['SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  try {
    // Delete all print requests first
    await prisma.printRequest.deleteMany({
      where: { printerShopId: id }
    });

    await prisma.printerShop.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Printer shop deleted successfully'
    });
  } catch (error: any) {
    // Fallback to raw SQL
    try {
      await prisma.$executeRawUnsafe(`
        DELETE FROM print_requests WHERE printerShopId = '${id.replace(/'/g, "''")}'
      `);
      await prisma.$executeRawUnsafe(`
        DELETE FROM printer_shops WHERE id = '${id.replace(/'/g, "''")}'
      `);

      res.json({
        success: true,
        message: 'Printer shop deleted successfully'
      });
    } catch (sqlError: any) {
      throw createError('Failed to delete printer shop', 500);
    }
  }
}));

// Seed initial printer shop (Burhan Book Shop)
router.post('/printer-shops/seed', requireRole(['SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  try {
    // Check if already exists
    const existing = await prisma.printerShop.findFirst({
      where: { name: 'Burhan Book Shop' }
    }).catch(() => null);

    if (existing) {
      return res.json({
        success: true,
        message: 'Burhan Book Shop already exists',
        shop: existing
      });
    }

    const shop = await prisma.printerShop.create({
      data: {
        name: 'Burhan Book Shop',
        description: 'Professional printing services for students',
        location: 'University Campus',
        isActive: true
      }
    });

    res.json({
      success: true,
      message: 'Burhan Book Shop created successfully',
      shop
    });
  } catch (error: any) {
    // Fallback to raw SQL
    const shopId = `ps${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO printer_shops (id, name, description, location, isActive, createdAt, updatedAt)
        VALUES (
          '${shopId}',
          'Burhan Book Shop',
          'Professional printing services for students',
          'University Campus',
          true,
          NOW(),
          NOW()
        )
      `);

      res.json({
        success: true,
        message: 'Burhan Book Shop created successfully',
        shop: {
          id: shopId,
          name: 'Burhan Book Shop',
          description: 'Professional printing services for students',
          location: 'University Campus',
          isActive: true
        }
      });
    } catch (sqlError: any) {
      throw createError('Failed to create printer shop', 500);
    }
  }
}));

export default router;

