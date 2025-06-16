import { Evaluation, User, Scale, Criteria, Grade, Comment } from '../models';
import { ICreateEvaluation, EvaluationResponseDto, EvaluationStatus, GradeResponseDto, CommentResponseDto, UserResponseDto, ScaleResponseDto, CriteriaResponseDto } from '../types';
import { AppError } from '../utils/error.handler';
import { BaseService } from './base.service';
import { Op, WhereOptions } from 'sequelize';

export class EvaluationService extends BaseService<Evaluation> {
  constructor() {
    super(Evaluation);
  }

  async getEvaluations(options: {
    teacherId?: number;
    studentId?: number;
    status?: EvaluationStatus;
    from?: Date;
    to?: Date;
  } = {}): Promise<EvaluationResponseDto[]> {
    const where: WhereOptions = {};

    if (options.teacherId) where.teacherId = options.teacherId;
    if (options.studentId) where.studentId = options.studentId;
    if (options.status) where.status = options.status;
    if (options.from || options.to) {
      where.dateEval = {};
      if (options.from) where.dateEval[Op.gte] = options.from;
      if (options.to) where.dateEval[Op.lte] = options.to;
    }

    const evaluations = await Evaluation.findAll({
      where,
      include: this.getEvaluationIncludes(),
      order: [
        ['dateEval', 'DESC'],
        ['createdAt', 'DESC'],
        [{ model: Grade, as: 'grades' }, 'criteriaId', 'ASC'],
        [{ model: Comment, as: 'comments' }, 'createdAt', 'DESC']
      ]
    });

    return evaluations.map(evaluation => this.toDTO(evaluation));
  }

  // Cette méthode est rendue publique pour être utilisée ailleurs
  async getEvaluationById(id: number): Promise<EvaluationResponseDto> {
  console.log(`Chargement de l'évaluation ${id} avec toutes les relations`);
  
  // Utiliser findByPk avec { rejectOnEmpty: false } pour éviter l'erreur si pas trouvé
  const evaluation = await Evaluation.findByPk(id, {
    include: this.getEvaluationIncludes(),
    rejectOnEmpty: false // Évite l'erreur de Sequelize si pas trouvé
  });

  // Vérification manuelle avec message d'erreur plus clair
  if (!evaluation) {
    console.error(`Évaluation ${id} introuvable dans la base de données`);
    throw new AppError(404, `Evaluation with ID ${id} not found`);
  }
  
  console.log(`Évaluation ${id} chargée avec succès`);
  return this.toDTO(evaluation);
}

async createEvaluation(data: ICreateEvaluation): Promise<EvaluationResponseDto> {
  // Conversion explicite des IDs en nombres
  const studentId = Number(data.studentId);
  const teacherId = Number(data.teacherId);
  const scaleId = Number(data.scaleId);
  
  // Normalisation de la date
  let dateEval: Date;
  if (typeof data.dateEval === 'string') {
    // Si c'est une chaîne, convertir en objet Date
    dateEval = new Date(data.dateEval);
    
    // Vérifier si la date est valide
    if (isNaN(dateEval.getTime())) {
      throw new AppError(400, 'Invalid date format');
    }
  } else if (data.dateEval instanceof Date) {
    // Si c'est déjà un objet Date, l'utiliser directement
    dateEval = data.dateEval;
  } else {
    throw new AppError(400, 'Invalid date format');
  }
  
  console.log('Date après normalisation:', dateEval);

  return Evaluation.sequelize!.transaction(async (t) => {
    try {
      // Vérifier l'étudiant
      const student = await User.findByPk(studentId);
      if (!student || student.role !== 'student') {
        throw new AppError(400, 'Invalid student ID');
      }

      // Vérifier le professeur
      const teacher = await User.findByPk(teacherId);
      if (!teacher || teacher.role !== 'teacher') {
        throw new AppError(400, 'Invalid teacher ID');
      }

      // Vérifier le barème
      const scale = await Scale.findByPk(scaleId);
      if (!scale) {
        throw new AppError(400, 'Invalid scale ID');
      }

      // Créer l'évaluation avec les IDs convertis et la date normalisée
      console.log('Création de l\'évaluation avec les données:', {
        title: data.title,
        dateEval: dateEval,
        studentId,
        teacherId,
        scaleId,
        status: 'draft'
      });
      
      const evaluation = await Evaluation.create({
        title: data.title,
        dateEval: dateEval,
        studentId,
        teacherId,
        scaleId,
        status: 'draft'
      }, { transaction: t });
      
      console.log('Évaluation créée avec succès, ID:', evaluation.id);

      // Retourner un objet simplifié sans faire de nouvelle requête
      const result = {
        id: evaluation.id,
        title: evaluation.title,
        dateEval: evaluation.dateEval,
        studentId,
        teacherId,
        scaleId,
        status: 'draft' as EvaluationStatus,
        createdAt: evaluation.createdAt,
        updatedAt: evaluation.updatedAt
      };
      
      return result;
    } catch (error) {
      console.error('Erreur dans createEvaluation:', error);
      throw error;
    }
  });
}
  
