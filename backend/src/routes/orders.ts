import express from 'express';
import { prisma, io } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { Decimal } from '@prisma/client/runtime/library';

const router = express.Router();

// Create order (Student)
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { cafeId, items, notes } = req.body;

  if (!cafeId || !items || !Array.isArray(items) || items.length === 0) {
    throw createError('Cafe ID and items are required', 400);
  }

  // Verify cafe exists
  const cafe = await prisma.cafe.findUnique({
    where: { id: cafeId as string },
    include: { owner: true }
  });

  if (!cafe || !cafe.isActive) {
    throw createError('Cafe not found or inactive', 404);
  }

  // Calculate total amount
  let totalAmount = new Decimal(0);
  const orderItems: Array<{
    menuId: string;
    quantity: number;
    price: number | Decimal;
    notes: string | null;
  }> = [];

  for (const item of items) {
    const menuItem = await prisma.cafeMenu.findUnique({
      where: { id: item.menuId as string }
    });

    if (!menuItem || !menuItem.isAvailable || menuItem.cafeId !== cafeId) {
      throw createError(`Menu item ${item.menuId} not found or unavailable`, 400);
    }

    const itemTotal = new Decimal(menuItem.price).times(item.quantity);
    totalAmount = totalAmount.plus(itemTotal);

    orderItems.push({
      menuId: item.menuId,
      quantity: item.quantity,
      price: menuItem.price,
      notes: item.notes || null
    });
  }

  // Create order - use raw SQL directly (more reliable than Prisma if client not regenerated)
  let order: any;

  // Generate order ID (CUID format)
  const orderId = `cl${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  const escapedNotes = (notes || '').replace(/'/g, "''").replace(/\\/g, '\\\\');
  const totalAmountNum = typeof totalAmount === 'object' && 'toNumber' in totalAmount
    ? totalAmount.toNumber()
    : Number(totalAmount);

  try {
    // Check if tables exist first
    const tableCheck = await prisma.$queryRawUnsafe<any[]>(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME IN ('cafe_orders', 'cafe_order_items')
    `);

    if (!tableCheck || tableCheck.length < 2) {
      throw createError('Order tables do not exist. Please run database migration.', 500);
    }

    // Create order using raw SQL with proper escaping
    const notesValue = escapedNotes ? `'${escapedNotes}'` : 'NULL';
    await prisma.$executeRawUnsafe(`
      INSERT INTO cafe_orders (id, cafeId, userId, totalAmount, notes, status, createdAt, updatedAt)
      VALUES ('${orderId}', '${cafeId}', '${req.user!.id}', ${totalAmountNum}, ${notesValue}, 'PENDING', NOW(), NOW())
    `);

    // Create order items
    for (const item of orderItems) {
      const itemId = `cl${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      const escapedItemNotes = (item.notes || '').replace(/'/g, "''").replace(/\\/g, '\\\\');
      const itemPrice = typeof item.price === 'object' && 'toNumber' in item.price
        ? item.price.toNumber()
        : Number(item.price);
      const itemNotesValue = escapedItemNotes ? `'${escapedItemNotes}'` : 'NULL';

      await prisma.$executeRawUnsafe(`
        INSERT INTO cafe_order_items (id, orderId, menuId, quantity, price, notes, createdAt)
        VALUES ('${itemId}', '${orderId}', '${item.menuId}', ${item.quantity}, ${itemPrice}, ${itemNotesValue}, NOW())
      `);
    }

    // Fetch created order with all details
    const orderData = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        co.id,
        co.status,
        co.totalAmount,
        co.notes,
        co.createdAt,
        co.updatedAt,
        co.cafeId,
        co.userId,
        JSON_OBJECT(
          'id', c.id,
          'name', c.name,
          'location', c.location
        ) as cafe,
        JSON_OBJECT(
          'id', u.id,
          'firstName', u.firstName,
          'lastName', u.lastName,
          'email', u.email
        ) as user
      FROM cafe_orders co
      LEFT JOIN cafes c ON co.cafeId = c.id
      LEFT JOIN users u ON co.userId = u.id
      WHERE co.id = '${orderId}'
    `);

    if (!orderData || orderData.length === 0) {
      throw createError('Failed to fetch created order', 500);
    }

    const orderRow = orderData[0];

    // Fetch order items
    const itemsData = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        coi.id,
        coi.quantity,
        coi.price,
        coi.notes,
        coi.menuId,
        JSON_OBJECT(
          'id', cm.id,
          'name', cm.name,
          'price', cm.price
        ) as menu
      FROM cafe_order_items coi
      LEFT JOIN cafe_menus cm ON coi.menuId = cm.id
      WHERE coi.orderId = '${orderId}'
    `);

    order = {
      id: orderRow.id,
      status: orderRow.status,
      totalAmount: orderRow.totalAmount,
      notes: orderRow.notes,
      createdAt: orderRow.createdAt,
      updatedAt: orderRow.updatedAt,
      cafeId: orderRow.cafeId,
      userId: orderRow.userId,
      cafe: typeof orderRow.cafe === 'string' ? JSON.parse(orderRow.cafe) : orderRow.cafe,
      user: typeof orderRow.user === 'string' ? JSON.parse(orderRow.user) : orderRow.user,
      items: (itemsData || []).map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        menuId: item.menuId,
        menu: typeof item.menu === 'string' ? JSON.parse(item.menu) : item.menu
      }))
    };
  } catch (error: any) {
    console.error('❌ Order creation failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });

    // Provide more specific error messages
    if (error.message?.includes('does not exist') || error.message?.includes('Unknown table')) {
      throw createError('Database tables not found. Please run: npx prisma db push', 500);
    }
    if (error.message?.includes('Unknown column')) {
      throw createError('Database schema mismatch. Please run: npx prisma db push', 500);
    }
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw createError('Order tables do not exist. Please run database migration.', 500);
    }

    throw createError(error.message || 'Failed to create order. Please try again.', 500);
  }

  // Notify cafe owner via Socket.io
  if (cafe.ownerId) {
    const customerName = order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Customer';
    const totalAmountStr = order.totalAmount?.toString() || totalAmount.toString();
    const itemCount = order.items?.length || orderItems.length;

    io.to(cafe.ownerId).emit('new-order', {
      orderId: order.id,
      cafeId: cafe.id,
      cafeName: cafe.name,
      customerName: customerName,
      totalAmount: totalAmountStr,
      itemCount: itemCount,
      createdAt: order.createdAt || new Date()
    });

    // Also create database notification using raw SQL as fallback
    try {
      await prisma.notification.create({
        data: {
          userId: cafe.ownerId,
          title: 'New Order Received',
          message: `New order from ${customerName} - Total: PKR ${totalAmountStr}`,
          type: 'INFO'
        }
      });
    } catch (notifError: any) {
      // Fallback to raw SQL if Prisma fails
      console.warn('⚠️  Prisma notification create failed, using raw SQL:', notifError.message);
      try {
        const escapedMessage = `New order from ${customerName} - Total: PKR ${totalAmountStr}`.replace(/'/g, "''");
        await prisma.$executeRawUnsafe(`
          INSERT INTO notifications (id, userId, title, message, type, isRead, createdAt, updatedAt)
          VALUES (UUID(), '${cafe.ownerId}', 'New Order Received', '${escapedMessage}', 'INFO', false, NOW(), NOW())
        `);
      } catch (sqlNotifError: any) {
        console.error('❌ Failed to create notification:', sqlNotifError.message);
        // Continue even if notification fails
      }
    }
  }

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order
  });
}));

// Get user's orders (Student)
router.get('/my-orders', asyncHandler(async (req: AuthRequest, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const whereClause: any = {
    userId: req.user!.id
  };

  if (status) {
    whereClause.status = status;
  }

  const orders = await (prisma as any).cafeOrder.findMany({
    where: whereClause,
    include: {
      cafe: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: Number(limit),
    skip: (Number(page) - 1) * Number(limit)
  });

  const total = await (prisma as any).cafeOrder.count({ where: whereClause });

  res.json({
    success: true,
    orders,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get orders for vendor (by ownerId) - works even if cafe is deleted
router.get('/vendor', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const userId = req.user!.id;
  const userRoles = req.user!.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  try {
    let orders: any[] = [];
    let total = 0;

    try {
      // Get cafe IDs owned by this user
      let cafeIds: string[] = [];

      if (isSuperAdmin) {
        // Super admin can see all orders
        const allCafes = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM cafes`);
        cafeIds = allCafes.map((c: any) => c.id);
      } else {
        // Get cafes owned by this user
        const userCafes = await prisma.$queryRawUnsafe<any[]>(`
          SELECT id FROM cafes WHERE ownerId = '${userId}'
        `);
        cafeIds = userCafes.map((c: any) => c.id);
      }

      if (cafeIds.length === 0) {
        return res.json({
          success: true,
          orders: [],
          pagination: { page: Number(page), limit: Number(limit), total: 0, pages: 0 }
        });
      }

      // Build status filter
      const statusFilter = status && status !== 'all' && status !== ''
        ? `AND co.status = '${status}'`
        : '';

      // Fetch orders for all cafes owned by this vendor
      const cafeIdsStr = cafeIds.map(id => `'${id}'`).join(',');
      const ordersQuery = await prisma.$queryRawUnsafe<any[]>(`
        SELECT 
          co.id,
          co.status,
          co.totalAmount,
          co.notes,
          co.createdAt,
          co.updatedAt,
          co.cafeId,
          JSON_OBJECT(
            'id', u.id,
            'firstName', u.firstName,
            'lastName', u.lastName,
            'email', u.email
          ) as user,
          JSON_OBJECT(
            'id', c.id,
            'name', COALESCE(c.name, 'Deleted Cafe'),
            'isActive', COALESCE(c.isActive, false)
          ) as cafe
        FROM cafe_orders co
        LEFT JOIN users u ON co.userId = u.id
        LEFT JOIN cafes c ON co.cafeId = c.id
        WHERE co.cafeId IN (${cafeIdsStr}) ${statusFilter}
        ORDER BY co.createdAt DESC
        LIMIT ${Number(limit)}
        OFFSET ${(Number(page) - 1) * Number(limit)}
      `);

      // Fetch order items for each order
      for (const order of ordersQuery) {
        try {
          const itemsQuery = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              coi.id,
              coi.quantity,
              coi.price,
              coi.notes,
              coi.menuId,
              JSON_OBJECT(
                'id', COALESCE(cm.id, 'deleted'),
                'name', COALESCE(cm.name, 'Item Deleted'),
                'price', COALESCE(cm.price, 0),
                'category', COALESCE(cm.category, 'Unknown')
              ) as menu
            FROM cafe_order_items coi
            LEFT JOIN cafe_menus cm ON coi.menuId = cm.id
            WHERE coi.orderId = '${order.id}'
          `);

          order.items = itemsQuery.map((item: any) => ({
            ...item,
            menu: typeof item.menu === 'string' ? JSON.parse(item.menu) : item.menu
          }));
        } catch (itemError) {
          order.items = [];
        }

        // Parse JSON fields
        order.user = typeof order.user === 'string' ? JSON.parse(order.user) : order.user;
        order.cafe = typeof order.cafe === 'string' ? JSON.parse(order.cafe) : order.cafe;
      }

      orders = ordersQuery;

      // Get total count
      const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
        SELECT COUNT(*) as count
        FROM cafe_orders co
        WHERE co.cafeId IN (${cafeIdsStr}) ${statusFilter}
      `);
      total = Number(countResult[0]?.count || 0);
    } catch (dbError: any) {
      console.warn('Database error fetching vendor orders:', dbError.message);
      orders = [];
      total = 0;
    }

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error in GET /orders/vendor:', error);
    throw error;
  }
}));

