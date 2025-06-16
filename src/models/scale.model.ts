import { Model, DataTypes, HasManyGetAssociationsMixin, BelongsToGetAssociationMixin } from 'sequelize';
import { IScale } from '../types';
import sequelize from '../config/database';
import { Criteria, User } from './index';

class Scale extends Model<IScale> implements IScale {
  declare id: number;
  declare title: string;
  declare description?: string;
  declare creatorId: number;
  
  // Associations
  declare creator?: User;
  declare criteria?: Criteria[];
  declare getCriteria: HasManyGetAssociationsMixin<Criteria>;
  declare getCreator: BelongsToGetAssociationMixin<User>;
  
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Scale.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'scales',
    modelName: 'Scale',
    timestamps: true,
    underscored: true,
  }
);

export default Scale;