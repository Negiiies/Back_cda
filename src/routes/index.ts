import { Router } from 'express';
import userRoutes from './user.routes';
import scaleRoutes from './scale.routes';
import criteriaRoutes from './criteria.routes';
import evaluationRoutes from './evaluation.routes';
import gradeRoutes from './grade.routes'; // Import the grade routes
import commentRoutes from './comment.routes'; // Import the comment routes

const router = Router();
// Main routes
router.use('/users', userRoutes);
router.use('/scales', scaleRoutes);
router.use('/evaluations', evaluationRoutes);

// Nested routes
router.use('/scales/:scaleId/criteria', criteriaRoutes);
console.log('🔍 DEBUG: commentRoutes type:', typeof commentRoutes);
console.log('🔍 DEBUG: Montage route comments...');
router.use('/evaluations/:evaluationId/comments', commentRoutes); // Nest comments under evaluations
console.log('✅ DEBUG: Route comments montée !');
router.use('/evaluations/:evaluationId/grades', gradeRoutes); // Nest grades under evaluations

export default router;