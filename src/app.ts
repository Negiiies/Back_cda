import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './config/database-init'; // Remove sequelize import
import { config } from './config/env.config';
import corsConfig from './config/cors.config';
import { loginLimiter, generalLimiter } from './middleware/rate-limit';
import { errorHandler } from './utils/error.handler';
import logger from './utils/logger';
import { doubleCsrfProtection, generateToken } from './config/csrf.config';
import cookieParser from 'cookie-parser';

// Import all routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import scaleRoutes from './routes/scale.routes';
import evaluationRoutes from './routes/evaluation.routes';
import routes from './routes';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors(corsConfig));

// Add CSRF protection
app.use(doubleCsrfProtection);

// Route to get CSRF token
app.get('/api/csrf-token', (req, res) => {
  const token = generateToken(req, res);
  res.json({ token });
});

// Rate limiting
app.use('/api/auth/login', loginLimiter);
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ 
    status: 'OK', 
    environment: config.env,
    database: config.database.type 
  });
});

// API Routes
app.use('/api', routes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scales', scaleRoutes);
app.use('/api/evaluations', evaluationRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port;

const startServer = async () => {
  try {
    // Initialize database
    await initializeDatabase();
    
    // Start server
    app.listen(PORT, () => {
      logger.info(`Server running in ${config.env} mode on port ${PORT}`);
      logger.info(`Database type: ${config.database.type}`);
      logger.info(`CORS Origin: ${config.env === 'production' ? 'https://*.pfb.ecole-89.com' : '*'}`);
    });
  } catch (error) {
    logger.error('Unable to start server:', error);
    process.exit(1);
  }
};

// Only start server if running directly (not when imported for testing)
if (require.main === module) {
  startServer();
}

export default app;