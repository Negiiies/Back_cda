import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
const dbType = process.env.DB_TYPE || 'sqlite'; // 'sqlite' or 'mysql'

// Initialize sequelize with a default value
let sequelize: Sequelize;

if (dbType === 'sqlite') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest 
      ? ':memory:' // Use in-memory database for testing
      : process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  });
} else if (dbType === 'mysql') {
  sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_app',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    // Connection pool settings
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Default to SQLite if DB_TYPE is unrecognized
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: isTest 
      ? ':memory:' 
      : process.env.DB_STORAGE || path.join(__dirname, '../../database.sqlite'),
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    }
  });
}

export default sequelize;