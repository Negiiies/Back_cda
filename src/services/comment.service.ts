import { Comment, Evaluation, User } from '../models';
import { ICreateComment, CommentResponseDto } from '../types';
import { AppError } from '../utils/error.handler';
import { BaseService } from './base.service';

export class CommentService extends BaseService<Comment> {
  constructor() {
    super(Comment);
  }

  async createComment(data: ICreateComment): Promise<CommentResponseDto> {
    console.log('=== COMMENT SERVICE DEBUG ===');
    console.log('createComment data:', data);
    
    return Comment.sequelize!.transaction(async (t) => {
      console.log('Looking for evaluation with ID:', data.evaluationId);
      
      // Verify evaluation exists
      const evaluation = await Evaluation.findByPk(data.evaluationId, { transaction: t });
      console.log('Found evaluation:', evaluation ? 'YES' : 'NO');
      
      if (!evaluation) {
        console.log('❌ Evaluation not found!');
        throw new AppError(404, 'Evaluation not found');
      }
      
      console.log('Evaluation teacher ID:', evaluation.teacherId);
      console.log('Requesting teacher ID:', data.teacherId);
      
      // Verify teacher exists and is a teacher
      console.log('Looking for teacher with ID:', data.teacherId);
      const teacher = await User.findOne({
        where: { 
          id: data.teacherId,
          role: 'teacher'
        },
        transaction: t // ✅ Ajouter la transaction
      });
  
      console.log('Found teacher:', teacher ? 'YES' : 'NO');
      if (teacher) {
        console.log('Teacher details:', { id: teacher.id, role: teacher.role });
      }
  
      if (!teacher) {
        console.log('❌ Teacher not found!');
        throw new AppError(404, 'Teacher not found');
      }
      
      // Verify teacher is related to the evaluation
      if (evaluation.teacherId !== data.teacherId) {
        console.log('❌ Teacher not assigned to this evaluation!');
        throw new AppError(403, 'Only the assigned teacher can comment on this evaluation');
      }
  
      console.log('✅ All verifications passed, creating comment...');
      const comment = await Comment.create(data, { transaction: t });
      console.log('✅ Comment created with ID:', comment.id);
  
      console.log('Getting comment details with transaction...');
      
      // ✅ CORRECTION MAJEURE : Récupérer le commentaire DANS la transaction
      const commentWithDetails = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'teacher',
          attributes: ['id', 'name', 'email', 'role']
        }],
        transaction: t // ✅ IMPORTANT : Utiliser la même transaction
      });
  
      if (!commentWithDetails) {
        throw new AppError(500, 'Failed to retrieve created comment');
      }
  
      console.log('✅ Comment details retrieved successfully');
      return this.toDTO(commentWithDetails);
    });
  }

  async updateComment(id: number, text: string, teacherId: number): Promise<CommentResponseDto> {
    const comment = await Comment.findOne({
      where: { 
        id,
        teacherId
      }
    });

    if (!comment) {
      throw new AppError(404, 'Comment not found or access denied');
    }

    await comment.update({ text });
    return this.getCommentById(id);
  }

  async deleteComment(id: number, teacherId: number): Promise<void> {
    const comment = await Comment.findOne({
      where: { 
        id,
        teacherId
      }
    });

    if (!comment) {
      throw new AppError(404, 'Comment not found or access denied');
    }

    await comment.destroy();
  }

  async getCommentsByEvaluation(evaluationId: number): Promise<CommentResponseDto[]> {
    const comments = await Comment.findAll({
      where: { evaluationId },
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['createdAt', 'DESC']]
    });

    return comments.map(comment => this.toDTO(comment));
  }

  private async getCommentById(id: number): Promise<CommentResponseDto> {
    const comment = await Comment.findByPk(id, {
      include: [{
        model: User,
        as: 'teacher',
        attributes: ['id', 'name', 'email', 'role']
      }]
    });

    if (!comment) {
      throw new AppError(404, 'Comment not found');
    }

    return this.toDTO(comment);
  }

  private toDTO(comment: Comment): CommentResponseDto {
    return {
      id: comment.id,
      evaluationId: comment.evaluationId,
      teacherId: comment.teacherId,
      text: comment.text,
      teacher: comment.teacher ? {
        id: comment.teacher.id,
        name: comment.teacher.name,
        email: comment.teacher.email,
        role: comment.teacher.role,
        status: comment.teacher.status,
        description: comment.teacher.description,
        createdAt: comment.teacher.createdAt,
        updatedAt: comment.teacher.updatedAt
      } : undefined,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt
    };
  }
}

export const commentService = new CommentService();