// Get cafe orders (Cafe Owner)
router.get('/cafe/:cafeId', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { cafeId } = req.params;
  const { status, page = 1, limit = 20 } = req.query;

  try {
    // Verify cafe ownership using raw SQL (more reliable)
    const userRoles = req.user!.roles || [];
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

    let cafe: any;
    try {
      const cafeData = await prisma.$queryRawUnsafe<any[]>(`
        SELECT id, ownerId, name
        FROM cafes
        WHERE id = '${cafeId}'
        LIMIT 1
      `);

      if (!cafeData || cafeData.length === 0) {
        throw createError('Cafe not found', 404);
      }

      cafe = cafeData[0];

      // Check authorization
      if (cafe.ownerId !== req.user!.id && !isSuperAdmin) {
        throw createError('Not authorized to view orders for this cafe', 403);
      }
    } catch (dbError: any) {
      if (dbError.statusCode) {
        throw dbError; // Re-throw createError
      }
      console.error('❌ Error checking cafe ownership:', dbError);
      throw createError('Failed to verify cafe ownership', 500);
    }

    const whereClause: any = { cafeId };

    if (status && status !== 'all' && status !== '') {
      whereClause.status = status;
    }

    // Use raw SQL to fetch orders (Prisma client may not be regenerated yet)
    let orders: any[] = [];
    let total = 0;

    try {
      // Check if orders table exists
      const tableCheck = await prisma.$queryRawUnsafe<any[]>(`
        SELECT TABLE_NAME 
        FROM information_schema.TABLES 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'cafe_orders'
      `);

      if (!tableCheck || tableCheck.length === 0) {
        console.warn('⚠️  cafe_orders table does not exist');
        orders = [];
        total = 0;
      } else {
        // Fetch orders with user info
        const statusFilter = status && status !== 'all' && status !== '' ? `AND co.status = '${status}'` : '';
        const ordersQuery = await prisma.$queryRawUnsafe<any[]>(`
          SELECT 
            co.id,
            co.status,
            co.totalAmount,
            co.notes,
            co.createdAt,
            co.updatedAt,
            co.cafeId,
            co.userId,
            JSON_OBJECT(
              'id', u.id,
              'firstName', u.firstName,
              'lastName', u.lastName,
              'email', u.email
            ) as user
          FROM cafe_orders co
          LEFT JOIN users u ON co.userId = u.id
          WHERE co.cafeId = '${cafeId}' ${statusFilter}
          ORDER BY co.createdAt DESC
          LIMIT ${Number(limit)}
          OFFSET ${(Number(page) - 1) * Number(limit)}
        `);

        // Fetch order items for each order
        for (const order of ordersQuery) {
          try {
            const itemsQuery = await prisma.$queryRawUnsafe<any[]>(`
            SELECT 
              coi.id,
              coi.quantity,
              coi.price,
              coi.notes,
              coi.menuId,
              JSON_OBJECT(
                'id', cm.id,
                'name', cm.name,
                'price', cm.price,
                'category', cm.category
              ) as menu
            FROM cafe_order_items coi
            LEFT JOIN cafe_menus cm ON coi.menuId = cm.id
            WHERE coi.orderId = '${order.id}'
          `);

            order.items = itemsQuery.map((item: any) => ({
              ...item,
              menu: typeof item.menu === 'string' ? JSON.parse(item.menu) : item.menu
            }));
          } catch (itemError) {
            order.items = [];
          }

          // Parse user JSON
          order.user = typeof order.user === 'string' ? JSON.parse(order.user) : order.user;
        }

        orders = ordersQuery;

        // Get total count
        const statusFilterCount = status && status !== 'all' && status !== '' ? `AND status = '${status}'` : '';
        const countResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`
          SELECT COUNT(*) as count
          FROM cafe_orders
          WHERE cafeId = '${cafeId}' ${statusFilterCount}
        `);
        total = Number(countResult[0]?.count || 0);
      }
    } catch (dbError: any) {
      // If table doesn't exist or other DB error, return empty results
      console.warn('Database error fetching orders:', dbError.message);
      orders = [];
      total = 0;
    }

    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error: any) {
    console.error('Error in GET /orders/cafe/:cafeId:', error);
    throw error;
  }
}));

