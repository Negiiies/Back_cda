import { z } from 'zod';

// Create evaluation schema
export const createEvaluationSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  dateEval: z.string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format'
    }),
  studentId: z.number()
    .positive('Student ID must be positive'),
  scaleId: z.number()
    .positive('Scale ID must be positive')
});

// Update evaluation schema
export const updateEvaluationSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .optional(),
  dateEval: z.string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), {
      message: 'Invalid date format'
    })
    .optional()
});

// Change status schema
export const changeStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'archived'] as const)
    .refine((status) => ['draft', 'published', 'archived'].includes(status), {
      message: 'Invalid status'
    })
});

// Evaluation ID parameter schema
export const evaluationIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});