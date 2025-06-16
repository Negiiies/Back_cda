import { z } from 'zod';

// ✅ CORRECTION : createGradeSchema SANS evaluationId (il vient de l'URL)
export const createGradeSchema = z.object({
  // ❌ evaluationId: z.number().positive('Evaluation ID must be positive'), // SUPPRIMÉ
  criteriaId: z.number()
    .positive('Criteria ID must be positive'),
  value: z.number()
    .min(0, 'Grade value cannot be negative')
    // ✅ NOTE: Limite de 100 peut être trop restrictive si maxPoints > 100
    .max(1000, 'Grade value cannot exceed 1000') // Augmenté pour flexibilité
});

// Update grade schema (reste identique)
export const updateGradeSchema = z.object({
  value: z.number()
    .min(0, 'Grade value cannot be negative')
    .max(1000, 'Grade value cannot exceed 1000')
});

// Grade ID parameter schema (reste identique)
export const gradeIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});