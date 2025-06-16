// src/models/user.model.ts

import { Model, DataTypes } from 'sequelize';
import { ICreateUser, IUser, UserRole, UserStatus } from '../types';
import sequelize from '../config/database';
import { config } from '../config/env.config';

// Extending Sequelize.Model with our IUser interface
class User extends Model<IUser, ICreateUser> implements IUser {
  // Required fields from IUser interface
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public description!: string;
  public status!: UserStatus;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Add any additional methods here
  public async deactivate() {
    this.status = 'inactive';
    await this.save();
  }
}

// Initialize the model with its attributes
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [2, 100], // Name must be between 2 and 100 characters
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true, // Ensures email format is valid
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      // Use native ENUM for MySQL, STRING with validation for SQLite
      type: config.database.type === 'mysql' 
        ? DataTypes.ENUM('student', 'teacher', 'admin')
        : DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['student', 'teacher', 'admin']]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      // Use native ENUM for MySQL, STRING with validation for SQLite
      type: config.database.type === 'mysql'
        ? DataTypes.ENUM('active', 'inactive')
        : DataTypes.STRING,
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'inactive']]
      }
    },
  },
  {
    sequelize, // Database connection instance
    tableName: 'users', // Explicit table name
    modelName: 'User', // Model name
    // Additional model options
    timestamps: true, // Adds createdAt and updatedAt
    underscored: true, // Use snake_case for column names
  }
);

export default User;