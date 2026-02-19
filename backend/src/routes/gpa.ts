import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { calculateGPA } from '../utils/validation';

const router = express.Router();

// Calculate GPA
router.post('/calculate', asyncHandler(async (req: AuthRequest, res) => {
  const { subjects, semester, year } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    throw createError('Subjects array is required', 400);
  }

  if (!semester || !year) {
    throw createError('Semester and year are required', 400);
  }

  // Validate subjects
  for (const subject of subjects) {
    if (!subject.name || !subject.code || !subject.credits || !subject.grade) {
      throw createError('Each subject must have name, code, credits, and grade', 400);
    }
  }

  // Calculate GPA
  const gpa = calculateGPA(subjects);

  // Calculate individual subject GPAs
  const gradePoints: { [key: string]: number } = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  const subjectsWithGPA = subjects.map(subject => ({
    ...subject,
    gpa: gradePoints[subject.grade] || 0
  }));

  // Get previous CGPA
  const previousRecord = await prisma.gPARecord.findFirst({
    where: {
      userId: req.user!.id
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  const previousCredits = previousRecord?.credits || 0;
  const previousCGPA = previousRecord?.cgpa || 0;

  // Calculate new CGPA
  const newCGPA = previousCredits > 0
    ? ((Number(previousCGPA) * Number(previousCredits)) + (Number(gpa) * Number(totalCredits))) / (Number(previousCredits) + Number(totalCredits))
    : Number(gpa);

  // Save GPA record
  const gpaRecord = await prisma.gPARecord.create({
    data: {
      userId: req.user!.id,
      semester,
      year,
      gpa,
      cgpa: newCGPA,
      credits: totalCredits,
      subjects: {
        create: subjectsWithGPA.map(subject => ({
          name: subject.name,
          code: subject.code,
          credits: subject.credits,
          grade: subject.grade,
          gpa: subject.gpa
        }))
      }
    },
    include: {
      subjects: true
    }
  });

  res.json({
    success: true,
    gpa,
    cgpa: newCGPA,
    totalCredits,
    record: gpaRecord
  });
}));

// Get GPA history
router.get('/history', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const records = await prisma.gPARecord.findMany({
    where: { userId: req.user!.id },
    include: {
      subjects: {
        orderBy: { name: 'asc' }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });

  const total = await prisma.gPARecord.count({
    where: { userId: req.user!.id }
  });

  res.json({
    success: true,
    records,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Get current CGPA
router.get('/current', asyncHandler(async (req: AuthRequest, res) => {
  const latestRecord = await prisma.gPARecord.findFirst({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
    select: {
      cgpa: true,
      semester: true,
      year: true,
      credits: true
    }
  });

  const totalRecords = await prisma.gPARecord.count({
    where: { userId: req.user!.id }
  });

  res.json({
    success: true,
    cgpa: latestRecord?.cgpa || 0,
    semester: latestRecord?.semester || null,
    year: latestRecord?.year || null,
    totalCredits: latestRecord?.credits || 0,
    totalRecords
  });
}));

// Delete GPA record
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const record = await prisma.gPARecord.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!record) {
    throw createError('GPA record not found', 404);
  }

  if (record.userId !== req.user!.id) {
    throw createError('Not authorized to delete this record', 403);
  }

  await prisma.gPARecord.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'GPA record deleted successfully'
  });
}));

// Get GPA tips
router.get('/tips', asyncHandler(async (req: AuthRequest, res) => {
  const tips = [
    {
      title: "Attend Classes Regularly",
      description: "Regular attendance helps you stay on top of course material and understand concepts better.",
      category: "Attendance"
    },
    {
      title: "Take Detailed Notes",
      description: "Good note-taking helps with retention and provides study material for exams.",
      category: "Study Habits"
    },
    {
      title: "Ask Questions",
      description: "Don't hesitate to ask professors or classmates when you don't understand something.",
      category: "Communication"
    },
    {
      title: "Form Study Groups",
      description: "Study groups can help you learn from peers and stay motivated.",
      category: "Collaboration"
    },
    {
      title: "Manage Your Time",
      description: "Create a study schedule and stick to it. Avoid last-minute cramming.",
      category: "Time Management"
    },
    {
      title: "Seek Help Early",
      description: "If you're struggling with a subject, seek help from tutors or academic support services.",
      category: "Support"
    },
    {
      title: "Stay Organized",
      description: "Keep track of assignments, deadlines, and exam dates to avoid missing important work.",
      category: "Organization"
    },
    {
      title: "Take Care of Your Health",
      description: "A healthy body and mind are essential for academic success. Get enough sleep and exercise.",
      category: "Wellness"
    }
  ];

  res.json({
    success: true,
    tips
  });
}));

export default router;

