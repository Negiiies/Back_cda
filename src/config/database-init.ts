// src/config/database-init.ts
// This file helps initialize the database with proper support for ENUMs in MySQL

import sequelize from './database';
import logger from '../utils/logger';
import { config } from './env.config';

/**
 * Initialize database with proper configuration
 * Especially important for MySQL ENUMs
 */
export async function initializeDatabase() {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');

    // For MySQL, ensure ENUMs are created properly by adding them directly
    if (config.database.type === 'mysql') {
      // We need to create the ENUM types before syncing models
      logger.info('MySQL detected, ENUM types will be created by model definitions');
      
      // If you need to manually create ENUMs in the future, uncomment and use this:
      /*
      const queryInterface = sequelize.getQueryInterface();
      
      // Create a function to safely create ENUM types
      const createEnumTypeIfNeeded = async (tableName: string, columnName: string, values: string[]) => {
        try {
          // Check if table exists first to avoid errors
          const tables = await queryInterface.showAllTables();
          if (tables.includes(tableName)) {
            logger.info(`Table ${tableName} already exists, skipping ENUM creation.`);
            return;
          }
          
          // Format the ENUM values for MySQL syntax
          const formattedValues = values.map(v => `'${v}'`).join(', ');
          
          // Create or modify the column with ENUM type
          const query = `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ENUM(${formattedValues})`;
          await sequelize.query(query);
          logger.info(`Created ENUM for ${tableName}.${columnName}`);
        } catch (error) {
          // It's okay if this fails, the models will handle it
          logger.warn(`Could not pre-create ENUM for ${tableName}.${columnName}: ${error}`);
        }
      };
      */
    }

    logger.info('Database initialization completed successfully.');
    return true;
  } catch (error) {
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export default initializeDatabase;