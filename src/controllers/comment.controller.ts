// src/controllers/comment.controller.ts - ✅ VERSION FINALE À APPLIQUER
import { Request, Response, NextFunction } from 'express';
import { commentService } from '../services/comment.service';
import { evaluationService } from '../services/evaluation.service';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';

export class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('=== DEBUG COMMENT CREATION ===');
      console.log('req.params:', req.params);
      console.log('req.body:', req.body);
      console.log('req.user:', req.user);
      console.log('req.url:', req.url);
      console.log('req.method:', req.method);
      
      const { text } = req.body;
      const evaluationId = Number(req.params.evaluationId);
      
      console.log('Extracted evaluationId:', evaluationId);
      console.log('Extracted text:', text);
      
      // ... reste du code
      // Vérifier que evaluationId est valide
      if (!evaluationId || isNaN(evaluationId)) {
        throw new AppError(400, 'Invalid evaluation ID');
      }

      // Verify evaluation exists and teacher has access
      const evaluation = await evaluationService.findById(evaluationId);
      if (evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Teachers can only comment on their own evaluations');
      }

      const commentData = {
        evaluationId, // ✅ Vient de l'URL maintenant
        teacherId: req.user!.userId,
        text
      };

      const comment = await commentService.createComment(commentData);
      logger.info(`Comment created for evaluation ${evaluationId} by teacher: ${req.user!.userId}`);
      res.status(201).json(comment);
    } catch (error) {
      next(error);
    }
  }

  async getCommentsByEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ evaluationId vient aussi de l'URL ici
      const evaluationId = Number(req.params.evaluationId);
      
      if (!evaluationId || isNaN(evaluationId)) {
        throw new AppError(400, 'Invalid evaluation ID');
      }

      const evaluation = await evaluationService.findById(evaluationId);

      // Verify access rights
      if (!req.user) {
        throw new AppError(401, 'Unauthorized: User not authenticated');
      }
      
      if (req.user!.role === 'student') {
        if (evaluation.studentId !== req.user!.userId) {
          throw new AppError(403, 'Students can only view comments on their own evaluations');
        }
        if (evaluation.status === 'draft') {
          throw new AppError(403, 'Students cannot view comments on draft evaluations');
        }
      } else if (req.user!.role === 'teacher' && evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Teachers can only view comments on their own evaluations');
      }

      const comments = await commentService.getCommentsByEvaluation(evaluationId);
      res.json(comments);
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = Number(req.params.id);
      const { text } = req.body;

      if (!commentId || isNaN(commentId)) {
        throw new AppError(400, 'Invalid comment ID');
      }

      // Service will verify ownership
      const comment = await commentService.updateComment(
        commentId,
        text,
        req.user!.userId
      );

      logger.info(`Comment ${commentId} updated by teacher: ${req.user!.userId}`);
      res.json(comment);
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const commentId = Number(req.params.id);

      if (!commentId || isNaN(commentId)) {
        throw new AppError(400, 'Invalid comment ID');
      }

      // Service will verify ownership
      await commentService.deleteComment(commentId, req.user!.userId);
      logger.info(`Comment ${commentId} deleted by teacher: ${req.user!.userId}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const commentController = new CommentController();