// Update order status (Cafe Owner)
router.put('/:id/status', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { status } = req.body;

  if (!status || !['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].includes(status)) {
    throw createError('Valid status is required', 400);
  }

  const order = await (prisma as any).cafeOrder.findUnique({
    where: { id },
    include: {
      cafe: {
        select: {
          ownerId: true
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      }
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Check authorization
  if (order.cafe.ownerId !== req.user!.id && !req.user!.roles.includes('SUPER_ADMIN')) {
    throw createError('Not authorized to update this order', 403);
  }

  const updatedOrder = await (prisma as any).cafeOrder.update({
    where: { id },
    data: { status },
    include: {
      cafe: {
        select: {
          id: true,
          name: true,
          location: true
        }
      },
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      }
    }
  });

  // Notify student about status change
  io.to(order.userId).emit('order-status-updated', {
    orderId: order.id,
    status: status,
    cafeName: order.cafe.name
  });

  // Create notification for student
  await prisma.notification.create({
    data: {
      userId: order.userId,
      title: 'Order Status Updated',
      message: `Your order at ${order.cafe.name} is now ${status}`,
      type: 'INFO'
    }
  });

  res.json({
    success: true,
    message: 'Order status updated successfully',
    order: updatedOrder
  });
}));

// Get single order
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const order = await (prisma as any).cafeOrder.findUnique({
    where: { id },
    include: {
      cafe: {
        select: {
          id: true,
          name: true,
          location: true,
          phone: true,
          email: true
        }
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        }
      },
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true,
              category: true,
              description: true
            }
          }
        }
      }
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  // Check if user has access to this order
  const userRoles = req.user!.roles || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');
  const isCafeOwner = await prisma.cafe.findFirst({
    where: {
      id: order.cafeId,
      ownerId: req.user!.id
    }
  });

  if (order.userId !== req.user!.id && !isSuperAdmin && !isCafeOwner) {
    throw createError('Not authorized to view this order', 403);
  }

  res.json({
    success: true,
    order
  });
}));

