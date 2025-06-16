import * as argon2 from 'argon2';
import { User } from '../models';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';
import { jwtService } from './jwt.service';
import { UserRole } from '../types';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: UserRole;
  };
}

export class AuthService {
  private readonly memoryCost: number;
  private readonly timeCost: number;
  private readonly parallelism: number;

  constructor() {
    // Argon2 configuration
    this.memoryCost = Number(process.env.ARGON2_MEMORY_COST) || 65536;
    this.timeCost = Number(process.env.ARGON2_TIME_COST) || 3;
    this.parallelism = Number(process.env.ARGON2_PARALLELISM) || 1;
  }

  async hashPassword(password: string): Promise<string> {
    try {
      return await argon2.hash(password, {
        type: argon2.argon2id,
        memoryCost: this.memoryCost,
        timeCost: this.timeCost,
        parallelism: this.parallelism
      });
    } catch (error) {
      logger.error('Error hashing password', error);
      throw new AppError(500, 'Error hashing password');
    }
  }

  async verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    // Handle null/empty password cases
    if (!password) {
      return false;
    }
    
    return await argon2.verify(hash, password);
  } catch (error) {
    logger.error('Error verifying password', error);
    throw new AppError(500, 'Error verifying password');
  }
}

  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (user.status === 'inactive') {
    throw new AppError(401, 'Account is inactive');
    }

    const isPasswordValid = await this.verifyPassword(user.password, password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }
}

export const authService = new AuthService();