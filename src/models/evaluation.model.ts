import { Model, DataTypes, BelongsToGetAssociationMixin, HasManyGetAssociationsMixin } from 'sequelize';
import { IEvaluation, EvaluationStatus } from '../types';
import sequelize from '../config/database';
import User from './user.model';
import Scale from './scale.model';
import Grade from './grade.model';
import Comment from './comment.model';
import { config } from '../config/env.config';

class Evaluation extends Model<IEvaluation> implements IEvaluation {
  declare id: number;
  declare title: string;
  declare dateEval: Date;
  declare studentId: number;
  declare teacherId: number;
  declare scaleId: number;
  declare status: EvaluationStatus;

  // Declare associations
  declare student?: User;
  declare teacher?: User;
  declare scale?: Scale;
  declare grades?: Grade[];
  declare comments?: Comment[];

  // Association mixins
  declare getStudent: BelongsToGetAssociationMixin<User>;
  declare getTeacher: BelongsToGetAssociationMixin<User>;
  declare getScale: BelongsToGetAssociationMixin<Scale>;
  declare getGrades: HasManyGetAssociationsMixin<Grade>;
  declare getComments: HasManyGetAssociationsMixin<Comment>;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Evaluation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    dateEval: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
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
    scaleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Scale,
        key: 'id',
      },
    },
    status: {
      // Use native ENUM for MySQL, STRING with validation for SQLite
      type: config.database.type === 'mysql'
        ? DataTypes.ENUM('draft', 'published', 'archived')
        : DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
      validate: {
        isIn: [['draft', 'published', 'archived']]
      }
    },
  },
  {
    sequelize,
    tableName: 'evaluations',
    modelName: 'Evaluation',
    timestamps: true,
    underscored: true,
  }
);

export default Evaluation;