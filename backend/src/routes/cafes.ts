import express from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { upload, getFileUrl, getFilePath, verifyFileExists, ensureDirectories } from '../utils/upload';

const router = express.Router();

// Get all cafés
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { universityId } = req.query;

  // Get user's university cafés
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  const whereClause: any = { isActive: true };

  // Show ALL active cafes to students (university filtering is optional via query param)
  // This ensures cafes are visible regardless of university assignment
  if (universityId) {
    whereClause.universityId = universityId;
  }
  // If no universityId in query, show all active cafes (no university filter)

  // Fetch cafes with all necessary data using raw SQL to ensure imageUrl is included
  let cafes: any[];
  try {
    // Try to get cafes with imageUrl using raw SQL
    // Show ALL active cafes (no university filter unless explicitly requested)
    const universityFilter = universityId ? `AND universityId = '${universityId}'` : '';
    const cafeData = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id, name, description, location, phone, email, imageUrl, openingHours, isActive,
        createdAt, updatedAt, universityId, ownerId
      FROM cafes
      WHERE isActive = true ${universityFilter}
      ORDER BY name ASC
    `);

    // Fetch related data for each cafe
    cafes = await Promise.all(cafeData.map(async (cafe: any) => {
      const [menusRaw, deals, university, owner, counts] = await Promise.all([
        prisma.$queryRawUnsafe<any[]>(`
          SELECT id, name, description, price, category, imageUrl, isAvailable, isFeatured, cafeId, createdAt, updatedAt
          FROM cafe_menus
          WHERE cafeId = '${cafe.id}' AND isAvailable = true
          ORDER BY isFeatured DESC, category ASC
        `).catch(() => prisma.cafeMenu.findMany({
          where: { cafeId: cafe.id, isAvailable: true },
          orderBy: { category: 'asc' }
        })),
        prisma.cafeDeal.findMany({
          where: {
            cafeId: cafe.id,
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() }
          },
          orderBy: { createdAt: 'desc' }
        }),
        cafe.universityId ? prisma.university.findUnique({
          where: { id: cafe.universityId },
          select: { id: true, name: true, city: true }
        }) : null,
        cafe.ownerId ? prisma.user.findUnique({
          where: { id: cafe.ownerId },
          select: { id: true, firstName: true, lastName: true }
        }) : null,
        prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*) as count FROM cafe_ratings WHERE cafeId = '${cafe.id}'`).then(r => Number(r[0]?.count || 0)).catch(() => 0)
      ]);

      // Format menus to ensure imageUrl and isFeatured are included
      const menus = Array.isArray(menusRaw) ? menusRaw.map((menu: any) => ({
        id: menu.id,
        name: menu.name,
        description: menu.description,
        price: menu.price,
        category: menu.category,
        imageUrl: menu.imageUrl || null,
        isAvailable: menu.isAvailable !== false,
        isFeatured: menu.isFeatured || false,
        cafeId: menu.cafeId,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt
      })) : [];

      // Format deals to ensure menuItemIds is included
      const formattedDeals = Array.isArray(deals) ? deals.map((deal: any) => {
        // Handle date conversion safely
        let validFrom = deal.validFrom;
        let validUntil = deal.validUntil;

        if (validFrom) {
          if (validFrom instanceof Date) {
            validFrom = validFrom.toISOString();
          } else if (typeof validFrom === 'string') {
            // Already a string, keep as is
            validFrom = validFrom;
          } else {
            // Try to convert to Date then to ISO string
            try {
              validFrom = new Date(validFrom).toISOString();
            } catch {
              validFrom = validFrom;
            }
          }
        }

        if (validUntil) {
          if (validUntil instanceof Date) {
            validUntil = validUntil.toISOString();
          } else if (typeof validUntil === 'string') {
            // Already a string, keep as is
            validUntil = validUntil;
          } else {
            // Try to convert to Date then to ISO string
            try {
              validUntil = new Date(validUntil).toISOString();
            } catch {
              validUntil = validUntil;
            }
          }
        }

        return {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          discount: deal.discount ? Number(deal.discount) : null,
          menuItemIds: deal.menuItemIds || null,
          validFrom: validFrom || null,
          validUntil: validUntil || null,
          isActive: deal.isActive !== false
        };
      }) : [];

      return {
        ...cafe,
        menus,
        deals: formattedDeals,
        university,
        owner,
        _count: {
          menus: menus.length,
          deals: formattedDeals.length,
          ratings: counts
        }
      };
    }));
  } catch (error: any) {
    // Fallback to Prisma if raw query fails
    console.warn('Raw SQL query failed, using Prisma fallback:', error.message);

    // Update whereClause for Prisma fallback - show ALL active cafes (no university filter)
    const fallbackWhereClause: any = { isActive: true };
    if (universityId) {
      fallbackWhereClause.universityId = universityId;
    }
    // If no universityId in query, show all active cafes (no filter)

    cafes = await prisma.cafe.findMany({
      where: fallbackWhereClause,
      include: {
        university: {
          select: {
            id: true,
            name: true,
            city: true
          }
        },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        menus: {
          where: { isAvailable: true },
          orderBy: { category: 'asc' }
        },
        deals: {
          where: {
            isActive: true,
            validFrom: { lte: new Date() },
            validUntil: { gte: new Date() }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            menus: true,
            deals: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    // Add ratings count manually
    for (const cafe of cafes) {
      try {
        const ratingResult = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(`SELECT COUNT(*) as count FROM cafe_ratings WHERE cafeId = '${cafe.id}'`);
        cafe._count.ratings = Number(ratingResult[0]?.count || 0);
      } catch {
        cafe._count.ratings = 0;
      }
    }
  }

  // Calculate average rating for each cafe (with error handling)
  const cafesWithRating = await Promise.all(cafes.map(async (cafe) => {
    try {
      const avgRating = await prisma.$queryRaw<Array<{ avg: number }>>`
        SELECT AVG(rating) as avg FROM cafe_ratings WHERE cafeId = ${cafe.id}
      `;
      return {
        ...cafe,
        averageRating: avgRating[0]?.avg ? Number(avgRating[0].avg) : 0
      };
    } catch (error) {
      // If rating table doesn't exist or query fails, default to 0
      console.warn(`Failed to get rating for cafe ${cafe.id}:`, error);
      return {
        ...cafe,
        averageRating: 0
      };
    }
  }));

  // Format response with all necessary data
  const formattedCafes = cafesWithRating.map(cafe => ({
    id: cafe.id,
    name: cafe.name,
    description: cafe.description,
    location: cafe.location,
    phone: cafe.phone,
    email: cafe.email,
    imageUrl: cafe.imageUrl || null,
    ownerId: cafe.ownerId,
    openingHours: cafe.openingHours,
    averageRating: cafe.averageRating || 0,
    menus: cafe.menus.map(menu => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      price: Number(menu.price),
      category: menu.category,
      imageUrl: menu.imageUrl || null,
      isAvailable: menu.isAvailable !== false,
      isFeatured: menu.isFeatured || false
    })),
    deals: (cafe.deals || []).map((deal: any) => {
      // Handle date conversion safely
      let validFrom = deal.validFrom;
      let validUntil = deal.validUntil;

      if (validFrom) {
        if (validFrom instanceof Date) {
          validFrom = validFrom.toISOString();
        } else if (typeof validFrom === 'string') {
          // Already a string, keep as is
          validFrom = validFrom;
        } else {
          // Try to convert to Date then to ISO string
          try {
            validFrom = new Date(validFrom).toISOString();
          } catch {
            validFrom = validFrom;
          }
        }
      }

      if (validUntil) {
        if (validUntil instanceof Date) {
          validUntil = validUntil.toISOString();
        } else if (typeof validUntil === 'string') {
          // Already a string, keep as is
          validUntil = validUntil;
        } else {
          // Try to convert to Date then to ISO string
          try {
            validUntil = new Date(validUntil).toISOString();
          } catch {
            validUntil = validUntil;
          }
        }
      }

      return {
        id: deal.id,
        title: deal.title,
        description: deal.description,
        discount: deal.discount ? Number(deal.discount) : null,
        menuItemIds: deal.menuItemIds || null,
        validFrom: validFrom || null,
        validUntil: validUntil || null,
        isActive: deal.isActive !== false
      };
    }),
    _count: {
      ratings: cafe._count?.ratings || 0,
      menus: cafe.menus.length,
      deals: cafe.deals.length
    }
  }));

  console.log(`✅ Returning ${formattedCafes.length} cafes to user ${req.user!.id}`);
  res.json({
    success: true,
    cafes: formattedCafes
  });
}));

