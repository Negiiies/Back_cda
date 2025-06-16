// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service';

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(Number(req.params.id));
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(Number(req.params.id), req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const userId = Number(req.params.id);
    const currentUser = req.user;

    // If user is deleting themselves, pass their token to be blacklisted
    const token = currentUser?.userId === userId ? 
      req.headers.authorization : undefined;

    await userService.deleteUser(userId, token);

    // If user deleted themselves, send a special response
    if (currentUser?.userId === userId) {
      return res.status(200).json({ 
        message: 'Account deactivated. You will be logged out.',
        forceLogout: true
      });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}
}

export const userController = new UserController();