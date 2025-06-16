import User from './user.model';
import Scale from './scale.model';
import Criteria from './criteria.model';
import Evaluation from './evaluation.model';
import Grade from './grade.model';
import Comment from './comment.model';

// Scale relationships
Scale.belongsTo(User, {
  foreignKey: 'creatorId',
  as: 'creator',
  onDelete: 'RESTRICT', // Prevent deleting users who created scales
});

Scale.hasMany(Criteria, {
  foreignKey: 'scaleId',
  as: 'criteria',
  onDelete: 'CASCADE', // Delete criteria when scale is deleted
});

Scale.hasMany(Evaluation, {
  foreignKey: 'scaleId',
  as: 'evaluations',
  onDelete: 'RESTRICT', // Prevent deleting scales used in evaluations
});

// Criteria relationships
Criteria.belongsTo(Scale, {
  foreignKey: 'scaleId',
  as: 'scale',
});

Criteria.hasMany(Grade, {
  foreignKey: 'criteriaId',
  as: 'grades',
  onDelete: 'CASCADE', // Delete grades when criteria is deleted
});

// User relationships (as teacher)
User.hasMany(Evaluation, {
  foreignKey: 'teacherId',
  as: 'givenEvaluations',
  onDelete: 'RESTRICT', // Prevent deleting teachers with evaluations
});

User.hasMany(Comment, {
  foreignKey: 'teacherId',
  as: 'comments',
  onDelete: 'CASCADE', // Delete comments when teacher is deleted
});

User.hasMany(Scale, {
  foreignKey: 'creatorId',
  as: 'createdScales',
  onDelete: 'RESTRICT', // Prevent deleting users who created scales
});

// User relationships (as student)
User.hasMany(Evaluation, {
  foreignKey: 'studentId',
  as: 'receivedEvaluations',
  onDelete: 'RESTRICT', // Prevent deleting students with evaluations
});

// Evaluation relationships
Evaluation.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

Evaluation.belongsTo(User, {
  foreignKey: 'studentId',
  as: 'student',
});

Evaluation.belongsTo(Scale, {
  foreignKey: 'scaleId',
  as: 'scale',
});

Evaluation.hasMany(Grade, {
  foreignKey: 'evaluationId',
  as: 'grades',
  onDelete: 'CASCADE', // Delete grades when evaluation is deleted
});

Evaluation.hasMany(Comment, {
  foreignKey: 'evaluationId',
  as: 'comments',
  onDelete: 'CASCADE', // Delete comments when evaluation is deleted
});

// Grade relationships
Grade.belongsTo(Evaluation, {
  foreignKey: 'evaluationId',
  as: 'evaluation',
});

Grade.belongsTo(Criteria, {
  foreignKey: 'criteriaId',
  as: 'criteria',
});

// Comment relationships
Comment.belongsTo(Evaluation, {
  foreignKey: 'evaluationId',
  as: 'evaluation',
});

Comment.belongsTo(User, {
  foreignKey: 'teacherId',
  as: 'teacher',
});

export {
  User,
  Scale,
  Criteria,
  Evaluation,
  Grade,
  Comment,
};

export default {
  User,
  Scale,
  Criteria,
  Evaluation,
  Grade,
  Comment,
};