// Get specific café
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const cafe = await prisma.cafe.findUnique({
    where: { id },
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      owner: {
        select: {
          id: true,
          firstName: true,
          lastName: true
        }
      },
      menus: {
        where: { isAvailable: true },
        orderBy: { category: 'asc' }
      },
      deals: {
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          menus: true,
          deals: true
        }
      }
    }
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  // Calculate average rating (with error handling)
  let averageRating = 0;
  try {
    const avgRating = await prisma.$queryRaw<Array<{ avg: number }>>`
      SELECT AVG(rating) as avg FROM cafe_ratings WHERE cafeId = ${cafe.id}
    `;
    averageRating = avgRating[0]?.avg ? Number(avgRating[0].avg) : 0;
  } catch (error) {
    // If rating table doesn't exist or query fails, default to 0
    console.warn(`Failed to get rating for cafe ${cafe.id}:`, error);
    averageRating = 0;
  }

  const cafeWithRating = {
    ...cafe,
    averageRating
  };

  res.json({
    success: true,
    cafe: cafeWithRating
  });
}));

// Upload cafe image - handle multer errors
router.post('/:id/image', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), (req: AuthRequest, res, next) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      console.error('❌ Multer upload error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
        return;
      }
      if (err.message?.includes('Invalid file type')) {
        res.status(400).json({
          success: false,
          message: err.message
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
      return;
    }
    next();
  });
}, asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  if (!req.file) {
    throw createError('Image file is required', 400);
  }

  // Ensure directories exist
  ensureDirectories();

  // Verify file was uploaded
  const filePath = getFilePath(req.file.filename);
  if (!fs.existsSync(filePath)) {
    console.error('❌ Uploaded file not found:', filePath);
    console.error('   Filename:', req.file.filename);
    console.error('   Original name:', req.file.originalname);
    throw createError('Uploaded file not found on server', 500);
  }

  // Get cafe and verify ownership
  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!cafe) {
    // Delete uploaded file if cafe doesn't exist
    try { fs.unlinkSync(filePath); } catch { }
    throw createError('Café not found', 404);
  }

  if (cafe.ownerId !== req.user!.id && !req.user!.roles.includes('SUPER_ADMIN')) {
    // Delete uploaded file if unauthorized
    try { fs.unlinkSync(filePath); } catch { }
    throw createError('Not authorized to update this café', 403);
  }

  // Generate image URL
  const imageUrl = getFileUrl(req.file.filename);
  console.log('📸 Uploading cafe image:', {
    filename: req.file.filename,
    path: filePath,
    size: fs.statSync(filePath).size,
    url: imageUrl
  });

  // Ensure imageUrl column exists
  try {
    await prisma.$queryRawUnsafe(`SELECT imageUrl FROM cafes LIMIT 1`);
  } catch (error: any) {
    if (error.message?.includes('Unknown column') || error.code === '1054') {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE cafes ADD COLUMN imageUrl VARCHAR(500) NULL`);
        console.log('✅ Added imageUrl column to cafes table');
      } catch (alterError: any) {
        console.warn('⚠️  Could not add imageUrl column:', alterError.message);
      }
    }
  }

  // Update cafe with imageUrl
  const escapedImageUrl = imageUrl.replace(/'/g, "''");
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE cafes 
      SET imageUrl = '${escapedImageUrl}', updatedAt = NOW() 
      WHERE id = '${id}'
    `);
    console.log('✅ Updated cafe imageUrl in database');
  } catch (error: any) {
    console.error('❌ Failed to update imageUrl:', error.message);
    throw createError('Failed to save image URL. Please run: npx prisma db push', 500);
  }

  // Fetch updated cafe
  const updatedCafe = await prisma.cafe.findUnique({
    where: { id },
    include: {
      university: {
        select: { id: true, name: true, city: true }
      }
    }
  });

  if (!updatedCafe) {
    throw createError('Café not found after update', 404);
  }

  // Ensure imageUrl is set (in case Prisma client is outdated)
  (updatedCafe as any).imageUrl = imageUrl;

  res.json({
    success: true,
    message: 'Café image uploaded successfully',
    cafe: updatedCafe,
    imageUrl: imageUrl
  });
}));

