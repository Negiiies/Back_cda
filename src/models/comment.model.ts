import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import { IComment } from '../types';
import sequelize from '../config/database';
import User from './user.model';
import Evaluation from './evaluation.model';

class Comment extends Model<IComment> implements IComment {
  declare id: number;
  declare evaluationId: number;
  declare teacherId: number;
  declare text: string;
  
  // Associations
  declare teacher?: User;
  declare getTeacher: BelongsToGetAssociationMixin<User>;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Comment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    evaluationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Evaluation,
        key: 'id',
      },
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
  },
  {
    sequelize,
    tableName: 'comments',
    modelName: 'Comment',
    timestamps: true,
    underscored: true,
  }
);

export default Comment;