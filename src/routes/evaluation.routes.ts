import { Router } from 'express';
import { evaluationController } from '../controllers/evaluation.controller';
import { validate } from '../middleware/validate';
import { 
  createEvaluationSchema, 
  updateEvaluationSchema, 
  evaluationIdSchema,
  changeStatusSchema
} from '../validators/evaluation.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

// Apply authentication to all evaluation routes
router.use(authenticate);

// Combine schemas for routes that need both params and body validation
const updateEvaluationValidation = z.object({
  params: evaluationIdSchema,
  body: updateEvaluationSchema
});

const changeStatusValidation = z.object({
  params: evaluationIdSchema,
  body: changeStatusSchema
});

// Create evaluation (teachers only)
router.post('/',
  authorize(['teacher']),
  validate(z.object({ body: createEvaluationSchema })),
  evaluationController.createEvaluation
);

// Get all evaluations (filtered by role in controller)
router.get('/',
  evaluationController.getEvaluations
);

// Get evaluation by ID (access rights checked in controller)
router.get('/:id',
  validate(z.object({ params: evaluationIdSchema })),
  evaluationController.getEvaluationById
);

// Update evaluation (access rights checked in controller)
router.put('/:id',
  authorize(['teacher']),
  validate(updateEvaluationValidation),
  evaluationController.updateEvaluation
);

// Change evaluation status
router.patch('/:id/status',
  authorize(['teacher']),
  validate(changeStatusValidation),
  evaluationController.changeStatus
);

// Delete evaluation (access rights checked in controller)
router.delete('/:id',
  authorize(['teacher', 'admin']),
  validate(z.object({ params: evaluationIdSchema })),
  evaluationController.deleteEvaluation
);

export default router;