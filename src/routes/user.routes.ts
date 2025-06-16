//src/routes/user.routes.ts

import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema, userIdSchema } from '../validators/user.validator';
import { z } from 'zod';
import { authenticate, authorize, checkOwnership } from '../middleware/auth.middleware';

const router = Router();

// Combine schemas for routes that need both params and body validation
const updateUserValidation = z.object({
  params: userIdSchema,
  body: updateUserSchema
});

// Register a User without authentication
router.post('/register', 
  validate(z.object({ body: createUserSchema })),
  userController.createUser
);

// Apply authentication to all routes
router.use(authenticate);

// Create user (only for admin)
router.post('/',
  authorize(['admin']),
  validate(z.object({ body: createUserSchema })),
  userController.createUser
);

// Get all users (only for admin)
router.get('/',
  authorize(['admin', 'teacher']), // AJOUTEZ 'teacher' ICI
  userController.getUsers
);

// Get user by ID (check ownership)
router.get('/:id',
  validate(z.object({ params: userIdSchema })),
  checkOwnership,
  userController.getUserById
);

// Update user (check ownership)
router.put('/:id',
  validate(updateUserValidation),
  checkOwnership,
  userController.updateUser
);

// Delete user (check ownership)
router.delete('/:id',
  validate(z.object({ params: userIdSchema })),
  checkOwnership,
  userController.deleteUser
);

export default router;