// Update café menu (Café Owner only)
router.put('/:id/menu', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { menus } = req.body;

  if (!menus || !Array.isArray(menus)) {
    throw createError('Menus array is required', 400);
  }

  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  // Check if user is the owner or super admin
  if (cafe.ownerId !== req.user!.id && !req.user!.roles.includes('SUPER_ADMIN')) {
    throw createError('Not authorized to update this café menu', 403);
  }

  // Delete existing menus
  await prisma.cafeMenu.deleteMany({
    where: { cafeId: id }
  });

  // Create new menus
  const createdMenus = await prisma.cafeMenu.createMany({
    data: menus.map((menu: any) => ({
      cafeId: id,
      name: menu.name,
      description: menu.description,
      price: menu.price,
      category: menu.category,
      imageUrl: menu.imageUrl || null,
      isAvailable: menu.isAvailable !== false
    }))
  });

  res.json({
    success: true,
    message: 'Café menu updated successfully',
    count: createdMenus.count
  });
}));

// Upload menu item image - handle multer errors
router.post('/menu/:menuId/image', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), (req: AuthRequest, res, next) => {
  upload.single('image')(req, res, (err: any) => {
    if (err) {
      console.error('❌ Multer upload error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 5MB.'
        });
        return;
      }
      if (err.message?.includes('Invalid file type')) {
        res.status(400).json({
          success: false,
          message: err.message
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`
      });
      return;
    }
    next();
  });
}, asyncHandler(async (req: AuthRequest, res) => {
  const { menuId } = req.params as any;

  if (!req.file) {
    throw createError('Image file is required', 400);
  }

  const menu = await prisma.cafeMenu.findUnique({
    where: { id: menuId },
    include: {
      cafe: {
        select: { ownerId: true }
      }
    }
  });

  if (!menu) {
    throw createError('Menu item not found', 404);
  }

  // Check if user is the owner or super admin
  if (menu.cafe.ownerId !== req.user!.id && !req.user!.roles.includes('SUPER_ADMIN')) {
    throw createError('Not authorized to update this menu item', 403);
  }

  // Ensure directories exist
  ensureDirectories();

  // Verify file was uploaded
  const filePath = getFilePath(req.file.filename);
  if (!fs.existsSync(filePath)) {
    console.error('❌ Uploaded menu file not found:', filePath);
    console.error('   Filename:', req.file.filename);
    throw createError('Uploaded file not found on server', 500);
  }

  // Generate image URL
  const imageUrl = getFileUrl(req.file.filename);
  console.log('📸 Uploading menu image:', {
    filename: req.file.filename,
    path: filePath,
    size: fs.statSync(filePath).size,
    url: imageUrl
  });

  // Ensure imageUrl column exists
  try {
    await prisma.$queryRawUnsafe(`SELECT imageUrl FROM cafe_menus LIMIT 1`);
  } catch (error: any) {
    if (error.message?.includes('Unknown column') || error.code === '1054') {
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE cafe_menus ADD COLUMN imageUrl VARCHAR(500) NULL`);
        console.log('✅ Added imageUrl column to cafe_menus table');
      } catch (alterError: any) {
        console.warn('⚠️  Could not add imageUrl column:', alterError.message);
      }
    }
  }

  // Update menu with imageUrl
  const escapedImageUrl = imageUrl.replace(/'/g, "''");
  try {
    await prisma.$executeRawUnsafe(`
      UPDATE cafe_menus 
      SET imageUrl = '${escapedImageUrl}', updatedAt = NOW() 
      WHERE id = '${menuId}'
    `);
    console.log('✅ Updated menu imageUrl in database');
  } catch (error: any) {
    console.error('❌ Failed to update menu imageUrl:', error.message);
    throw createError('Failed to save image URL. Please run: npx prisma db push', 500);
  }

  // Fetch updated menu
  const updatedMenu = await prisma.cafeMenu.findUnique({
    where: { id: menuId }
  });

  if (!updatedMenu) {
    throw createError('Menu item not found after update', 404);
  }

  // Ensure imageUrl is set
  (updatedMenu as any).imageUrl = imageUrl;

  res.json({
    success: true,
    message: 'Menu item image uploaded successfully',
    menu: updatedMenu,
    imageUrl: imageUrl
  });
}));

