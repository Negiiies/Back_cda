import dotenv from 'dotenv';
import { AppError } from '../utils/error.handler';

// Load environment variables
dotenv.config();

// Define config first
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  
  database: {
    type: process.env.DB_TYPE || 'sqlite', // 'sqlite' or 'mysql'
    storage: process.env.DB_STORAGE,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'school_app'
  },
 
  argon2: {
    memoryCost: parseInt(process.env.ARGON2_MEMORY_COST || '65536', 10),
    timeCost: parseInt(process.env.ARGON2_TIME_COST || '3', 10),
    parallelism: parseInt(process.env.ARGON2_PARALLELISM || '1', 10)
  },
 
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://*.pfb.ecole-89.com'
      : '*'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key-for-development',
    accessTokenExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshTokenExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d'
  }
};

// Required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'DB_STORAGE',
  'ARGON2_MEMORY_COST',
  'ARGON2_TIME_COST',
  'JWT_SECRET'
].filter(envVar => 
  config.env === 'production' || envVar !== 'JWT_SECRET'
);

// If using MySQL in production, ensure DB credentials are provided
if (config.env === 'production' && config.database.type === 'mysql') {
  const requiredMySQLVars = ['DB_HOST', 'DB_USERNAME', 'DB_PASSWORD', 'DB_NAME'];
  requiredMySQLVars.forEach(envVar => {
    if (!process.env[envVar]) {
      throw new AppError(500, `Missing required MySQL environment variable: ${envVar}`);
    }
  });
}

// Check for required environment variables
requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new AppError(500, `Missing required environment variable: ${envVar}`);
  }
});

// Environment type guard
export const isDevelopment = () => config.env === 'development';
export const isProduction = () => config.env === 'production';