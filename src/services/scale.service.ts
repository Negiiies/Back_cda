import { Scale, Criteria, Evaluation, User } from '../models';
import { ICreateScale, ScaleResponseDto, ICreateCriteria, IScale, UserResponseDto, CriteriaResponseDto } from '../types';
import { AppError } from '../utils/error.handler';
import { BaseService } from './base.service';
import { Transaction } from 'sequelize';

export class ScaleService extends BaseService<Scale> {
  constructor() {
    super(Scale);
  }

  async createScale(data: ICreateScale & { creatorId: number }): Promise<ScaleResponseDto> {
    const { criteria, ...scaleData } = data;

    return Scale.sequelize!.transaction(async (transaction) => {
      // Create scale
      const scaleToCreate: Omit<IScale, 'id' | 'createdAt' | 'updatedAt'> = {
        title: scaleData.title,
        description: scaleData.description,
        creatorId: scaleData.creatorId
      };

      const scale = await Scale.create(scaleToCreate, { transaction });

      if (criteria?.length) {
        // Validate total coefficient
        const totalCoefficient = criteria.reduce(
          (sum, c) => sum + c.coefficient,
          0
        );

        if (totalCoefficient > 1) {
          throw new AppError(400, 'Total coefficient of criteria cannot exceed 1');
        }

        // Create criteria with the scale ID
        await Criteria.bulkCreate(
          criteria.map(c => ({
            description: c.description,
            associatedSkill: c.associatedSkill,
            maxPoints: c.maxPoints,
            coefficient: c.coefficient,
            scaleId: scale.id
          })),
          { transaction }
        );

        // Fetch the complete scale with associations
        const completeScale = await Scale.findByPk(scale.id, {
          include: [
            {
              model: Criteria,
              as: 'criteria'
            },
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'name', 'email', 'role', 'status', 'description']
            }
          ],
          transaction
        });

        if (!completeScale) {
          throw new AppError(500, 'Error fetching created scale');
        }

        return this.toDTO(completeScale);
      }

      return this.toDTO(scale);
    });
  }

  async getScales(options: { creatorId?: number } = {}): Promise<ScaleResponseDto[]> {
    const where = options.creatorId ? { creatorId: options.creatorId } : {};

    const scales = await Scale.findAll({
      where,
      include: [
        {
          model: Criteria,
          as: 'criteria',
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role', 'status', 'description']
        }
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: Criteria, as: 'criteria' }, 'id', 'ASC']
      ]
    });

    return scales.map(scale => this.toDTO(scale));
  }

  async getScaleById(id: number): Promise<ScaleResponseDto> {
    const scale = await Scale.findByPk(id, {
      include: [
        {
          model: Criteria,
          as: 'criteria',
          required: false
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'role', 'status', 'description']
        }
      ],
      order: [
        [{ model: Criteria, as: 'criteria' }, 'id', 'ASC']
      ]
    });

    if (!scale) {
      throw new AppError(404, 'Scale not found');
    }

    return this.toDTO(scale);
  }

  async updateScale(id: number, data: Partial<ICreateScale>): Promise<ScaleResponseDto> {
    const { criteria, ...scaleData } = data;

    return Scale.sequelize!.transaction(async (transaction) => {
      const scale = await this.findById(id);

      // Check if scale is used in any evaluations before updating criteria
      if (criteria) {
        await this.validateCriteriaUpdate(id, criteria, transaction);
      }

      // Update scale data if provided
      if (Object.keys(scaleData).length > 0) {
        await scale.update(scaleData, { transaction });
      }

      // Fetch updated scale with associations
      const updatedScale = await Scale.findByPk(id, {
        include: [
          {
            model: Criteria,
            as: 'criteria',
            required: false
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'role', 'status', 'description']
          }
        ],
        transaction
      });

      if (!updatedScale) {
        throw new AppError(500, 'Error fetching updated scale');
      }

      return this.toDTO(updatedScale);
    });
  }

  private async validateCriteriaUpdate(
    scaleId: number, 
    criteria: ICreateCriteria[], 
    transaction: Transaction
  ): Promise<void> {
    const hasEvaluations = await Evaluation.findOne({
      where: { scaleId }
    });

    if (hasEvaluations) {
      throw new AppError(400, 'Cannot modify criteria of a scale that is already used in evaluations');
    }

    const totalCoefficient = criteria.reduce(
      (sum, c) => sum + c.coefficient,
      0
    );

    if (totalCoefficient > 1) {
      throw new AppError(400, 'Total coefficient of criteria cannot exceed 1');
    }

    // Delete existing criteria
    await Criteria.destroy({
      where: { scaleId },
      transaction
    });

    // Create new criteria
    await Criteria.bulkCreate(
      criteria.map(c => ({
        description: c.description,
        associatedSkill: c.associatedSkill,
        maxPoints: c.maxPoints,
        coefficient: c.coefficient,
        scaleId
      })),
      { transaction }
    );
  }

  async deleteScale(id: number): Promise<void> {
    const scale = await this.findById(id);

    const evaluationCount = await Evaluation.count({
      where: { scaleId: id }
    });

    if (evaluationCount > 0) {
      throw new AppError(400, 'Cannot delete scale: it is being used in evaluations');
    }

    await scale.destroy();
  }

  private toDTO(scale: Scale): ScaleResponseDto {
    const creator = scale.creator ? {
      id: scale.creator.id,
      name: scale.creator.name,
      email: scale.creator.email,
      role: scale.creator.role,
      status: scale.creator.status,
      description: scale.creator.description,
      createdAt: scale.creator.createdAt,
      updatedAt: scale.creator.updatedAt
    } as UserResponseDto : undefined;

    const criteria = scale.criteria?.map(c => ({
      id: c.id,
      description: c.description,
      associatedSkill: c.associatedSkill,
      maxPoints: c.maxPoints,
      coefficient: c.coefficient,
      scaleId: c.scaleId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt
    } as CriteriaResponseDto));

    return {
      id: scale.id,
      title: scale.title,
      description: scale.description,
      creatorId: scale.creatorId,
      creator,
      criteria,
      createdAt: scale.createdAt,
      updatedAt: scale.updatedAt
    };
  }
}

export const scaleService = new ScaleService();