// Cancel order (Student)
router.put('/:id/cancel', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const order = await (prisma as any).cafeOrder.findUnique({
    where: { id },
    include: {
      cafe: {
        select: {
          ownerId: true
        }
      }
    }
  });

  if (!order) {
    throw createError('Order not found', 404);
  }

  if (order.userId !== req.user!.id) {
    throw createError('Not authorized to cancel this order', 403);
  }

  if (['COMPLETED', 'CANCELLED'].includes(order.status)) {
    throw createError('Cannot cancel order in current status', 400);
  }

  const updatedOrder = await (prisma as any).cafeOrder.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: {
      cafe: {
        select: {
          id: true,
          name: true
        }
      },
      items: {
        include: {
          menu: {
            select: {
              id: true,
              name: true,
              price: true
            }
          }
        }
      }
    }
  });

  // Notify cafe owner
  if (order.cafe.ownerId) {
    io.to(order.cafe.ownerId).emit('order-cancelled', {
      orderId: order.id,
      cafeId: order.cafeId
    });

    await prisma.notification.create({
      data: {
        userId: order.cafe.ownerId,
        title: 'Order Cancelled',
        message: `Order #${order.id.substring(0, 8)} has been cancelled`,
        type: 'WARNING'
      }
    });
  }

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    order: updatedOrder
  });
}));

export default router;

