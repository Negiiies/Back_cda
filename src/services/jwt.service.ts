import { sign, verify } from 'jsonwebtoken';
import { config } from '../config/env.config';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';
import { UserRole } from '../types';

interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export class JWTService {
  private readonly secret: string;
  private readonly accessTokenExpiration: number;
  private readonly refreshTokenExpiration: number;

  constructor() {
    this.secret = config.jwt.secret;
    this.accessTokenExpiration = 900;  // 15 minutes in seconds
    this.refreshTokenExpiration = 604800; // 7 days in seconds

    if (config.env === 'production' && (!this.secret || this.secret === 'your-default-secret-key-for-development')) {
      throw new AppError(500, 'JWT secret key not configured');
    }
  }

  generateAccessToken(payload: TokenPayload): string {
    try {
      return sign(
        { ...payload },
        this.secret,
        { expiresIn: this.accessTokenExpiration }
      );
    } catch (error) {
      logger.error('Error generating access token:', error);
      throw new AppError(500, 'Error generating access token');
    }
  }

  generateRefreshToken(payload: TokenPayload): string {
    try {
      return sign(
        { ...payload },
        this.secret,
        { expiresIn: this.refreshTokenExpiration }
      );
    } catch (error) {
      logger.error('Error generating refresh token:', error);
      throw new AppError(500, 'Error generating refresh token');
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      return verify(token, this.secret) as TokenPayload;
    } catch (error) {
      logger.error('Token verification failed:', error);
      throw new AppError(401, 'Invalid or expired token');
    }
  }

  extractTokenFromHeader(authorizationHeader: string): string {
    const [bearer, token] = authorizationHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new AppError(401, 'Invalid authorization header format');
    }

    return token;
  }
}

export const jwtService = new JWTService();