// Update café deals (Café Owner only)
router.put('/:id/deals', requireRole(['CAFE_OWNER', 'SUPER_ADMIN']), asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { deals } = req.body;

  if (!deals || !Array.isArray(deals)) {
    throw createError('Deals array is required', 400);
  }

  const cafe = await prisma.cafe.findUnique({
    where: { id },
    select: { ownerId: true }
  });

  if (!cafe) {
    throw createError('Café not found', 404);
  }

  // Check if user is the owner or super admin
  if (cafe.ownerId !== req.user!.id && !req.user!.roles.includes('SUPER_ADMIN')) {
    throw createError('Not authorized to update this café deals', 403);
  }

  // Delete existing deals
  await prisma.cafeDeal.deleteMany({
    where: { cafeId: id }
  });

  // Create new deals
  const createdDeals = await prisma.cafeDeal.createMany({
    data: deals.map((deal: any) => ({
      cafeId: id,
      title: deal.title,
      description: deal.description,
      discount: deal.discount,
      validFrom: new Date(deal.validFrom),
      validUntil: new Date(deal.validUntil),
      isActive: deal.isActive !== false
    }))
  });

  res.json({
    success: true,
    message: 'Café deals updated successfully',
    count: createdDeals.count
  });
}));

// Get café menu
router.get('/:id/menu', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { category } = req.query;

  const whereClause: any = {
    cafeId: id,
    isAvailable: true
  };

  if (category) {
    whereClause.category = category;
  }

  const menus = await prisma.cafeMenu.findMany({
    where: whereClause,
    orderBy: { category: 'asc' }
  });

  const categories = await prisma.cafeMenu.findMany({
    where: { cafeId: id, isAvailable: true },
    select: { category: true },
    distinct: ['category']
  });

  res.json({
    success: true,
    menus,
    categories: categories.map(c => c.category)
  });
}));

