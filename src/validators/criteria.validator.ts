import { z } from 'zod';

// Base criteria schema
export const createCriteriaSchema = z.object({
  description: z.string()
    .min(2, 'Description must be at least 2 characters')
    .max(200, 'Description cannot exceed 200 characters'),
  associatedSkill: z.string()
    .min(2, 'Associated skill must be at least 2 characters')
    .max(100, 'Associated skill cannot exceed 100 characters'),
  maxPoints: z.number()
    .positive('Maximum points must be positive'),
  coefficient: z.number()
    .min(0, 'Coefficient cannot be negative')
    .max(1, 'Coefficient cannot exceed 1'),
  scaleId: z.number()
    .positive('Scale ID must be positive')
});

// For updates - make all fields optional but exclude scaleId
export const updateCriteriaSchema = createCriteriaSchema
  .omit({ scaleId: true })
  .partial();

// Criteria ID parameter schema
export const criteriaIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});