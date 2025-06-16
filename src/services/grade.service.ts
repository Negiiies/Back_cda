// ======================================
// CORRECTION: src/services/grade.service.ts
// ======================================

import { Grade, Evaluation, Criteria } from '../models';
import { ICreateGrade, GradeResponseDto } from '../types';
import { AppError } from '../utils/error.handler';
import { BaseService } from './base.service';

export class GradeService extends BaseService<Grade> {
  constructor() {
    super(Grade);
  }

  async createGrade(data: ICreateGrade, teacherId: number): Promise<GradeResponseDto> {
    return Grade.sequelize!.transaction(async (t) => {
      console.log('🔍 GradeService - Creating grade:', {
        data,
        teacherId
      });

      // Verify evaluation exists and belongs to the teacher
      const evaluation = await Evaluation.findOne({
        where: { 
          id: data.evaluationId,
          teacherId
        }
      });

      if (!evaluation) {
        throw new AppError(404, 'Evaluation not found or access denied');
      }

      if (evaluation.status !== 'draft' && evaluation.status !== 'published') {
        throw new AppError(400, 'Can only modify grades of draft or published evaluations');
      }

      // Verify criteria exists and belongs to the evaluation's scale
      const criteria = await Criteria.findOne({
        where: { 
          id: data.criteriaId,
          scaleId: evaluation.scaleId
        }
      });

      if (!criteria) {
        throw new AppError(404, 'Criteria not found or does not belong to evaluation scale');
      }

      // Validate grade value
      if (data.value > criteria.maxPoints) {
        throw new AppError(400, `Grade cannot exceed maximum points (${criteria.maxPoints})`);
      }

      // Check if grade already exists
      const existingGrade = await Grade.findOne({
        where: {
          evaluationId: data.evaluationId,
          criteriaId: data.criteriaId
        }
      });

      if (existingGrade) {
        throw new AppError(400, 'Grade already exists for this criteria');
      }

      console.log('🔍 GradeService - Creating grade in database...');
      const grade = await Grade.create(data, { transaction: t });
      
      console.log('✅ GradeService - Grade created with ID:', grade.id);
      
      // ✅ CORRECTION MAJEURE: Attendre que la transaction soit committée
      // avant de récupérer la note avec ses relations
      
      // Option 1: Retourner la note créée avec les données qu'on a déjà
      const result = {
        id: grade.id,
        evaluationId: grade.evaluationId,
        criteriaId: grade.criteriaId,
        value: grade.value,
        criteria: {
          id: criteria.id,
          description: criteria.description,
          associatedSkill: criteria.associatedSkill,
          maxPoints: criteria.maxPoints,
          coefficient: criteria.coefficient,
          scaleId: criteria.scaleId,
          createdAt: criteria.createdAt,
          updatedAt: criteria.updatedAt
        },
        createdAt: grade.createdAt,
        updatedAt: grade.updatedAt
      };
      
      console.log('✅ GradeService - Returning grade result:', result);
      return result as GradeResponseDto;
    });
  }

  async updateGrade(gradeId: number, value: number, teacherId: number): Promise<GradeResponseDto> {
    return Grade.sequelize!.transaction(async (t) => {
      console.log('🔍 GradeService - Updating grade:', {
        gradeId,
        value,
        teacherId
      });

      const grade = await Grade.findByPk(gradeId, {
        include: [
          {
            model: Evaluation,
            as: 'evaluation',
            required: true
          },
          {
            model: Criteria,
            as: 'criteria',
            required: true
          }
        ]
      });

      if (!grade || grade.evaluation?.teacherId !== teacherId) {
        throw new AppError(404, 'Grade not found or access denied');
      }

      if (grade.evaluation?.status !== 'draft' && grade.evaluation?.status !== 'published') {
        throw new AppError(400, 'Can only modify grades of draft or published evaluations');
      }

      // ✅ CORRECTION: Vérifier que criteria existe
      if (grade.criteria && value > grade.criteria.maxPoints) {
        throw new AppError(400, `Grade cannot exceed maximum points (${grade.criteria.maxPoints})`);
      }

      await grade.update({ value }, { transaction: t });
      
      // ✅ CORRECTION: Retourner directement sans appeler getGradeById
      const result = {
        id: grade.id,
        evaluationId: grade.evaluationId,
        criteriaId: grade.criteriaId,
        value: value, // Nouvelle valeur
        criteria: grade.criteria ? {
          id: grade.criteria.id,
          description: grade.criteria.description,
          associatedSkill: grade.criteria.associatedSkill,
          maxPoints: grade.criteria.maxPoints,
          coefficient: grade.criteria.coefficient,
          scaleId: grade.criteria.scaleId,
          createdAt: grade.criteria.createdAt,
          updatedAt: grade.criteria.updatedAt
        } : undefined,
        createdAt: grade.createdAt,
        updatedAt: new Date() // Mise à jour du timestamp
      };
      
      return result as GradeResponseDto;
    });
  }

  async deleteGrade(gradeId: number, teacherId: number): Promise<void> {
    console.log('🔍 GradeService - Deleting grade:', {
      gradeId,
      teacherId
    });

    const grade = await Grade.findOne({
      where: { id: gradeId },
      include: [{
        model: Evaluation,
        as: 'evaluation',
        required: true
      }]
    });

    if (!grade || grade.evaluation?.teacherId !== teacherId) {
      throw new AppError(404, 'Grade not found or access denied');
    }

    if (grade.evaluation?.status !== 'draft' && grade.evaluation?.status !== 'published') {
      throw new AppError(400, 'Can only delete grades of draft or published evaluations');
    }

    await grade.destroy();
    console.log('✅ GradeService - Grade deleted successfully');
  }

}

export const gradeService = new GradeService();