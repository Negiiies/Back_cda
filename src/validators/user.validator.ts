//src/validators/user.validator.ts

import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const createUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email cannot exceed 255 characters'),
  password: passwordSchema,
  role: z.enum(['student', 'teacher', 'admin']),
  description: z.string().optional()
});

export const updateUserSchema = createUserSchema.partial().omit({ role: true });
export const userIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});