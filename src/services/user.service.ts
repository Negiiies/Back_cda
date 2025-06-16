//src/services/user.service.ts

import { User } from '../models';
import { ICreateUser, UserResponseDto } from '../types';
import { AppError } from '../utils/error.handler';
import { authService } from './auth.service';
import logger from '../utils/logger';
import { tokenBlacklist } from '../utils/token.blacklist';
import { jwtService } from './jwt.service';

export class UserService {
  async createUser(userData: ICreateUser): Promise<UserResponseDto> {
    const existingUser = await User.findOne({
      where: { email: userData.email }
    });
    
    if (existingUser) {
      logger.warn(`Attempt to create user with existing email: ${userData.email}`);
      throw new AppError(400, 'Email already exists');
    }

    // Hash password before saving
    const hashedPassword = await authService.hashPassword(userData.password);

    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role: userData.role || 'student', // Default role
      status: 'active'
    } as User);

    logger.info(`New user created: ${user.id}`);
    return this.toDTO(user);
  }

  async login(email: string, password: string): Promise<UserResponseDto> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      throw new AppError(404, 'User not found');
    }

    const isPasswordValid = await authService.verifyPassword(
      user.password,
      password
    );

    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for user: ${user.id}`);
      throw new AppError(401, 'Invalid credentials');
    }

    logger.info(`User logged in: ${user.id}`);
    return this.toDTO(user);
  }

  async getUsers(): Promise<UserResponseDto[]> {
    const users = await User.findAll();
    return users.map(user => this.toDTO(user));
  }

  async getUserById(id: number): Promise<UserResponseDto> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    return this.toDTO(user);
  }

  async updateUser(id: number, userData: Partial<ICreateUser>): Promise<UserResponseDto> {
    const user = await User.findByPk(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    if (userData.email && userData.email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: userData.email }
      });
      if (existingUser) {
        throw new AppError(400, 'Email already exists');
      }
    }

    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await authService.hashPassword(userData.password);
    }

    await user.update(userData);
    return this.toDTO(user);
  }

  async deleteUser(id: number, token?: string): Promise<void> {
    const user = await User.findByPk(id);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Mark user as inactive
    await user.update({ status: 'inactive' });

    tokenBlacklist.revokeAllUserTokens(id);

    // If token is provided (user deleting themselves), blacklist it
    if (token) {
      // Extract token from Bearer token
      const actualToken = jwtService.extractTokenFromHeader(token);
      tokenBlacklist.addToken(actualToken);
    }

    logger.info(`User ${id} has been deactivated and their tokens revoked`);
  }

  private toDTO(user: User): UserResponseDto {
    // Destructure and exclude password
    const { password, ...userDTO } = user.toJSON();
    
    if (!userDTO.id) {
      throw new AppError(500, 'User ID is undefined');
    }

    return {
      id: userDTO.id,
      name: userDTO.name,
      email: userDTO.email,
      role: userDTO.role,
      status: userDTO.status,
      description: userDTO.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}

export const userService = new UserService();