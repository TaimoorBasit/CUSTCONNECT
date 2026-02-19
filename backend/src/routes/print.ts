import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { upload, getFileUrl } from '../utils/upload';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for print document uploads
const printStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'prints');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `print-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const printUpload = multer({
  storage: printStorage,
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX, images
    const allowedTypes = /pdf|doc|docx|jpg|jpeg|png|gif|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, images, and TXT files are allowed.'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Get all active printer shops (for students)
router.get('/shops', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const shops = await prisma.printerShop.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            printRequests: {
              where: {
                status: { in: ['PENDING', 'PROCESSING'] }
              }
            }
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
    console.error('Prisma error, trying raw SQL:', error);
    try {
      const results: any[] = await prisma.$queryRawUnsafe(`
        SELECT 
          *,
          (SELECT COUNT(*) FROM print_requests 
           WHERE printerShopId = ps.id 
           AND status IN ('PENDING', 'PROCESSING')) as pendingRequests
        FROM printer_shops ps
        WHERE isActive = true
        ORDER BY name ASC
      `);

      const shops = results.map((row: any) => ({
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
        _count: {
          printRequests: row.pendingRequests || 0
        }
      }));

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

// Submit print request (students)
router.post('/request', printUpload.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  const { printerShopId, printType, copies, notes, pages } = req.body;
  const file = req.file;

  if (!printerShopId || !file) {
    throw createError('Printer shop ID and file are required', 400);
  }

  // Verify printer shop exists
  const shop = await prisma.printerShop.findUnique({
    where: { id: printerShopId }
  }).catch(() => {
    // Try raw SQL
    return prisma.$queryRawUnsafe(`
      SELECT * FROM printer_shops WHERE id = '${printerShopId.replace(/'/g, "''")}' AND isActive = true
    `).then((results: any) => results[0] || null);
  });

  if (!shop) {
    throw createError('Printer shop not found', 404);
  }

  const fileUrl = `/uploads/prints/${file.filename}`;
  const copiesNum = parseInt(copies) || 1;

  // Calculate price (example: B&W = 10 PKR/page, Color = 30 PKR/page)
  const pricePerPage = printType === 'COLOR' ? 30 : 10;
  const estimatedPages = pages ? parseInt(pages) : 1;
  const totalPrice = pricePerPage * estimatedPages * copiesNum;

  try {
    const request = await prisma.printRequest.create({
      data: {
        userId: req.user!.id,
        printerShopId,
        fileName: file.originalname,
        fileUrl,
        printType: (printType || 'BLACK_WHITE') as any,
        copies: copiesNum,
        notes: notes || null,
        price: totalPrice,
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
        printerShop: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Notify printer shop owner
    if (shop.ownerId) {
      await prisma.notification.create({
        data: {
          userId: shop.ownerId,
          title: 'New Print Request',
          message: `${req.user!.firstName} ${req.user!.lastName} submitted a print request: ${file.originalname}`,
          type: 'INFO'
        }
      }).catch(() => { }); // Ignore if notification table doesn't exist
    }

    res.json({
      success: true,
      message: 'Print request submitted successfully',
      request
    });
  } catch (error: any) {
    // Fallback to raw SQL
    console.error('Prisma error, trying raw SQL:', error);
    const requestId = `pr${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO print_requests (id, userId, printerShopId, fileName, fileUrl, printType, copies, notes, price, status, createdAt, updatedAt)
        VALUES (
          '${requestId}',
          '${req.user!.id.replace(/'/g, "''")}',
          '${printerShopId.replace(/'/g, "''")}',
          '${file.originalname.replace(/'/g, "''")}',
          '${fileUrl.replace(/'/g, "''")}',
          '${(printType || 'BLACK_WHITE').replace(/'/g, "''")}',
          ${copiesNum},
          ${notes ? `'${notes.replace(/'/g, "''")}'` : 'NULL'},
          ${copiesNum * (printType === 'COLOR' ? 30 : 10)},
          'PENDING',
          NOW(),
          NOW()
        )
      `);

      res.json({
        success: true,
        message: 'Print request submitted successfully',
        request: {
          id: requestId,
          fileName: file.originalname,
          fileUrl,
          printType: printType || 'BLACK_WHITE',
          copies: copiesNum,
          status: 'PENDING'
        }
      });
    } catch (sqlError: any) {
      console.error('Raw SQL error:', sqlError);
      throw createError('Failed to submit print request', 500);
    }
  }
}));

// Get print requests for printer shop owner
router.get('/requests', asyncHandler(async (req: AuthRequest, res) => {
  const { status } = req.query;

  try {
    const whereClause: any = {};

    // Check if user is super admin or owns a printer shop
    const userRoles = req.user!.roles?.map((r: any) => r.name || r.role?.name) || [];
    const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

    if (!isSuperAdmin) {
      // Check if user owns a printer shop
      const shop = await prisma.printerShop.findFirst({
        where: { ownerId: req.user!.id }
      }).catch(() => null);

      if (shop) {
        whereClause.printerShopId = shop.id;
      } else {
        // Try raw SQL
        try {
          const shops: any[] = await prisma.$queryRawUnsafe(`
            SELECT id FROM printer_shops WHERE ownerId = '${req.user!.id.replace(/'/g, "''")}'
          `);
          if (shops.length > 0) {
            whereClause.printerShopId = shops[0].id;
          } else {
            return res.json({ success: true, requests: [] });
          }
        } catch {
          return res.json({ success: true, requests: [] });
        }
      }
    }

    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.printRequest.findMany({
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
        printerShop: {
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
      requests
    });
  } catch (error: any) {
    // Fallback to raw SQL
    console.error('Prisma error, trying raw SQL:', error);
    try {
      let whereConditions: string[] = [];

      const userRoles = req.user!.roles?.map((r: any) => r.name || r.role?.name) || [];
      const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

      if (!isSuperAdmin) {
        try {
          const shops: any[] = await prisma.$queryRawUnsafe(`
            SELECT id FROM printer_shops WHERE ownerId = '${req.user!.id.replace(/'/g, "''")}'
          `);
          if (shops.length > 0) {
            whereConditions.push(`pr.printerShopId = '${shops[0].id.replace(/'/g, "''")}'`);
          } else {
            return res.json({ success: true, requests: [] });
          }
        } catch {
          return res.json({ success: true, requests: [] });
        }
      }

      if (status) {
        whereConditions.push(`pr.status = '${String(status).replace(/'/g, "''")}'`);
      }

      const whereClause = whereConditions.length > 0
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          pr.*,
          JSON_OBJECT(
            'id', u.id,
            'firstName', u.firstName,
            'lastName', u.lastName,
            'email', u.email
          ) as user,
          JSON_OBJECT(
            'id', ps.id,
            'name', ps.name
          ) as printerShop
        FROM print_requests pr
        LEFT JOIN users u ON pr.userId = u.id
        LEFT JOIN printer_shops ps ON pr.printerShopId = ps.id
        ${whereClause}
        ORDER BY pr.createdAt DESC
      `;

      const results: any[] = await prisma.$queryRawUnsafe(query);

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

      const requests = results.map((row: any) => ({
        id: row.id,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        printType: row.printType,
        copies: row.copies,
        pages: row.pages,
        notes: row.notes,
        status: row.status,
        price: row.price ? Number(row.price) : null,
        printedAt: row.printedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        userId: row.userId,
        printerShopId: row.printerShopId,
        user: parseJson(row.user),
        printerShop: parseJson(row.printerShop)
      }));

      res.json({
        success: true,
        requests
      });
    } catch (sqlError: any) {
      if (sqlError.message?.includes("doesn't exist") || sqlError.message?.includes("Unknown table")) {
        res.json({
          success: true,
          requests: [],
          message: 'Print requests table not found. Please run database migration.'
        });
      } else {
        throw createError('Failed to fetch print requests', 500);
      }
    }
  }
}));

// Update print request status (printer shop owner)
router.put('/requests/:id/status', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw createError('Status is required', 400);
  }

  // Check ownership or super admin
  const userRoles = req.user!.roles?.map((r: any) => r.name || r.role?.name) || [];
  const isSuperAdmin = userRoles.includes('SUPER_ADMIN');

  let requestCheck: any = null;
  if (!isSuperAdmin) {
    // Verify the request belongs to a shop owned by this user
    try {
      requestCheck = await prisma.printRequest.findUnique({
        where: { id },
        include: {
          printerShop: {
            select: { ownerId: true }
          }
        }
      });
    } catch {
      // Try raw SQL
      try {
        const results: any[] = await prisma.$queryRawUnsafe(`
          SELECT pr.*, ps.ownerId
          FROM print_requests pr
          LEFT JOIN printer_shops ps ON pr.printerShopId = ps.id
          WHERE pr.id = '${id.replace(/'/g, "''")}'
        `);
        requestCheck = results[0] || null;
      } catch {
        throw createError('Print request not found', 404);
      }
    }

    if (!requestCheck) {
      throw createError('Print request not found', 404);
    }

    const ownerId = requestCheck.printerShop?.ownerId || requestCheck.ownerId;
    if (ownerId !== req.user!.id) {
      throw createError('You do not have permission to update this request', 403);
    }
  }

  try {
    const request = await prisma.printRequest.update({
      where: { id },
      data: {
        status: status as any,
        printedAt: status === 'COMPLETED' ? new Date() : null,
        updatedAt: new Date()
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

    // Notify student
    if (status === 'READY' || status === 'COMPLETED') {
      await prisma.notification.create({
        data: {
          userId: request.userId,
          title: `Print Request ${status === 'READY' ? 'Ready' : 'Completed'}`,
          message: `Your print request "${request.fileName}" is ${status.toLowerCase()}.`,
          type: 'SUCCESS'
        }
      }).catch(() => { });
    }

    res.json({
      success: true,
      message: 'Print request status updated successfully',
      request
    });
  } catch (error: any) {
    // Fallback to raw SQL
    console.error('Prisma error, trying raw SQL:', error);
    try {
      const updateData: string[] = [];
      updateData.push(`status = '${String(status).replace(/'/g, "''")}'`);
      updateData.push(`updatedAt = NOW()`);

      if (status === 'COMPLETED') {
        updateData.push(`printedAt = NOW()`);
      }

      await prisma.$executeRawUnsafe(`
        UPDATE print_requests
        SET ${updateData.join(', ')}
        WHERE id = '${id.replace(/'/g, "''")}'
      `);

      res.json({
        success: true,
        message: 'Print request status updated successfully'
      });
    } catch (sqlError: any) {
      throw createError('Failed to update print request status', 500);
    }
  }
}));

