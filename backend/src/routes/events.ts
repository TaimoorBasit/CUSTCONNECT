import express from 'express';
import { prisma } from '../index';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { requireRole } from '../middleware/auth';
import { io } from '../index';

const router = express.Router();

// Get events
router.get('/', asyncHandler(async (req: AuthRequest, res) => {
  const { universityId, upcoming = true, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const whereClause: any = { isActive: true };

  if (universityId) {
    whereClause.universityId = universityId;
  } else {
    // Filter by user's university
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { universityId: true }
    });

    if (user?.universityId) {
      whereClause.universityId = user.universityId;
    }
  }

  if (upcoming === 'true') {
    whereClause.startDate = { gte: new Date() };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      rsvps: {
        where: { userId: req.user!.id },
        select: { status: true }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    },
    skip: offset,
    take: Number(limit),
    orderBy: { startDate: 'asc' }
  });

  const total = await prisma.event.count({
    where: whereClause
  });

  res.json({
    success: true,
    events: events.map(event => ({
      ...event,
      userRSVP: event.rsvps[0]?.status || null,
      rsvpCount: event._count.rsvps
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

// Create event
router.post('/', asyncHandler(async (req: AuthRequest, res) => {
  const { title, description, location, startDate, endDate } = req.body;

  if (!title || !startDate) {
    throw createError('Title and start date are required', 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { universityId: true }
  });

  if (!user?.universityId) {
    throw createError('User university not found', 400);
  }

  const event = await prisma.event.create({
    data: {
      title,
      description,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      organizerId: req.user!.id,
      universityId: user.universityId
    },
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event: {
      ...event,
      userRSVP: null,
      rsvpCount: 0
    }
  });
}));

// Get event by ID
router.get('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      rsvps: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profileImage: true,
              year: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    }
  });

  if (!event) {
    throw createError('Event not found', 404);
  }

  res.json({
    success: true,
    event: {
      ...event,
      rsvpCount: event._count.rsvps
    }
  });
}));

// Update event
router.put('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { title, description, location, startDate, endDate } = req.body;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { organizerId: true }
  });

  if (!event) {
    throw createError('Event not found', 404);
  }

  if (event.organizerId !== req.user!.id) {
    throw createError('Not authorized to update this event', 403);
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      location,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
    },
    include: {
      organizer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          year: true
        }
      },
      university: {
        select: {
          id: true,
          name: true,
          city: true
        }
      },
      _count: {
        select: {
          rsvps: true
        }
      }
    }
  });

  res.json({
    success: true,
    message: 'Event updated successfully',
    event: {
      ...updatedEvent,
      userRSVP: null,
      rsvpCount: updatedEvent._count.rsvps
    }
  });
}));

// Delete event
router.delete('/:id', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { organizerId: true }
  });

  if (!event) {
    throw createError('Event not found', 404);
  }

  if (event.organizerId !== req.user!.id) {
    throw createError('Not authorized to delete this event', 403);
  }

  await prisma.event.update({
    where: { id },
    data: { isActive: false }
  });

  res.json({
    success: true,
    message: 'Event deleted successfully'
  });
}));

// RSVP to event
router.post('/:id/rsvp', asyncHandler(async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status = 'GOING' } = req.body;

  const event = await prisma.event.findUnique({
    where: { id },
    select: { id: true, organizerId: true, title: true }
  });

  if (!event) {
    throw createError('Event not found', 404);
  }

  // Check if already RSVP'd
  const existingRSVP = await prisma.eventRSVP.findUnique({
    where: {
      eventId_userId: {
        userId: req.user!.id,
        eventId: id
      }
    }
  });

  if (existingRSVP) {
    // Update existing RSVP
    const updatedRSVP = await prisma.eventRSVP.update({
      where: {
        eventId_userId: {
          userId: req.user!.id,
          eventId: id
        }
      },
      data: { status: status as any }
    });

    res.json({
      success: true,
      message: 'RSVP updated successfully',
      rsvp: updatedRSVP
    });
  } else {
    // Create new RSVP
    const rsvp = await prisma.eventRSVP.create({
      data: {
        userId: req.user!.id,
        eventId: id,
        status: status as any
      }
    });

    // Send notification to event organizer
    if (event.organizerId !== req.user!.id) {
      await prisma.notification.create({
        data: {
          userId: event.organizerId,
          title: 'New Event RSVP',
          message: `${req.user!.firstName} ${req.user!.lastName} RSVP'd to your event: ${event.title}`,
          type: 'INFO'
        }
      });

      io.to(event.organizerId).emit('notification', {
        title: 'New Event RSVP',
        message: `${req.user!.firstName} ${req.user!.lastName} RSVP'd to your event: ${event.title}`
      });
    }

    res.status(201).json({
      success: true,
      message: 'RSVP created successfully',
      rsvp
    });
  }
}));

// Get user's events
router.get('/my/events', asyncHandler(async (req: AuthRequest, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const events = await prisma.event.findMany({
    where: {
      organizerId: req.user!.id,
      isActive: true
    },
    include: {
      university: {
        select: {
          id: true,
          name: true,
          city: true
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
    orderBy: { startDate: 'asc' }
  });

  const total = await prisma.event.count({
    where: {
      organizerId: req.user!.id,
      isActive: true
    }
  });

  res.json({
    success: true,
    events: events.map(event => ({
      ...event,
      rsvpCount: event._count.rsvps
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit))
    }
  });
}));

export default router;

