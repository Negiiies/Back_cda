// ======================================
// CORRECTION URGENTE: src/controllers/grade.controller.ts
// ======================================

import { Request, Response, NextFunction } from 'express';
import { gradeService } from '../services/grade.service';
import { evaluationService } from '../services/evaluation.service';
import { Grade, Criteria } from '../models';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';

export class GradeController {
  // ✅ CORRECTION MAJEURE: createGrade
  async createGrade(req: Request, res: Response, next: NextFunction) {
    try {
      // ✅ CORRECTION : Récupérer evaluationId depuis l'URL
      const evaluationId = Number(req.params.evaluationId);
      
      // ✅ CORRECTION : Construire gradeData avec evaluationId de l'URL
      const gradeData = {
        ...req.body,
        evaluationId // Ajouter evaluationId du paramètre URL
      };
      
      console.log('🔍 Backend - Creating grade:', {
        evaluationId,
        body: req.body,
        finalData: gradeData,
        teacherId: req.user!.userId
      });

      // ✅ CORRECTION : Utiliser evaluationId de l'URL, pas du body
      const evaluation = await evaluationService.findById(evaluationId);
      if (evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Teachers can only grade their own evaluations');
      }

      const grade = await gradeService.createGrade(gradeData, req.user!.userId);
      
      logger.info(`Grade created for evaluation ${grade.evaluationId} by teacher: ${req.user!.userId}`);
      res.status(201).json(grade);
    } catch (error) {
      console.error('❌ Backend - Error in createGrade controller:', error);
      next(error);
    }
  }

  async getGradesByEvaluation(req: Request, res: Response, next: NextFunction) {
    try {
      const evaluationId = Number(req.params.evaluationId);
      
      console.log('🔍 Backend - Getting grades for evaluation:', {
        evaluationId,
        userId: req.user!.userId,
        userRole: req.user!.role
      });
      
      const evaluation = await evaluationService.findById(evaluationId);

      // Verify access rights
      if (req.user!.role === 'student') {
        if (evaluation.studentId !== req.user!.userId) {
          throw new AppError(403, 'Students can only view their own grades');
        }
        if (evaluation.status === 'draft') {
          throw new AppError(403, 'Students cannot view grades of draft evaluations');
        }
      } else if (req.user!.role === 'teacher' && evaluation.teacherId !== req.user!.userId) {
        throw new AppError(403, 'Teachers can only view grades of their own evaluations');
      }

      // If we get here, the user has access
      const grades = await Grade.findAll({
        where: { evaluationId },
        include: [{
          model: Criteria,
          as: 'criteria'
        }],
        order: [['criteriaId', 'ASC']]
      });

      console.log(`✅ Backend - Found ${grades.length} grades for evaluation ${evaluationId}`);
      res.json(grades);
    } catch (error) {
      console.error('❌ Backend - Error in getGradesByEvaluation:', error);
      next(error);
    }
  }

  async updateGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const { value } = req.body;
      const gradeId = Number(req.params.id);
      const evaluationId = Number(req.params.evaluationId);

      console.log('🔍 Backend - Updating grade:', {
        gradeId,
        evaluationId,
        value,
        teacherId: req.user!.userId
      });

      const grade = await gradeService.updateGrade(
        gradeId,
        value,
        req.user!.userId
      );

      logger.info(`Grade ${gradeId} updated by teacher: ${req.user!.userId}`);
      res.json(grade);
    } catch (error) {
      console.error('❌ Backend - Error in updateGrade controller:', error);
      next(error);
    }
  }

  async deleteGrade(req: Request, res: Response, next: NextFunction) {
    try {
      const gradeId = Number(req.params.id);
      const evaluationId = Number(req.params.evaluationId);
      
      console.log('🔍 Backend - Deleting grade:', {
        gradeId,
        evaluationId,
        teacherId: req.user!.userId
      });
      
      await gradeService.deleteGrade(gradeId, req.user!.userId);
      
      logger.info(`Grade ${gradeId} deleted by teacher: ${req.user!.userId}`);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Backend - Error in deleteGrade controller:', error);
      next(error);
    }
  }
}

export const gradeController = new GradeController();