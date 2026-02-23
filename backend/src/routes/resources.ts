import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const router = express.Router();
import { uploadResource, getFileUrl } from '../utils/upload';

// Upload academic resource file
router.post('/upload', uploadResource.single('file'), asyncHandler(async (req: AuthRequest, res) => {
  if (!req.file) {
    throw createError('No file provided', 400);
  }

  const fileUrl = getFileUrl(req.file.path, 'resource' as any);

  res.json({
    success: true,
    fileUrl
  });
}));

// Get academic resources
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { courseId, semesterId, type, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = { isActive: true };

  if (courseId) {
    whereClause.courseId = courseId;
  }

  if (semesterId) {
    whereClause.semesterId = semesterId;
  }

  if (type) {
    whereClause.fileType = type;
  }

  // Filter by user's university
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (user?.universityId) {
    whereClause.course = {
      universityId: user.universityId
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
          profileImage: true,
          year: true
        }
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          credits: true
        }
      },
      semester: {
        select: {
          id: true,
          name: true,
          year: true
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
    resources,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Upload academic resource
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { title, description, fileUrl, fileType, fileSize, courseId, semesterId } = req.body;

  if (!title || !fileUrl || !fileType) {
    throw createError('Title, file URL, and file type are required', 400);
  }

  const resource = await prisma.academicResource.create({
    data: {
      title,
      description,
      fileUrl,
      fileType,
      fileSize: fileSize || 0,
      uploaderId: req.user!.id,
      courseId,
      semesterId
    },
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          credits: true
        }
      },
      semester: {
        select: {
          id: true,
          name: true,
          year: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Resource uploaded successfully',
    resource
  });
}));

// Get resource by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const resource = await prisma.academicResource.findUnique({
    where: { id: id as string },
    include: {
      uploader: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      course: {
        select: {
          id: true,
          name: true,
          code: true,
          credits: true
        }
      },
      semester: {
        select: {
          id: true,
          name: true,
          year: true
        }
      }
    }
  });

  if (!resource) {
    throw createError('Resource not found', 404);
  }

  res.json({
    success: true,
    resource
  });
}));

// Download resource
router.get('/:id/download', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const resource = await prisma.academicResource.findUnique({
    where: { id: id as string },
    select: {
      id: true,
      title: true,
      fileUrl: true,
      fileType: true,
      fileSize: true
    }
  });

  if (!resource) {
    throw createError('Resource not found', 404);
  }

  // In a real app, you'd implement proper file download logic
  res.json({
    success: true,
    downloadUrl: resource.fileUrl,
    filename: resource.title,
    fileType: resource.fileType,
    fileSize: resource.fileSize
  });
}));

// Delete resource
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params as any;

  const resource = await prisma.academicResource.findUnique({
    where: { id: id as string },
    select: { uploaderId: true }
  });

  if (!resource) {
    throw createError('Resource not found', 404);
  }

  if (resource.uploaderId !== req.user!.id) {
    throw createError('Not authorized to delete this resource', 403);
  }

  await prisma.academicResource.update({
    where: { id: id as string },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Resource deleted successfully'
  });
}));

// Get courses
router.get('/courses/list', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (!user?.universityId) {
    throw createError('User university not found', 400);
  }

  const courses = await prisma.course.findMany({
    where: {
      universityId: user.universityId,
      isActive: true
    },
    orderBy: { name: 'asc' }
  });

  res.json({
    success: true,
    courses
  });
}));

// Get semesters
router.get('/semesters/list', asyncHandler(async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (!user?.universityId) {
    throw createError('User university not found', 400);
  }

  const semesters = await prisma.semester.findMany({
    where: {
      universityId: user.universityId,
      isActive: true
    },
    orderBy: { year: 'desc' }
  });

  res.json({
    success: true,
    semesters
  });
}));

export default router;

