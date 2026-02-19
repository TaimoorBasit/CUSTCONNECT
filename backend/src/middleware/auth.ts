import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AuthRequest extends Request<any, any, any, any> {
  user?: {
    id: string;
    email?: string | null;
    username?: string | null;
    roles: string[];
    firstName?: string;
    lastName?: string;
    universityId?: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    // Extract token - handle both "Bearer token" and just "token"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : authHeader;

    if (!token || token.trim().length === 0) {
      res.status(401).json({
        success: false,
        message: 'Access token required'
      });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-in-production';

    // Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token.trim(), jwtSecret);
    } catch (jwtError: any) {
      console.error('❌ JWT verification error:', jwtError.message);
      res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
      return;
    }

    if (!decoded.userId && !decoded.id) {
      res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
      return;
    }

    const userId = decoded.userId || decoded.id;

    // Get user with roles - with fallback
    let user: any;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: {
            include: {
              role: true
            }
          }
        }
      });
    } catch (dbError: any) {
      console.error('❌ Database error in auth middleware:', dbError.message);
      // Try without roles
      try {
        user = await prisma.user.findUnique({
          where: { id: userId }
        });
      } catch (userError: any) {
        console.error('❌ Failed to fetch user:', userError.message);
        res.status(500).json({
          success: false,
          message: 'Database error. Please try again.'
        });
        return;
      }
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Account is inactive'
      });
      return;
    }

    // Extract roles safely
    let userRoles: string[] = [];
    try {
      if (user.roles && Array.isArray(user.roles)) {
        userRoles = user.roles
          .map((ur: any) => ur?.role?.name)
          .filter(Boolean);
      }
    } catch (roleError) {
      console.warn('⚠️  Error extracting roles:', roleError);
    }

    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: userRoles,
      firstName: user.firstName,
      lastName: user.lastName,
      universityId: user.universityId || undefined
    };

    next();
  } catch (error: any) {
    console.error('❌ Auth middleware error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
    return;
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const hasRole = roles.some(role => req.user!.roles.includes(role));
    if (!hasRole) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

