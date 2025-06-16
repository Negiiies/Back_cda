import { Request, Response, NextFunction } from 'express';
import { evaluationService } from '../services/evaluation.service';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';
import { Op } from 'sequelize';
import { EvaluationStatus } from '../types';

export class EvaluationController {
  async createEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('Requête reçue pour createEvaluation:', req.body);
      
      // Conversion explicite des IDs en nombres pour s'assurer qu'ils sont bien traités
      const evaluationData = {
        title: req.body.title,
        dateEval: req.body.dateEval,
        studentId: Number(req.body.studentId),
        teacherId: req.user!.userId, // ID du professeur connecté
        scaleId: Number(req.body.scaleId)
      };
      
      console.log('Données pour création d\'évaluation:', evaluationData);
  
      const evaluation = await evaluationService.createEvaluation(evaluationData);
      console.log(`Évaluation créée: ${evaluation.id} par professeur: ${req.user!.userId}`);
      
      res.status(201).json(evaluation);
    } catch (error) {
      console.error('Erreur dans le contrôleur createEvaluation:', error);
      next(error);
    }
  }

  async getEvaluations(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, from, to } = req.query;
      const options: any = {};

      // Parse date filters if provided
      if (from) options.from = new Date(from as string);
      if (to) options.to = new Date(to as string);
      if (status) options.status = status as EvaluationStatus;

      // Filter based on user role
      switch (req.user!.role) {
        case 'teacher':
          options.teacherId = req.user!.userId;
          break;
        case 'student':
          options.studentId = req.user!.userId;
          // Students can only see published or archived evaluations
          if (!status) {
            options.status = { [Op.in]: ['published', 'archived'] };
          }
          break;
        case 'admin':
          // Admin can see all evaluations
          break;
      }

      const evaluations = await evaluationService.getEvaluations(options);
      res.json(evaluations);
    } catch (error) {
      next(error);
    }
  }

  async getEvaluationById(req: Request, res: Response, next: NextFunction) {
    try {
      const evaluation = await evaluationService.findById(Number(req.params.id));

      // Check access rights
      if (req.user!.role === 'student') {
        if (evaluation.studentId !== req.user!.userId) {
          throw new AppError(403, 'Students can only view their own evaluations');
        }
        if (evaluation.status === 'draft') {
          throw new AppError(403, 'Students cannot view draft evaluations');
        }
      } else if (req.user!.role === 'teacher' && evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Teachers can only view their own evaluations');
      }

      res.json(evaluation);
    } catch (error) {
      next(error);
    }
  }

  async updateEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const evaluationId = Number(req.params.id);
      const evaluation = await evaluationService.findById(evaluationId);

      // Only the assigned teacher can update their draft evaluations
      if (evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Only the assigned teacher can modify this evaluation');
      }

      if (evaluation.status !== 'draft') {
        throw new AppError(400, 'Only draft evaluations can be modified');
      }

      const updatedEvaluation = await evaluationService.updateEvaluation(
        evaluationId,
        req.body
      );
      
      logger.info(`Evaluation ${evaluationId} updated by teacher: ${req.user!.userId}`);
      res.json(updatedEvaluation);
    } catch (error) {
      next(error);
    }
  }

  async deleteEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const evaluationId = Number(req.params.id);
      const evaluation = await evaluationService.findById(evaluationId);

      // Only the assigned teacher can delete their draft evaluations
      if (evaluation.teacherId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the assigned teacher or admin can delete this evaluation');
      }

      if (evaluation.status !== 'draft' && req.user!.role !== 'admin') {
        throw new AppError(400, 'Only draft evaluations can be deleted');
      }

      await evaluationService.delete(evaluationId);
      logger.info(`Evaluation ${evaluationId} deleted by user: ${req.user!.userId}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async changeStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const evaluationId = Number(req.params.id);

      const evaluation = await evaluationService.findById(evaluationId);
      
      // Only the assigned teacher can change status
      if (evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Only the assigned teacher can modify this evaluation');
      }

      const updatedEvaluation = await evaluationService.changeStatus(
        evaluationId,
        status,
        req.user!.userId
      );

      logger.info(`Evaluation ${evaluationId} status changed to ${status} by teacher: ${req.user!.userId}`);
      res.json(updatedEvaluation);
    } catch (error) {
      next(error);
    }
  }
}

export const evaluationController = new EvaluationController();