// Get café deals
router.get('/:id/deals', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const deals = await prisma.cafeDeal.findMany({
    where: {
      cafeId: id,
      isActive: true,
      validFrom: { lte: new Date() },
      validUntil: { gte: new Date() }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    deals
  });
}));

// Search cafés
router.get('/search', asyncHandler(async (req: AuthRequest, res) => {
  const { q, category } = req.query;

  if (!q) {
    throw createError('Search query is required', 400);
  }

  const whereClause: any = {
    isActive: true,
    OR: [
      { name: { contains: q as string, mode: 'insensitive' } },
      { description: { contains: q as string, mode: 'insensitive' } },
      { location: { contains: q as string, mode: 'insensitive' } }
    ]
  };

  // Filter by user's university
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (user?.universityId) {
    whereClause.universityId = user.universityId;
  }

  const cafes = await prisma.cafe.findMany({
    where: whereClause,
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      menus: {
        where: { isAvailable: true },
        orderBy: { category: 'asc' }
      },
      deals: {
        where: {
          isActive: true,
          validFrom: { lte: new Date() },
          validUntil: { gte: new Date() }
        },
        orderBy: { createdAt: 'desc' },
        take: 3
      },
      _count: {
        select: {
          menus: true,
          deals: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    cafes,
    query: q
  });
}));

// Add rating to cafe
router.post('/:id/rating', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    throw createError('Rating must be between 1 and 5', 400);
  }

  const cafe = await prisma.cafe.findUnique({
    where: { id }
  });

  if (!cafe) {
    throw createError('Cafe not found', 404);
  }

  // Check if rating exists
  const existingRating = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT id FROM cafe_ratings WHERE cafeId = ${id} AND userId = ${req.user!.id} LIMIT 1
  `;

  let cafeRating;
  if (existingRating.length > 0) {
    // Update existing rating
    await prisma.$executeRaw`
      UPDATE cafe_ratings 
      SET rating = ${rating}, comment = ${comment || null}, updatedAt = NOW()
      WHERE cafeId = ${id} AND userId = ${req.user!.id}
    `;
    const updated = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM cafe_ratings WHERE cafeId = ${id} AND userId = ${req.user!.id} LIMIT 1
    `;
    cafeRating = updated[0];
  } else {
    // Create new rating
    const newId = `rating_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$executeRaw`
      INSERT INTO cafe_ratings (id, cafeId, userId, rating, comment, createdAt, updatedAt)
      VALUES (${newId}, ${id}, ${req.user!.id}, ${rating}, ${comment || null}, NOW(), NOW())
    `;
    const created = await prisma.$queryRaw<Array<any>>`
      SELECT * FROM cafe_ratings WHERE id = ${newId} LIMIT 1
    `;
    cafeRating = created[0];
  }

  res.json({
    success: true,
    message: 'Rating submitted successfully',
    rating: cafeRating
  });
}));

// Get cafe ratings
router.get('/:id/ratings', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;
  const { page = 1, limit = 20 } = req.query;

  const ratings = await prisma.$queryRaw<Array<any>>`
    SELECT 
      cr.*,
      u.id as userId,
      u.firstName,
      u.lastName,
      u.profileImage
    FROM cafe_ratings cr
    JOIN users u ON cr.userId = u.id
    WHERE cr.cafeId = ${id}
    ORDER BY cr.createdAt DESC
    LIMIT ${Number(limit)} OFFSET ${(Number(page) - 1) * Number(limit)}
  `;

  const totalResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*) as count FROM cafe_ratings WHERE cafeId = ${id}
  `;
  const total = Number(totalResult[0]?.count || 0);

  const avgResult = await prisma.$queryRaw<Array<{ avg: number }>>`
    SELECT AVG(rating) as avg FROM cafe_ratings WHERE cafeId = ${id}
  `;
  const averageRating = { _avg: { rating: avgResult[0]?.avg ? Number(avgResult[0].avg) : 0 } };

  res.json({
    success: true,
    ratings,
    averageRating: averageRating._avg.rating || 0,
    totalRatings: total,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

export default router;

