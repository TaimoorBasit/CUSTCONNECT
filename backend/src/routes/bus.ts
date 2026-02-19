import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Get all bus routes
router.get('/routes', asyncHandler(async (req: AuthRequest, res) => {
  const { universityId } = req.query;

  const whereClause: any = { isActive: true };

  if (universityId) {
    whereClause.universityId = universityId;
  } else {
    // Get user's university routes
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { universityId: true }
    });

    if (user?.universityId) {
      whereClause.universityId = user.universityId;
    }
  }

  const routes = await prisma.busRoute.findMany({
    where: whereClause,
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      operator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true
        }
      },
      schedules: {
        orderBy: { dayOfWeek: 'asc' }
      },
      notifications: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      _count: {
        select: {
          subscriptions: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    routes
  });
}));

// Get specific bus route
router.get('/routes/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const route = await prisma.busRoute.findUnique({
    where: { id },
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      operator: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          profileImage: true
        }
      },
      schedules: {
        orderBy: { dayOfWeek: 'asc' }
      },
      notifications: {
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
      },
      subscriptions: {
        where: { userId: req.user!.id },
        select: { id: true }
      },
      _count: {
        select: {
          subscriptions: true
        }
      }
    }
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  res.json({
    success: true,
    route: {
      ...route,
      isSubscribed: route.subscriptions.length > 0
    }
  });
}));

// Subscribe to bus route
router.post('/routes/:id/subscribe', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const route = await prisma.busRoute.findUnique({
    where: { id }
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Check if already subscribed
  const existingSubscription = await prisma.busSubscription.findUnique({
    where: {
      userId_routeId: {
        userId: req.user!.id,
        routeId: id
      }
    }
  });

  if (existingSubscription) {
    throw createError('Already subscribed to this route', 400);
  }

  await prisma.busSubscription.create({
    data: {
      userId: req.user!.id,
      routeId: id
    }
  });

  res.json({
    success: true,
    message: 'Successfully subscribed to bus route'
  });
}));

// Unsubscribe from bus route
router.delete('/routes/:id/subscribe', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const subscription = await prisma.busSubscription.findUnique({
    where: {
      userId_routeId: {
        userId: req.user!.id,
        routeId: id
      }
    }
  });

  if (!subscription) {
    throw createError('Not subscribed to this route', 400);
  }

  await prisma.busSubscription.delete({
    where: {
      userId_routeId: {
        userId: req.user!.id,
        routeId: id
      }
    }
  });

  res.json({
    success: true,
    message: 'Successfully unsubscribed from bus route'
  });
}));

// Report bus emergency
router.post('/emergency', asyncHandler(async (req: AuthRequest, res) => {
  const { routeId, type, title, description, location, priority } = req.body;

  if (!routeId || !type || !title || !description) {
    throw createError('Route ID, type, title, and description are required', 400);
  }

  const route = await prisma.busRoute.findUnique({
    where: { id: routeId },
    include: {
      university: {
        select: {
          name: true
        }
      }
    }
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Determine priority based on type if not provided
  let emergencyPriority = priority || 'MEDIUM';
  if (type === 'ACCIDENT' || type === 'SAFETY_CONCERN') {
    emergencyPriority = 'CRITICAL';
  } else if (type === 'BREAKDOWN' || type === 'DRIVER_ISSUE') {
    emergencyPriority = 'HIGH';
  }

  // Create emergency report
  const emergency = await prisma.busEmergency.create({
    data: {
      routeId,
      userId: req.user!.id,
      type: type as any,
      title,
      description,
      location: location || null,
      priority: emergencyPriority as any,
      status: 'PENDING'
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      route: {
        select: {
          id: true,
          name: true,
          number: true,
          busNumber: true,
          driverContactNumber: true
        }
      }
    }
  });

  // Notify all bus operators and super admins
  const busOperators = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: { in: ['BUS_OPERATOR', 'SUPER_ADMIN'] }
          }
        }
      }
    },
    select: { id: true }
  });

  // Create database notifications
  const notificationPromises = busOperators.map(operator =>
    prisma.notification.create({
      data: {
        userId: operator.id,
        title: `🚨 Emergency: ${title}`,
        message: `${emergency.user.firstName} ${emergency.user.lastName} reported: ${description} on Route ${route.number} - ${route.name}`,
        type: emergencyPriority === 'CRITICAL' ? 'ERROR' : 'WARNING'
      }
    })
  );

  await Promise.all(notificationPromises);

  // Emit real-time notifications
  busOperators.forEach(operator => {
    io.to(operator.id).emit('bus-emergency', {
      id: emergency.id,
      type: emergency.type,
      title: emergency.title,
      description: emergency.description,
      priority: emergency.priority,
      route: {
        name: route.name,
        number: route.number,
        busNumber: route.busNumber
      },
      reporter: {
        name: `${emergency.user.firstName} ${emergency.user.lastName}`,
        email: emergency.user.email
      },
      createdAt: emergency.createdAt
    });
  });

  res.json({
    success: true,
    message: 'Emergency reported successfully. Help is on the way!',
    emergency
  });
}));

