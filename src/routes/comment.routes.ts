// src/routes/comment.routes.ts - VERSION CORRIGÉE FINALE
import { Router } from 'express';
import { commentController } from '../controllers/comment.controller';
import { validate } from '../middleware/validate';
import { 
  createCommentValidation,
  getCommentsValidation,
  updateCommentValidation,
  deleteCommentValidation
} from '../validators/comment.validator';
import { authenticate, authorize } from '../middleware/auth.middleware';


// ✅ IMPORTANT : mergeParams: true pour accéder à evaluationId
const router = Router({ mergeParams: true });

// Apply authentication to all comment routes
router.use(authenticate);

// ✅ Create comment (teachers only) - evaluationId vient de l'URL
router.post('/',
  authorize(['teacher']),
  validate(createCommentValidation), // ✅ Valide params + body
  commentController.createComment
);

// ✅ Get comments by evaluation ID - evaluationId vient de l'URL
router.get('/',
  validate(getCommentsValidation), // ✅ Valide params
  commentController.getCommentsByEvaluation
);

// Update comment (teachers only, ownership checked in service)
router.put('/:id',
  authorize(['teacher']),
  validate(updateCommentValidation), // ✅ Valide params + body
  commentController.updateComment
);

// Delete comment (teachers only, ownership checked in service)
router.delete('/:id',
  authorize(['teacher']),
  validate(deleteCommentValidation), // ✅ Valide params
  commentController.deleteComment
);

export default router;