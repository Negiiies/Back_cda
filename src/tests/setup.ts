// src/tests/setup.ts
import sequelize from '../config/database';
import logger from '../utils/logger';

// Global test setup
beforeAll(async () => {
  // Set test environment
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
  
  // Suppress console logs during tests unless explicitly needed
  if (process.env.TEST_VERBOSE !== 'true') {
    jest.spyOn(logger, 'info').mockImplementation(() => {});
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'error').mockImplementation(() => {});
  }
  
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Test database connection established');
  } catch (error) {
    console.error('Failed to connect to test database:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    // Close all database connections
    await sequelize.close();
    console.log('Test database connections closed');
  } catch (error) {
    console.warn('Error closing test database connections:', error);
  }
  
  // Clean up any remaining timers or handles
  jest.clearAllTimers();
  jest.clearAllMocks();
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export {};