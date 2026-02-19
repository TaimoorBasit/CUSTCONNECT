import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import busRoutes from './routes/bus';
import cafeRoutes from './routes/cafes';
import resourceRoutes from './routes/resources';
import gpaRoutes from './routes/gpa';
import eventRoutes from './routes/events';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import vendorRoutes from './routes/vendor';
import orderRoutes from './routes/orders';
import imageRoutes from './routes/images';
import lostFoundRoutes from './routes/lostFound';
import printRoutes from './routes/print';
import messageRoutes from './routes/messages';
import { ensureDirectories } from './utils/upload';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { authenticateToken } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

import { prisma } from './lib/prisma';
export { prisma };

// Test database connection on startup
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch((error) => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
  });

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Request logger for debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  next();
});

app.use(cors({
  origin: true, // Allow all origins temporarily to fix crash
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directories exist before setting up routes
ensureDirectories();

// Image serving route (before API routes for better performance)
app.use('/uploads', imageRoutes);
console.log('✅ Image serving route enabled at /uploads');
console.log('   Images accessible at: https://custconnect-backend-production.up.railway.app/uploads/cafes/[filename]');

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: 'connected',
      server: 'running'
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Simple ping endpoint for frontend to check if backend is alive
app.get('/api/ping', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running - v5-checking-logs',
    timestamp: new Date().toISOString()
  });
});

// TEMPORARY: Seed Endpoint to create admin user
// TODO: Remove this before proper launch
app.get('/api/seed', async (req, res) => {
  try {
    const email = 'admin@admin.com';
    const username = 'Admin';
    const password = 'Admin123';
    const hashedPassword = await bcrypt.hash(password, 12);

    // 1. Ensure SUPER_ADMIN role exists
    let adminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } });
    if (!adminRole) {
      adminRole = await prisma.role.create({
        data: {
          name: 'SUPER_ADMIN',
          description: 'Full system access',
          permissions: '*'
        }
      });
    }

    // 2. Check if user exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: username }
        ]
      }
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { id: existing.id },
        data: {
          username: username,
          password: hashedPassword,
          isVerified: true,
          isActive: true
        }
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: email,
          username: username,
          password: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          isVerified: true,
          isActive: true
        }
      });
    }

    // 3. Assign role
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: user.id,
          roleId: adminRole.id
        }
      },
      create: {
        userId: user.id,
        roleId: adminRole.id
      },
      update: {}
    });

    return res.json({
      message: 'Admin account secured!',
      credentials: {
        login: username,
        password: password,
        email: email
      }
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/posts', authenticateToken, postRoutes);
app.use('/api/bus', authenticateToken, busRoutes);
app.use('/api/cafes', authenticateToken, cafeRoutes);
app.use('/api/resources', authenticateToken, resourceRoutes);
app.use('/api/gpa', authenticateToken, gpaRoutes);
app.use('/api/events', authenticateToken, eventRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);
app.use('/api/vendor', authenticateToken, vendorRoutes);
app.use('/api/orders', authenticateToken, orderRoutes);
app.use('/api/lost-found', authenticateToken, lostFoundRoutes);
app.use('/api/print', authenticateToken, printRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`User ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to other modules
export { io };

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

