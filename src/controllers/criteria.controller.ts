import { Request, Response, NextFunction } from 'express';
import { criteriaService } from '../services/criteria.service';
import { scaleService } from '../services/scale.service';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';

export class CriteriaController {
  async createCriteria(req: Request, res: Response, next: NextFunction) {
    try {
      const scaleId = Number(req.params.scaleId);
      
      // Verify scale exists and user has permission
      const scale = await scaleService.getScaleById(scaleId);
      if (scale.creatorId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the scale creator or admin can add criteria');
      }

      const criteriaData = {
        ...req.body,
        scaleId
      };
      
      const criteria = await criteriaService.createCriteria(criteriaData);
      logger.info(`Criteria created: ${criteria.id} for scale: ${scaleId} by user: ${req.user!.userId}`);
      res.status(201).json(criteria);
    } catch (error) {
      next(error);
    }
  }

  async getCriteriaByScaleId(req: Request, res: Response, next: NextFunction) {
    try {
      const criteria = await criteriaService.getCriteriaByScaleId(
        Number(req.params.scaleId)
      );
      res.json(criteria);
    } catch (error) {
      next(error);
    }
  }

  async updateCriteria(req: Request, res: Response, next: NextFunction) {
    try {
      const criteriaId = Number(req.params.id);
      const criteria = await criteriaService.findById(criteriaId);
      
      // Verify scale ownership
      const scale = await scaleService.getScaleById(criteria.scaleId);
      if (scale.creatorId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the scale creator or admin can modify criteria');
      }

      const updatedCriteria = await criteriaService.updateCriteria(
        criteriaId,
        req.body
      );
      
      logger.info(`Criteria ${criteriaId} updated by user: ${req.user!.userId}`);
      res.json(updatedCriteria);
    } catch (error) {
      next(error);
    }
  }

  async deleteCriteria(req: Request, res: Response, next: NextFunction) {
    try {
      const criteriaId = Number(req.params.id);
      const criteria = await criteriaService.findById(criteriaId);
      
      // Verify scale ownership
      const scale = await scaleService.getScaleById(criteria.scaleId);
      if (scale.creatorId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the scale creator or admin can delete criteria');
      }

      await criteriaService.deleteCriteria(criteriaId);
      logger.info(`Criteria ${criteriaId} deleted by user: ${req.user!.userId}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const criteriaController = new CriteriaController();