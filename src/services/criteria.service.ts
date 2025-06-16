import { Criteria, Scale, Grade } from '../models';
import { ICreateCriteria, CriteriaResponseDto, ICriteria } from '../types';
import { AppError } from '../utils/error.handler';
import { BaseService } from './base.service';

export class CriteriaService extends BaseService<Criteria> {
  constructor() {
    super(Criteria);
  }

  async createCriteria(data: ICreateCriteria & { scaleId: number }): Promise<CriteriaResponseDto> {
    // Verify scale exists
    const scale = await Scale.findByPk(data.scaleId);
    if (!scale) {
      throw new AppError(404, 'Scale not found');
    }

    // Check total coefficient for scale
    const existingCriteria = await Criteria.findAll({
      where: { scaleId: data.scaleId }
    });

    const totalCoefficient = existingCriteria.reduce(
      (sum, criteria) => sum + criteria.coefficient, 
      0
    );

    if (totalCoefficient + data.coefficient > 1) {
      throw new AppError(400, 'Total coefficient cannot exceed 1');
    }

    const criteriaData: ICriteria = {
      description: data.description,
      associatedSkill: data.associatedSkill,
      maxPoints: data.maxPoints,
      coefficient: data.coefficient,
      scaleId: data.scaleId
    };

    const criteria = await Criteria.create(criteriaData);
    return this.toDTO(criteria);
  }

  async updateCriteria(id: number, data: Partial<ICreateCriteria>): Promise<CriteriaResponseDto> {
    const criteria = await this.findById(id);

    // If coefficient is being updated, check total coefficient
    if (data.coefficient !== undefined) {
      const scaleCriteria = await Criteria.findAll({
        where: { scaleId: criteria.scaleId }
      });

      const totalCoefficient = scaleCriteria.reduce(
        (sum, c) => sum + (c.id === id ? data.coefficient! : c.coefficient),
        0
      );

      if (totalCoefficient > 1) {
        throw new AppError(400, 'Total coefficient cannot exceed 1');
      }
    }

    // Check if criteria is used in any evaluations before updating maxPoints
    if (data.maxPoints !== undefined) {
      const hasGrades = await Grade.findOne({
        where: { criteriaId: id }
      });

      if (hasGrades) {
        throw new AppError(400, 'Cannot modify maxPoints for criteria that has grades');
      }
    }

    await criteria.update(data);
    return this.toDTO(criteria);
  }

  async deleteCriteria(id: number): Promise<void> {
    const criteria = await this.findById(id);

    // Check if this is the last criteria for the scale
    const criteriaCount = await Criteria.count({
      where: { scaleId: criteria.scaleId }
    });

    if (criteriaCount <= 1) {
      throw new AppError(400, 'Cannot delete the last criteria of a scale');
    }

    // Check if criteria is used in any evaluations
    const hasGrades = await Grade.findOne({
      where: { criteriaId: id }
    });

    if (hasGrades) {
      throw new AppError(400, 'Cannot delete criteria that has grades');
    }

    await criteria.destroy();
  }

  async getCriteriaByScaleId(scaleId: number): Promise<CriteriaResponseDto[]> {
    const criteria = await Criteria.findAll({
      where: { scaleId },
      order: [['id', 'ASC']]
    });

    return criteria.map(c => this.toDTO(c));
  }

  private toDTO(criteria: Criteria): CriteriaResponseDto {
    return {
      id: criteria.id,
      description: criteria.description,
      associatedSkill: criteria.associatedSkill,
      maxPoints: criteria.maxPoints,
      coefficient: criteria.coefficient,
      scaleId: criteria.scaleId,
      createdAt: criteria.createdAt,
      updatedAt: criteria.updatedAt
    };
  }
}

export const criteriaService = new CriteriaService();