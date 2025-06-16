import { Router, Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { jwtService } from '../services/jwt.service';
import { tokenBlacklist } from '../utils/token.blacklist';
import { validate } from '../middleware/validate';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.middleware';
import logger from '../utils/logger';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
  })
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

// Type for request handlers to ensure they return a Promise
type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

// Login route
router.post(
  '/login',
  validate(loginSchema),
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }) as AsyncRequestHandler
);

// Refresh token route
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  (async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      
      // Verify refresh token isn't blacklisted
      if (tokenBlacklist.isBlacklisted(refreshToken)) {
        res.status(401).json({
          status: 'error',
          message: 'Refresh token has been revoked'
        });
        return;
      }

      const decoded = jwtService.verifyToken(refreshToken);
      const accessToken = jwtService.generateAccessToken({
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role
      });

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }) as AsyncRequestHandler
);

// Logout route

router.post('/logout',
  authenticate,
  (req: Request, res: Response): void => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(400).json({ 
          status: 'error',
          message: 'No token provided' 
        });
        return;
      }

      const token = jwtService.extractTokenFromHeader(authHeader);
      tokenBlacklist.addToken(token);

      // Log for debugging
      logger.info(`Logout successful. Blacklist size: ${tokenBlacklist.getBlacklistSize()}`);

      res.json({ 
        status: 'success',
        message: 'Logged out successfully',
        blacklistSize: tokenBlacklist.getBlacklistSize() // For debugging
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        message: 'Logout failed'
      });
    }
  }
);

export default router;