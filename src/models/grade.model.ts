import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import { IGrade } from '../types';
import sequelize from '../config/database';
import Evaluation from './evaluation.model';
import Criteria from './criteria.model';

class Grade extends Model<IGrade> implements IGrade {
  declare id: number;
  declare evaluationId: number;
  declare criteriaId: number;
  declare value: number;
  
  // Associations
  declare criteria?: Criteria;
  declare evaluation?: Evaluation;
  declare getCriteria: BelongsToGetAssociationMixin<Criteria>;
  declare getEvaluation: BelongsToGetAssociationMixin<Evaluation>;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Grade.init(
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
    criteriaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Criteria,
        key: 'id',
      },
    },
    value: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        async notExceedMaxPoints(this: Grade, value: number) {
          const criteria = await Criteria.findByPk(this.criteriaId);
          if (criteria && value > criteria.maxPoints) {
            throw new Error(`Grade cannot exceed maximum points (${criteria.maxPoints})`);
          }
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'grades',
    modelName: 'Grade',
    timestamps: true,
    underscored: true,
  }
);

export default Grade;