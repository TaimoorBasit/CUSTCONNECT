import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest, authenticateToken, requireRole } from '../middleware/auth';
import { auditLog } from '../middleware/auditLog';

const router = express.Router();

// Get vendor's cafe (Cafe Owner only) - Only one cafe per owner
router.get('/cafe', authenticateToken, requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const userRoles = req.user!.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  // Cafe owners can only have ONE cafe assigned to them
  // Use raw SQL to ensure imageUrl is included even if Prisma client not regenerated
  let cafe: any;
  try {
    const whereClause = isSuperAdmin ? '1=1' : `ownerId = '${req.user!.id}'`;
    const cafeData = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, description, location, phone, email, imageUrl, openingHours, isActive,
        createdAt, updatedAt, universityId, ownerId
      FROM cafes
      WHERE ${whereClause}
      LIMIT 1
    `);

    if (cafeData && cafeData.length > 0) {
      cafe = cafeData[0];
      // Get university info
      if (cafe.universityId) {
        const university = await prisma.university.findUnique({
          where: { id: cafe.universityId },
          select: { id: true, name: true, city: true }
        });
        cafe.university = university;
      }
      // Get menus
      const menus = await prisma.cafeMenu.findMany({
        where: { cafeId: cafe.id },
        orderBy: { category: 'asc' }
      });
      cafe.menus = menus;
      // Get deals
      const deals = await prisma.cafeDeal.findMany({
        where: { cafeId: cafe.id },
        orderBy: { createdAt: 'desc' }
      });
      cafe.deals = deals;
    }
  } catch (error: any) {
    // Fallback to Prisma if raw query fails
    cafe = await prisma.cafe.findFirst({
      where: {
        ownerId: isSuperAdmin ? undefined : req.user!.id,
      },
      include: {
        university: {
          select: {
            id: true,
            name: true,
            city: true,
          },
        },
        menus: {
          orderBy: { category: 'asc' },
        },
        deals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  if (!cafe && !isSuperAdmin) {
    throw createError('No café assigned to your account. Please contact super admin.', 404);
  }

  res.json({
    success: true,
    cafe: cafe || null,
  });
}));

// Update cafe menu (Cafe Owner only)
router.put('/cafes/:id/menu', authenticateToken, requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { menus } = req.body;

  if (!menus || !Array.isArray(menus)) {
    throw createError('Menus array is required', 400);
  }

  const cafe = await prisma.cafe.findUnique({
    where: { id: id as string },
    select: { ownerId: true },
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  const isSuperAdmin = req.user!.roles.some((r: string) => r === 'SUPER_ADMIN');
  if (cafe.ownerId !== req.user!.id && !isSuperAdmin) {
    throw createError('Not authorized to update this café menu', 403);
  }

  // Create new menus using raw SQL to handle isFeatured column
  try {
    // Delete existing menus
    await prisma.cafeMenu.deleteMany({
      where: { cafeId: id as string },
    });

    // Create new menus with isFeatured
    for (const menu of menus) {
      try {
        await prisma.$executeRawUnsafe(`
          INSERT INTO cafe_menus (id, cafeId, name, description, price, category, imageUrl, isAvailable, isFeatured, createdAt, updatedAt)
          VALUES (UUID(), '${id}', '${(menu.name || '').replace(/'/g, "''")}', ${menu.description ? `'${(menu.description || '').replace(/'/g, "''")}'` : 'NULL'}, ${menu.price}, '${(menu.category || '').replace(/'/g, "''")}', ${menu.imageUrl ? `'${menu.imageUrl.replace(/'/g, "''")}'` : 'NULL'}, ${menu.isAvailable !== false ? 'true' : 'false'}, ${menu.isFeatured ? 'true' : 'false'}, NOW(), NOW())
        `);
      } catch (sqlError: any) {
        // Fallback to Prisma if raw SQL fails
        await (prisma as any).cafeMenu.create({
          data: {
            cafeId: id,
            name: menu.name,
            description: menu.description,
            price: menu.price,
            category: menu.category,
            imageUrl: menu.imageUrl,
            isAvailable: menu.isAvailable !== false,
            isFeatured: menu.isFeatured || false,
          },
        });
      }
    }

    const createdMenus = { count: menus.length };

    res.json({
      success: true,
      message: 'Café menu updated successfully',
      count: createdMenus.count,
    });
  } catch (error: any) {
    console.error('Error updating cafe menu:', error);
    throw createError(error.message || 'Failed to update cafe menu', 500);
  }
}));

// Update cafe deals (Cafe Owner only)
router.put('/cafes/:id/deals', authenticateToken, requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { deals } = req.body;

  if (!deals || !Array.isArray(deals)) {
    throw createError('Deals array is required', 400);
  }

  const cafe = await prisma.cafe.findUnique({
    where: { id: id as string },
    select: { ownerId: true },
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  const isSuperAdmin = req.user!.roles.some((r: string) => r === 'SUPER_ADMIN');
  if (cafe.ownerId !== req.user!.id && !isSuperAdmin) {
    throw createError('Not authorized to update this café deals', 403);
  }

  // Create new deals using raw SQL to handle menuItemIds column
  try {
    // Delete existing deals
    await prisma.cafeDeal.deleteMany({
      where: { cafeId: id as string },
    });

    // Create new deals with menuItemIds
    for (const deal of deals) {
      try {
        const menuItemIdsJson = deal.menuItemIds ? `'${deal.menuItemIds.replace(/'/g, "''")}'` : 'NULL';
        await prisma.$executeRawUnsafe(`
          INSERT INTO cafe_deals (id, cafeId, title, description, discount, menuItemIds, validFrom, validUntil, isActive, createdAt, updatedAt)
          VALUES (UUID(), '${id}', '${(deal.title || '').replace(/'/g, "''")}', ${deal.description ? `'${(deal.description || '').replace(/'/g, "''")}'` : 'NULL'}, ${deal.discount ? deal.discount : 'NULL'}, ${menuItemIdsJson}, '${deal.validFrom}', '${deal.validUntil}', ${deal.isActive !== false ? 'true' : 'false'}, NOW(), NOW())
        `);
      } catch (sqlError: any) {
        // Fallback to Prisma if raw SQL fails
        await (prisma as any).cafeDeal.create({
          data: {
            cafeId: id,
            title: deal.title,
            description: deal.description,
            discount: deal.discount,
            menuItemIds: deal.menuItemIds,
            validFrom: new Date(deal.validFrom),
            validUntil: new Date(deal.validUntil),
            isActive: deal.isActive !== false,
          },
        });
      }
    }

    const createdDeals = { count: deals.length };

    res.json({
      success: true,
      message: 'Café deals updated successfully',
      count: createdDeals.count,
    });
  } catch (error: any) {
    console.error('Error updating cafe deals:', error);
    throw createError(error.message || 'Failed to update cafe deals', 500);
  }
}));

// Note: Cafe owners cannot delete their assigned cafe - only super admin can unassign/reassign

// Get vendor's bus routes (Bus Operator only)
router.get('/buses', authenticateToken, requireRole(['BUS_OPERATOR', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  // Note: Bus routes don't have an ownerId field in the schema
  // This would need to be added or use a different approach
  // For now, returning all routes (should be filtered by university or assigned operator)
  const routes = await prisma.busRoute.findMany({
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      schedules: {
        orderBy: { dayOfWeek: 'asc' },
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  res.json({
    success: true,
    routes,
  });
}));

// Update bus route details (Bus Operator only)
router.put('/buses/:id', authenticateToken, requireRole(['BUS_OPERATOR', 'SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { busNumber, driverContactNumber, description } = req.body;

  const route = await prisma.busRoute.findUnique({
    where: { id: id as string },
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  const updateData: any = {};
  if (busNumber !== undefined) updateData.busNumber = busNumber;
  if (driverContactNumber !== undefined) updateData.driverContactNumber = driverContactNumber;
  if (description !== undefined) updateData.description = description;

  const updatedRoute = await prisma.busRoute.update({
    where: { id: id as string },
    data: updateData,
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true,
        },
      },
      schedules: {
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  });

  res.json({
    success: true,
    message: 'Bus route details updated successfully',
    route: updatedRoute,
  });
}));

// Update bus route schedule (Bus Operator only)
router.put('/buses/:id/schedule', authenticateToken, requireRole(['BUS_OPERATOR', 'SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { schedules } = req.body;

  if (!schedules || !Array.isArray(schedules)) {
    throw createError('Schedules array is required', 400);
  }

  const route = await prisma.busRoute.findUnique({
    where: { id: id as string },
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Delete existing schedules
  await prisma.busSchedule.deleteMany({
    where: { routeId: id as string },
  });

  // Create new schedules
  const createdSchedules = await prisma.busSchedule.createMany({
    data: schedules.map((schedule: any) => ({
      routeId: id as string,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    })),
  });

  res.json({
    success: true,
    message: 'Bus schedule updated successfully',
    count: createdSchedules.count,
  });
}));

// Send bus notification (Bus Operator only)
router.post('/buses/:id/notify', authenticateToken, requireRole(['BUS_OPERATOR', 'SUPER_ADMIN']), auditLog, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, message, type = 'INFO' } = req.body;

  if (!title || !message) {
    throw createError('Title and message are required', 400);
  }

  const route = await prisma.busRoute.findUnique({
    where: { id: id as string },
    include: {
      subscriptions: {
        select: { userId: true },
      },
    },
  });

  if (!route) {
    throw createError('Bus route not found', 404);
  }

  // Create notification
  const notification = await prisma.busNotification.create({
    data: {
      routeId: id as string,
      title,
      message,
      type: type as any,
    },
  });

  // Notify subscribers (would use Socket.io in production)
  res.json({
    success: true,
    message: 'Notification sent successfully',
    notification,
  });
}));

// Get vendor analytics (Cafe Owner / Bus Operator)
router.get('/analytics', authenticateToken, requireRole(['CAFE_OWNER', 'BUS_OPERATOR', 'SUPER_ADMIN', 'PRINTER_SHOP_OWNER']), asyncHandler(async (req: AuthRequest, res) => {
  const userRoles = req.user!.roles || [];
  const isCafeOwner = userRoles.includes('CAFE_OWNER');
  const isBusOperator = userRoles.includes('BUS_OPERATOR');
  const isPrinterShopOwner = userRoles.includes('PRINTER_SHOP_OWNER');
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  // Extract query params for filtering
  const { startDate, endDate, groupBy } = req.query as any; // groupBy: 'day' | 'month'

  let analytics: any = {};

  // Date filtering clause helper
  // Expects ISO strings from frontend or YYYY-MM-DD
  const getDateFilter = (tablePrefix: string) => {
    let filter = '';
    if (startDate) {
      // If it's a full ISO string, use it directly. Otherwise assume YYYY-MM-DD and append start time
      const start = startDate.toString().includes('T') ? `'${startDate}'` : `'${startDate} 00:00:00'`;
      filter += ` AND ${tablePrefix}.createdAt >= ${start}`;
    }
    if (endDate) {
      // If it's a full ISO string, use it directly. Otherwise assume YYYY-MM-DD and append end time
      const end = endDate.toString().includes('T') ? `'${endDate}'` : `'${endDate} 23:59:59'`;
      filter += ` AND ${tablePrefix}.createdAt <= ${end}`;
    }
    return filter;
  };

  if (isCafeOwner || isSuperAdmin) {
    // Cafe Owner Analytics
    try {
      // Get all cafes owned by user
      const cafes = await prisma.cafe.findMany({
        where: {
          ownerId: isSuperAdmin ? undefined : req.user!.id,
        },
        select: { id: true },
      });

      const cafeIds = cafes.map(c => c.id);

      if (cafeIds.length > 0) {
        // Get orders using raw SQL (in case Prisma client not regenerated)
        try {
          const dateFilter = getDateFilter('co');
          const ordersQuery = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              co.id,
              co.status,
              co.totalAmount,
              co.createdAt
            FROM cafe_orders co
            WHERE co.cafeId IN (${cafeIds.map(id => `'${id}'`).join(',')})
            ${dateFilter}
            ORDER BY co.createdAt DESC
          `);

          const totalOrders = ordersQuery.length;
          // FIX: Only count COMPLETED orders for revenue
          const totalRevenue = ordersQuery.reduce((sum, order) => {
            if (order.status === 'COMPLETED') {
              return sum + Number(order.totalAmount || 0);
            }
            return sum;
          }, 0);

          // Average order value based on completed orders
          const completedOrdersCount = ordersQuery.filter(o => o.status === 'COMPLETED').length;
          const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

          const ordersByStatus: any = {
            PENDING: 0,
            CONFIRMED: 0,
            PREPARING: 0,
            READY: 0,
            COMPLETED: 0,
            CANCELLED: 0,
          };

          ordersQuery.forEach((order: any) => {
            const status = order.status || 'PENDING';
            if (ordersByStatus.hasOwnProperty(status)) {
              ordersByStatus[status]++;
            }
          });

          const pendingOrders = ordersByStatus.PENDING + ordersByStatus.CONFIRMED + ordersByStatus.PREPARING;
          const completedOrders = ordersByStatus.COMPLETED;

          // Get top selling items
          const topItemsQuery = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              cm.name,
              SUM(coi.quantity) as totalQuantity,
              SUM(coi.quantity * coi.price) as totalRevenue
            FROM cafe_order_items coi
            JOIN cafe_menus cm ON coi.menuId = cm.id
            JOIN cafe_orders co ON coi.orderId = co.id
            WHERE co.cafeId IN (${cafeIds.map(id => `'${id}'`).join(',')})
              AND co.status = 'COMPLETED'
              ${dateFilter}
            GROUP BY cm.id, cm.name
            ORDER BY totalQuantity DESC
            LIMIT 10
          `);

          const topSellingItems = topItemsQuery.map((item: any) => ({
            name: item.name,
            quantity: Number(item.totalQuantity || 0),
            revenue: Number(item.totalRevenue || 0),
          }));

          // Calculate revenue over time for charts
          const revenueGroups: { [key: string]: number } = {};
          ordersQuery.forEach((order: any) => {
            // Only include completed orders in revenue
            if (order.status === 'COMPLETED') {
              const date = new Date(order.createdAt);
              let key = '';
              if (groupBy === 'year') {
                // Group by Month if showing yearly data
                key = date.toISOString().slice(0, 7); // YYYY-MM
              } else if (groupBy === 'month') {
                // Group by Day if showing monthly data
                key = date.toISOString().slice(0, 10); // YYYY-MM-DD
              } else if (groupBy === 'week') {
                // Group by Day if showing weekly data
                key = date.toISOString().slice(0, 10); // YYYY-MM-DD
              } else {
                // Default 'day' - could group by hour but keeping day for simplicity or multiple days selected
                key = date.toISOString().slice(0, 10);
              }
              revenueGroups[key] = (revenueGroups[key] || 0) + Number(order.totalAmount || 0);
            }
          });

          const revenueOverTime = Object.entries(revenueGroups)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));

          analytics = {
            totalOrders,
            totalRevenue,
            pendingOrders,
            completedOrders,
            averageOrderValue,
            topSellingItems,
            ordersByStatus,
            recentOrders: ordersQuery.slice(0, 5).map((o: any) => ({
              id: o.id,
              status: o.status,
              totalAmount: Number(o.totalAmount || 0),
              createdAt: o.createdAt,
            })),
            revenueOverTime // New field for charts
          };
        } catch (dbError: any) {
          console.warn('Error fetching cafe analytics:', dbError.message);
          // Return empty analytics if table doesn't exist
          analytics = {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            averageOrderValue: 0,
            topSellingItems: [],
            ordersByStatus: {
              PENDING: 0,
              CONFIRMED: 0,
              PREPARING: 0,
              READY: 0,
              COMPLETED: 0,
              CANCELLED: 0,
            },
            recentOrders: [],
            revenueOverTime: []
          };
        }
      } else {
        // No cafes found
        analytics = {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          ordersByStatus: {
            PENDING: 0,
            CONFIRMED: 0,
            PREPARING: 0,
            READY: 0,
            COMPLETED: 0,
            CANCELLED: 0,
          },
          recentOrders: [],
          revenueOverTime: []
        };
      }
    } catch (error: any) {
      console.error('Error in cafe analytics:', error);
      throw createError('Failed to fetch cafe analytics', 500);
    }
  } else if (isPrinterShopOwner) {
    // Printer Shop Analytics
    try {
      const shop = await prisma.printerShop.findFirst({
        where: { ownerId: req.user!.id }
      });

      if (shop) {
        // Get requests using raw SQL
        // Apply date filter
        let dateClause = '';
        if (startDate) {
          const start = startDate.toString().includes('T') ? `'${startDate}'` : `'${startDate} 00:00:00'`;
          dateClause += ` AND createdAt >= ${start}`;
        }
        if (endDate) {
          const end = endDate.toString().includes('T') ? `'${endDate}'` : `'${endDate} 23:59:59'`;
          dateClause += ` AND createdAt <= ${end}`;
        }

        const requestsQuery = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            id, status, price, createdAt, printType, copies, pages, fileName
          FROM print_requests
          WHERE printerShopId = '${shop.id}'
          ${dateClause}
          ORDER BY createdAt DESC
        `);

        const totalRequests = requestsQuery.length;
        // FIX: Only count COMPLETED/READY orders for revenue or non-cancelled? 
        // Usually revenue is realized when Paid/Completed. Assuming COMPLETED for consistency.
        const totalRevenue = requestsQuery.reduce((sum, req) => {
          if (req.status === 'COMPLETED') {
            return sum + Number(req.price || 0);
          }
          return sum;
        }, 0);

        const completedRequestsCount = requestsQuery.filter(r => r.status === 'COMPLETED').length;
        const averageOrderValue = completedRequestsCount > 0 ? totalRevenue / completedRequestsCount : 0;

        const requestsByStatus: any = {
          PENDING: 0,
          PROCESSING: 0,
          READY: 0,
          COMPLETED: 0,
          CANCELLED: 0
        };

        requestsQuery.forEach((req: any) => {
          const status = req.status || 'PENDING';
          if (requestsByStatus.hasOwnProperty(status)) {
            requestsByStatus[status]++;
          }
        });

        // Calculate top selling items (files)
        const itemCounts: { [key: string]: { quantity: number, revenue: number } } = {};
        requestsQuery.forEach((req: any) => {
          if (req.status !== 'COMPLETED') return; // Only completed count for revenue stats

          // Use fileName as "item name"
          const name = req.fileName || 'Unknown File';
          if (!itemCounts[name]) {
            itemCounts[name] = { quantity: 0, revenue: 0 };
          }
          itemCounts[name].quantity += (req.copies || 1);
          itemCounts[name].revenue += Number(req.price || 0);
        });

        const topSellingItems = Object.entries(itemCounts)
          .map(([name, data]) => ({
            name,
            quantity: data.quantity,
            revenue: data.revenue
          }))
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 10);

        // Calculate revenue over time
        const revenueGroups: { [key: string]: number } = {};
        requestsQuery.forEach((req: any) => {
          // Include only COMPLETED orders in revenue chart
          if (req.status === 'COMPLETED') {
            const date = new Date(req.createdAt);
            let key = '';
            if (groupBy === 'year') {
              key = date.toISOString().slice(0, 7); // YYYY-MM
            } else if (groupBy === 'month' || groupBy === 'week') {
              key = date.toISOString().slice(0, 10); // YYYY-MM-DD
            } else {
              key = date.toISOString().slice(0, 10);
            }
            revenueGroups[key] = (revenueGroups[key] || 0) + Number(req.price || 0);
          }
        });

        const revenueOverTime = Object.entries(revenueGroups)
          .map(([date, amount]) => ({ date, amount }))
          .sort((a, b) => a.date.localeCompare(b.date));


        analytics = {
          totalOrders: totalRequests, // Frontend expects totalOrders
          totalRevenue,
          pendingOrders: requestsByStatus.PENDING, // Frontend expects pendingOrders
          completedOrders: requestsByStatus.COMPLETED, // Frontend expects completedOrders
          averageOrderValue,
          topSellingItems,
          ordersByStatus: requestsByStatus,
          recentOrders: requestsQuery.slice(0, 5).map((r: any) => ({
            id: r.id,
            status: r.status,
            totalAmount: Number(r.price || 0), // Frontend expects totalAmount
            createdAt: r.createdAt
          })),
          revenueOverTime
        };
      } else {
        analytics = {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          averageOrderValue: 0,
          topSellingItems: [],
          ordersByStatus: { PENDING: 0, PROCESSING: 0, READY: 0, COMPLETED: 0, CANCELLED: 0 },
          recentOrders: [],
          revenueOverTime: []
        };
      }
    } catch (error: any) {
      console.error('Error in printer shop analytics:', error);
      throw createError('Failed to fetch printer shop analytics', 500);
    }
  } else if (isBusOperator) {
    // Bus Operator Analytics (placeholder)
    analytics = {
      totalRoutes: 0,
      totalSubscriptions: 0,
      activeRoutes: 0,
      revenueOverTime: []
    };
  }

  res.json({
    success: true,
    analytics,
  });
}));

export default router;