  async updateEvaluation(
    id: number, 
    data: Partial<ICreateEvaluation>
  ): Promise<EvaluationResponseDto> {
    return Evaluation.sequelize!.transaction(async (t) => {
      try {
        const evaluation = await this.findById(id);
  
        // Extraire les champs que nous ne voulons pas modifier
        const { studentId, teacherId, scaleId, ...updateData } = data;
  
        if (studentId || teacherId || scaleId) {
          throw new AppError(400, 'Cannot modify student, teacher, or scale of an existing evaluation');
        }
  
        // Vérification explicite des types pour éviter les erreurs TypeScript
        const safeUpdateData: any = {};
        
        // Copier uniquement les champs autorisés et définis
        if (updateData.title !== undefined) safeUpdateData.title = updateData.title;
        if (updateData.dateEval !== undefined) {
          // Normaliser la date si nécessaire
          if (typeof updateData.dateEval === 'string') {
            safeUpdateData.dateEval = new Date(updateData.dateEval);
          } else {
            safeUpdateData.dateEval = updateData.dateEval;
          }
        }
        if (updateData.status !== undefined) safeUpdateData.status = updateData.status;
  
        console.log('Mise à jour de l\'évaluation avec les données:', safeUpdateData);
        
        // Mise à jour avec les données sécurisées
        await evaluation.update(safeUpdateData, { transaction: t });
        
        return this.getEvaluationById(id);
      } catch (error) {
        console.error('Erreur dans updateEvaluation:', error);
        throw error;
      }
    });
  }

  async changeStatus(
  id: number,
  newStatus: EvaluationStatus,
  teacherId: number
): Promise<EvaluationResponseDto> {
  return Evaluation.sequelize!.transaction(async (t) => {
    try {
      const evaluation = await this.findById(id);

      // Verify teacher owns this evaluation
      if (evaluation.teacherId !== teacherId) {
        throw new AppError(403, 'Only the teacher who created this evaluation can modify its status');
      }

      // Verify status transition is valid
      if (!this.isValidStatusTransition(evaluation.status, newStatus)) {
        throw new AppError(400, `Cannot transition from ${evaluation.status} to ${newStatus}`);
      }

      // For publishing, verify all criteria have grades
      if (newStatus === 'published') {
        const scale = await Scale.findByPk(evaluation.scaleId, {
          include: [{ model: Criteria, as: 'criteria' }]
        });
      
        if (!scale?.criteria) {
          throw new AppError(400, 'Scale criteria not found');
        }
      
        
      }

      // Mise à jour avec une valeur explicite
      await evaluation.update({ status: newStatus }, { transaction: t });
      
      return this.getEvaluationById(id);
    } catch (error) {
      console.error('Erreur dans changeStatus:', error);
      throw error;
    }
  });
}

  private isValidStatusTransition(
    currentStatus: EvaluationStatus,
    newStatus: EvaluationStatus
  ): boolean {
    const validTransitions: Record<EvaluationStatus, EvaluationStatus[]> = {
      draft: ['published'],
      published: ['archived'],
      archived: []
    };

  return validTransitions[currentStatus].includes(newStatus);
}

  private getEvaluationIncludes() {
    return [
      {
        model: User,
        as: 'student',
        attributes: ['id', 'name', 'email', 'role', 'status', 'description']
      },
      {
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email', 'role', 'status', 'description']
      },
      {
        model: Scale,
        as: 'scale',
        include: [
          {
            model: Criteria,
            as: 'criteria'
          }
        ]
      },
      {
        model: Grade,
        as: 'grades',
        include: [
          {
            model: Criteria,
            as: 'criteria'
          }
        ]
      },
      {
        model: Comment,
        as: 'comments',
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'name', 'email', 'role']
          }
        ]
      }
    ];
  }

  protected toDTO(evaluation: Evaluation): EvaluationResponseDto {
    return {
      id: evaluation.id,
      title: evaluation.title,
      dateEval: evaluation.dateEval,
      studentId: evaluation.studentId,
      teacherId: evaluation.teacherId,
      scaleId: evaluation.scaleId,
      status: evaluation.status,
      student: evaluation.student ? this.toUserDTO(evaluation.student) : undefined,
      teacher: evaluation.teacher ? this.toUserDTO(evaluation.teacher) : undefined,
      scale: evaluation.scale ? this.toScaleDTO(evaluation.scale) : undefined,
      grades: evaluation.grades?.map(grade => this.toGradeDTO(grade)),
      comments: evaluation.comments?.map(comment => this.toCommentDTO(comment)),
      createdAt: evaluation.createdAt,
      updatedAt: evaluation.updatedAt
    };
  }

  private toUserDTO(user: User): UserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      description: user.description,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  private toScaleDTO(scale: Scale): ScaleResponseDto {
    return {
      id: scale.id,
      title: scale.title,
      description: scale.description,
      creatorId: scale.creatorId,
      criteria: scale.criteria?.map(c => this.toCriteriaDTO(c)),
      createdAt: scale.createdAt,
      updatedAt: scale.updatedAt
    };
  }

  private toGradeDTO(grade: Grade): GradeResponseDto & { criteria?: CriteriaResponseDto } {
    return {
      id: grade.id,
      evaluationId: grade.evaluationId,
      criteriaId: grade.criteriaId,
      value: grade.value,
      criteria: grade.criteria ? this.toCriteriaDTO(grade.criteria) : undefined,
      createdAt: grade.createdAt,
      updatedAt: grade.updatedAt
    };
  }

  private toCommentDTO(comment: Comment): CommentResponseDto & { teacher?: UserResponseDto } {
    return {
      id: comment.id,
      evaluationId: comment.evaluationId,
      teacherId: comment.teacherId,
      text: comment.text,
      teacher: comment.teacher ? this.toUserDTO(comment.teacher) : undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  }

  private toCriteriaDTO(criteria: Criteria): CriteriaResponseDto {
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

export const evaluationService = new EvaluationService();