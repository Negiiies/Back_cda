import { Request, Response, NextFunction } from 'express';
import { scaleService } from '../services/scale.service';
import { AppError } from '../utils/error.handler';
import logger from '../utils/logger';

export class ScaleController {
  async createScale(req: Request, res: Response, next: NextFunction) {
    try {
      const scaleData = {
        ...req.body,
        creatorId: req.user!.userId // From auth middleware
      };
      
      const scale = await scaleService.createScale(scaleData);
      logger.info(`Scale created: ${scale.id} by user: ${req.user!.userId}`);
      res.status(201).json(scale);
    } catch (error) {
      next(error);
    }
  }

  async getScales(req: Request, res: Response, next: NextFunction) {
    try {
      let scales;
      // Admin sees all scales, teachers see their own
      if (req.user!.role === 'admin') {
        scales = await scaleService.getScales();
      } else {
        scales = await scaleService.getScales({ creatorId: req.user!.userId });
      }
      res.json(scales);
    } catch (error) {
      next(error);
    }
  }

  async getScaleById(req: Request, res: Response, next: NextFunction) {
    try {
      const scale = await scaleService.getScaleById(Number(req.params.id));
      res.json(scale);
    } catch (error) {
      next(error);
    }
  }

  async updateScale(req: Request, res: Response, next: NextFunction) {
    try {
      const scale = await scaleService.getScaleById(Number(req.params.id));
      
      // Only creator or admin can update
      if (scale.creatorId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the creator or admin can modify this scale');
      }

      const updatedScale = await scaleService.updateScale(Number(req.params.id), req.body);
      logger.info(`Scale ${req.params.id} updated by user: ${req.user!.userId}`);
      res.json(updatedScale);
    } catch (error) {
      next(error);
    }
  }

  async deleteScale(req: Request, res: Response, next: NextFunction) {
    try {
      const scale = await scaleService.getScaleById(Number(req.params.id));
      
      // Only creator or admin can delete
      if (scale.creatorId !== req.user!.userId && req.user!.role !== 'admin') {
        throw new AppError(403, 'Only the creator or admin can delete this scale');
      }

      await scaleService.deleteScale(Number(req.params.id));
      logger.info(`Scale ${req.params.id} deleted by user: ${req.user!.userId}`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export const scaleController = new ScaleController();