// Get emergency reports (for admins and bus operators)
router.get('/emergencies', requireRole(['SUPER_ADMIN', 'BUS_OPERATOR']), asyncHandler(async (req: AuthRequest, res) => {
  const { status, priority, routeId } = req.query;

  try {
    // Try Prisma first
    const whereClause: any = {};

    if (status) {
      whereClause.status = status;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    if (routeId) {
      whereClause.routeId = routeId;
    }

    const emergencies = await prisma.busEmergency.findMany({
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
        route: {
          select: {
            id: true,
            name: true,
            number: true,
            busNumber: true,
            driverContactNumber: true
          }
        },
        resolvedByUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      emergencies
    });
  } catch (error: any) {
    // Fallback to raw SQL if Prisma client not regenerated
    console.error('Prisma error, trying raw SQL:', error);

    try {
      let whereConditions: string[] = [];

      if (status) {
        whereConditions.push(`e.status = '${String(status).replace(/'/g, "''")}'`);
      }

      if (priority) {
        whereConditions.push(`e.priority = '${String(priority).replace(/'/g, "''")}'`);
      }

      if (routeId) {
        whereConditions.push(`e.routeId = '${String(routeId).replace(/'/g, "''")}'`);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          e.*,
          JSON_OBJECT(
            'id', u.id,
            'firstName', u.firstName,
            'lastName', u.lastName,
            'email', u.email
          ) as user,
          JSON_OBJECT(
            'id', r.id,
            'name', r.name,
            'number', r.number,
            'busNumber', r.busNumber,
            'driverContactNumber', r.driverContactNumber
          ) as route,
          CASE 
            WHEN e.resolvedBy IS NOT NULL THEN
              JSON_OBJECT(
                'id', ru.id,
                'firstName', ru.firstName,
                'lastName', ru.lastName
              )
            ELSE NULL
          END as resolvedByUser
        FROM bus_emergencies e
        LEFT JOIN users u ON e.userId = u.id
        LEFT JOIN bus_routes r ON e.routeId = r.id
        LEFT JOIN users ru ON e.resolvedBy = ru.id
        ${whereClause}
        ORDER BY 
          CASE e.priority
            WHEN 'CRITICAL' THEN 4
            WHEN 'HIGH' THEN 3
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW' THEN 1
            ELSE 0
          END DESC,
          e.createdAt DESC
      `;

      const results: any[] = await prisma.$queryRawUnsafe(query);

      const emergencies = results.map((row: any) => {
        // Helper to parse JSON safely
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
          type: row.type,
          title: row.title,
          description: row.description,
          location: row.location,
          status: row.status,
          priority: row.priority,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          resolvedAt: row.resolvedAt,
          resolvedBy: row.resolvedBy,
          notes: row.notes,
          userId: row.userId,
          routeId: row.routeId,
          user: parseJson(row.user),
          route: parseJson(row.route),
          resolvedByUser: parseJson(row.resolvedByUser)
        };
      });

      res.json({
        success: true,
        emergencies
      });
    } catch (sqlError: any) {
      console.error('Raw SQL error:', sqlError);
      // Check if table doesn't exist
      if (sqlError.message?.includes("doesn't exist") || sqlError.message?.includes("Unknown table")) {
        res.json({
          success: true,
          emergencies: [],
          message: 'Emergency reports table not found. Please run database migration.'
        });
      } else {
        throw createError('Failed to fetch emergency reports', 500);
      }
    }
  }
}));

// Update emergency status (for admins and bus operators)
router.put('/emergencies/:id/status', requireRole(['SUPER_ADMIN', 'BUS_OPERATOR']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    throw createError('Status is required', 400);
  }

  const updateData: any = {
    status: status as any,
    updatedAt: new Date()
  };

  if (status === 'RESOLVED') {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = req.user!.id;
  }

  if (notes) {
    updateData.notes = notes;
  }

  const emergency = await prisma.busEmergency.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      route: {
        select: {
          id: true,
          name: true,
          number: true
        }
      }
    }
  });

  // Notify the reporter if resolved
  if (status === 'RESOLVED') {
    await prisma.notification.create({
      data: {
        userId: emergency.userId,
        title: 'Emergency Resolved',
        message: `Your emergency report "${emergency.title}" on Route ${emergency.route.number} has been resolved.`,
        type: 'SUCCESS'
      }
    });

    io.to(emergency.userId).emit('notification', {
      title: 'Emergency Resolved',
      message: `Your emergency report "${emergency.title}" has been resolved.`,
      type: 'SUCCESS'
    });
  }

  res.json({
    success: true,
    message: 'Emergency status updated successfully',
    emergency
  });
}));

// Report bus issue (legacy endpoint - kept for backward compatibility)
router.post('/routes/:id/report', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { issue, description } = req.body;

  if (!issue || !description) {
    throw createError('Issue type and description are required', 400);
  }

  const route = await prisma.busRoute.findUnique({
    where: { id },
    include: {
      university: {
        select: {
          name: true
        }
      }
    }
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Create notification for bus operators
  await prisma.busNotification.create({
    data: {
      routeId: id,
      title: `Bus Issue Report - ${issue}`,
      message: `Reported by ${req.user!.firstName} ${req.user!.lastName}: ${description}`,
      type: 'WARNING'
    }
  });

  // Notify all bus operators
  const busOperators = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: 'BUS_OPERATOR'
          }
        }
      }
    },
    select: { id: true }
  });

  busOperators.forEach(operator => {
    io.to(operator.id).emit('bus-issue', {
      route: route.name,
      issue,
      description,
      reporter: `${req.user!.firstName} ${req.user!.lastName}`
    });
  });

  res.json({
    success: true,
    message: 'Issue reported successfully'
  });
}));

// Update bus route status (Bus Operator only)
router.put('/routes/:id/status', requireRole(['BUS_OPERATOR', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, message, type = 'INFO' } = req.body;

  if (!title || !message) {
    throw createError('Title and message are required', 400);
  }

  const route = await prisma.busRoute.findUnique({
    where: { id },
    include: {
      subscriptions: {
        select: { userId: true }
      }
    }
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Create notification
  const notification = await prisma.busNotification.create({
    data: {
      routeId: id,
      title,
      message,
      type: type as any
    }
  });

  // Notify all subscribers
  const subscriberIds = route.subscriptions.map(sub => sub.userId);

  // Send in-app notifications
  await prisma.notification.createMany({
    data: subscriberIds.map(userId => ({
      userId,
      title: `Bus Alert: ${title}`,
      message: `${route.name} - ${message}`,
      type: 'BUS_ALERT'
    }))
  });

  // Send real-time notifications
  subscriberIds.forEach(userId => {
    io.to(userId).emit('bus-alert', {
      route: route.name,
      title,
      message,
      type
    });
  });

  res.json({
    success: true,
    message: 'Bus status updated successfully',
    notification
  });
}));

// Get user's subscribed routes
router.get('/my-routes', asyncHandler(async (req: AuthRequest, res) => {
  const subscriptions = await prisma.busSubscription.findMany({
    where: { userId: req.user!.id },
    include: {
      route: {
        include: {
          university: {
            select: {
              id: true,
              name: true,
              city: true
            }
          },
          schedules: {
            orderBy: { dayOfWeek: 'asc' }
          },
          notifications: {
            where: { isActive: true },
            orderBy: { createdAt: 'desc' },
            take: 3
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    routes: subscriptions.map(sub => sub.route)
  });
}));

export default router;

