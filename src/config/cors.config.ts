import { CorsOptions } from 'cors';

const corsConfig: CorsOptions = {
  // Origin configuration based on environment
  // Using explicit origin instead of wildcard when credentials are used
  origin: process.env.NODE_ENV === 'production'
    ? 'https://*.pfb.ecole-89.com'
    : ['http://localhost:3001', 'http://localhost'], 
  
  // Methods allowed
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  // Allow credentials (cookies, authorization headers)
  credentials: true,
  
  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'X-CSRF-Token' // Add this header
  ],
  
  // Expose these headers to the client
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  
  // Pre-flight request cache duration
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};
export default corsConfig;