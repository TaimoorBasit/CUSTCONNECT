import { Request, Response, NextFunction } from 'express';
import { prisma } from '../index';
import { AuthRequest } from './auth';

export const auditLog = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Store original json method
  const originalJson = res.json.bind(res);

  // Override json method to capture response
  res.json = function (body: any) {
    // Log audit entry after response is sent
    setImmediate(async () => {
      try {
        // Only log successful operations
        if (!body || !body.success) {
          return;
        }

        const action = getAction(req.method, req.path);
        const entityType = getEntityType(req.path);
        const entityId = req.params.id || req.params.roleId || req.params.universityId || 'unknown';
        
        // Build details object
        const detailsObj: any = {
          path: req.path,
          method: req.method,
          response: 'Success',
          message: body.message || '',
        };

        // Add body data if available (sanitized)
        if (req.body && Object.keys(req.body).length > 0) {
          detailsObj.body = sanitizeBody(req.body);
        }

        // Add entity-specific details
        if (req.params.id) detailsObj.entityId = req.params.id;
        if (req.params.roleId) detailsObj.roleId = req.params.roleId;

        const details = JSON.stringify(detailsObj);

        await prisma.auditLog.create({
          data: {
            action,
            entityType,
            entityId,
            userId: req.user!.id,
            userEmail: req.user!.email,
            details,
          },
        });
      } catch (error: any) {
        console.error('Audit log error:', error);
        // Don't fail the request if audit logging fails
      }
    });

    return originalJson(body);
  };

  next();
};

function getAction(method: string, path: string): string {
  // Handle role-specific actions
  if (path.includes('/roles') && method === 'POST') return 'ROLE_ASSIGN';
  if (path.includes('/roles') && method === 'DELETE') return 'ROLE_REMOVE';
  
  // Handle standard CRUD operations
  if (method === 'POST' && !path.includes('/roles')) return 'CREATE';
  if (method === 'PUT' || method === 'PATCH') return 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  
  return method;
}

function getEntityType(path: string): string {
  if (path.includes('/cafes')) return 'CAFE';
  if (path.includes('/buses') || path.includes('/routes')) return 'BUS_ROUTE';
  if (path.includes('/users')) return 'USER';
  if (path.includes('/roles')) return 'ROLE';
  if (path.includes('/vendors')) return 'VENDOR';
  if (path.includes('/grading')) return 'GRADING_SYSTEM';
  if (path.includes('/universities')) return 'UNIVERSITY';
  return 'UNKNOWN';
}

function sanitizeBody(body: any): any {
  if (!body) return null;
  const sanitized = { ...body };
  // Remove sensitive fields
  if (sanitized.password) sanitized.password = '***';
  if (sanitized.token) sanitized.token = '***';
  return sanitized;
}

