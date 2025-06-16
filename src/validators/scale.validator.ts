import { z } from 'zod';

// Base criteria schema for reuse
const criteriaSchema = z.object({
  description: z.string()
    .min(2, 'Description must be at least 2 characters')
    .max(200, 'Description cannot exceed 200 characters'),
  associatedSkill: z.string()
    .min(2, 'Associated skill must be at least 2 characters')
    .max(100, 'Associated skill cannot exceed 100 characters'),
  maxPoints: z.number()
    .positive('Maximum points must be positive')
    .max(100, 'Maximum points cannot exceed 100'),
  coefficient: z.number()
    .min(0, 'Coefficient cannot be negative')
    .max(1, 'Coefficient cannot exceed 1')
});

// Create scale schema
export const createScaleSchema = z.object({
  title: z.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z.string()
    .min(2, 'Description must be at least 2 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  criteria: z.array(criteriaSchema)
    .min(1, 'Scale must have at least one criterion')
    .refine(
      (criteria) => {
        const totalCoefficient = criteria.reduce((sum, c) => sum + c.coefficient, 0);
        return totalCoefficient <= 1;
      },
      { message: 'Total coefficient cannot exceed 1' }
    )
});

// Update scale schema
export const updateScaleSchema = createScaleSchema.partial();

// Scale ID parameter schema
export const scaleIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});