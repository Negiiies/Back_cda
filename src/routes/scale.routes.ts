import { Router } from 'express';
import { scaleController } from '../controllers/scale.controller';
import { validate } from '../middleware/validate';
import { createScaleSchema, updateScaleSchema, scaleIdSchema } from '../validators/scale.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { z } from 'zod';

const router = Router();

// Apply authentication to all scale routes
router.use(authenticate);

// Combine schemas for routes that need both params and body validation
const updateScaleValidation = z.object({
  params: scaleIdSchema,
  body: updateScaleSchema
});

// Create scale (teachers and admins only)
router.post('/',
  authorize(['teacher', 'admin']),
  validate(z.object({ body: createScaleSchema })),
  scaleController.createScale
);

// Get all scales (filtered by role in controller)
router.get('/',
  scaleController.getScales
);

// Get scale by ID (any authenticated user)
router.get('/:id',
  validate(z.object({ params: scaleIdSchema })),
  scaleController.getScaleById
);

// Update scale (ownership checked in controller)
router.put('/:id',
  authorize(['teacher', 'admin']),
  validate(updateScaleValidation),
  scaleController.updateScale
);

// Delete scale (ownership checked in controller)
router.delete('/:id',
  authorize(['teacher', 'admin']),
  validate(z.object({ params: scaleIdSchema })),
  scaleController.deleteScale
);

export default router;