// Get user's print requests (students)
router.get('/my-requests', asyncHandler(async (req: AuthRequest, res) => {
  try {
    const requests = await prisma.printRequest.findMany({
      where: { userId: req.user!.id },
      include: {
        printerShop: {
          select: {
            id: true,
            name: true,
            location: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      requests
    });
  } catch (error: any) {
    // Fallback to raw SQL
    try {
      const query = `
        SELECT 
          pr.*,
          JSON_OBJECT(
            'id', ps.id,
            'name', ps.name,
            'location', ps.location,
            'phone', ps.phone
          ) as printerShop
        FROM print_requests pr
        LEFT JOIN printer_shops ps ON pr.printerShopId = ps.id
        WHERE pr.userId = '${req.user!.id.replace(/'/g, "''")}'
        ORDER BY pr.createdAt DESC
      `;

      const results: any[] = await prisma.$queryRawUnsafe(query);

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

      const requests = results.map((row: any) => ({
        id: row.id,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        printType: row.printType,
        copies: row.copies,
        pages: row.pages,
        notes: row.notes,
        status: row.status,
        price: row.price ? Number(row.price) : null,
        printedAt: row.printedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        userId: row.userId,
        printerShopId: row.printerShopId,
        printerShop: parseJson(row.printerShop)
      }));

      res.json({
        success: true,
        requests
      });
    } catch (sqlError: any) {
      if (sqlError.message?.includes("doesn't exist") || sqlError.message?.includes("Unknown table")) {
        res.json({
          success: true,
          requests: []
        });
      } else {
        throw createError('Failed to fetch print requests', 500);
      }
    }
  }
}));

export default router;

