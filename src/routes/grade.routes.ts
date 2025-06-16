import { Router } from 'express';
import { gradeController } from '../controllers/grade.controller';
import { validate } from '../middleware/validate';
import { createGradeSchema, updateGradeSchema, gradeIdSchema } from '../validators/grade.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router({ mergeParams: true });

// Apply authentication to all grade routes
router.use(authenticate);

// Validation schemas
const updateGradeValidation = z.object({
  params: gradeIdSchema,
  body: updateGradeSchema
});

// Create grade (teachers only)
router.post('/',
  authorize(['teacher']),
  validate(z.object({ body: createGradeSchema })),
  gradeController.createGrade
);

// Get grades by evaluation ID
router.get('/',
  gradeController.getGradesByEvaluation
);

// Update grade (teachers only)
router.put('/:id',
  authorize(['teacher']),
  validate(updateGradeValidation),
  gradeController.updateGrade
);

// Delete grade (teachers only)
router.delete('/:id',
  authorize(['teacher']),
  validate(z.object({ params: gradeIdSchema })),
  gradeController.deleteGrade
);


export default router;