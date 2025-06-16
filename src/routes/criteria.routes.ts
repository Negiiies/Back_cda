import { Router } from 'express';
import { criteriaController } from '../controllers/criteria.controller';
import { validate } from '../middleware/validate';
import { createCriteriaSchema, updateCriteriaSchema, criteriaIdSchema } from '../validators/criteria.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true }); // Important for accessing scaleId from parent route

// Apply authentication to all criteria routes
router.use(authenticate);

// Combine schemas for routes that need both params and body validation
const createCriteriaValidation = z.object({
  params: z.object({
    scaleId: z.string().or(z.number()).pipe(z.coerce.number().positive())
  }),
  body: createCriteriaSchema
});

const updateCriteriaValidation = z.object({
  params: criteriaIdSchema,
  body: updateCriteriaSchema
});

// Create criteria (teachers and admins only - ownership checked in controller)
router.post('/',
  authorize(['teacher', 'admin']),
  validate(createCriteriaValidation),
  criteriaController.createCriteria
);

// Get criteria by scale ID (any authenticated user)
router.get('/',
  criteriaController.getCriteriaByScaleId
);

// Update criteria (ownership checked in controller)
router.put('/:id',
  authorize(['teacher', 'admin']),
  validate(updateCriteriaValidation),
  criteriaController.updateCriteria
);

// Delete criteria (ownership checked in controller)
router.delete('/:id',
  authorize(['teacher', 'admin']),
  validate(z.object({ params: criteriaIdSchema })),
  criteriaController.deleteCriteria
);

export default router;