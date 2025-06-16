import { Model, DataTypes } from 'sequelize';
import { ICriteria } from '../types';
import sequelize from '../config/database';
import Scale from './scale.model';

class Criteria extends Model<ICriteria> implements ICriteria {
  declare id: number;
  declare scaleId: number;
  declare description: string;
  declare associatedSkill: string;
  declare maxPoints: number;
  declare coefficient: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Criteria.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    scaleId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Scale,
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    associatedSkill: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    maxPoints: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    coefficient: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
  },
  {
    sequelize,
    tableName: 'criteria',
    modelName: 'Criteria',
    timestamps: true,
    underscored: true,
  }
);

export default Criteria;