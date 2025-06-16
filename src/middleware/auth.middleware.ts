import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt.service';
import { AppError } from '../utils/error.handler';
import { UserRole } from '../types';
import { tokenBlacklist } from '../utils/token.blacklist';


declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ 
        status: 'error',
        message: 'Access denied. No token provided.' 
      });
    }

    const token = jwtService.extractTokenFromHeader(authHeader);

    // Check if token is blacklisted
    if (tokenBlacklist.isBlacklisted(token)) {
      return res.status(401).json({
        status: 'error',
        message: 'Token has been revoked'
      });
    }

    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ 
      status: 'error',
      message: error instanceof AppError ? error.message : 'Authentication failed'
    });
  }
};

export const authorize = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: 'error',
          message: 'Insufficient permissions'
        });
      }

      return next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Authorization check failed'
      });
    }
  };
};

export const checkOwnership = (
  req: Request,
  res: Response,
  next: NextFunction
): Response | void => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    const resourceUserId = parseInt(req.params.userId);
    
    // Allow admin to access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user is accessing their own resource
    if (req.user.userId !== resourceUserId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied'
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Ownership check failed'
    });
  }
};