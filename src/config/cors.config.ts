import { CorsOptions } from 'cors';

const corsConfig: CorsOptions = {
  // Origin configuration based on environment
  // Using explicit origin instead of wildcard when credentials are used
  origin: process.env.NODE_ENV === 'production'
    ? ['http://138.197.185.211', 'https://138.197.185.211', 'https://89progress.com']
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
    'X-CSRF-Token'
  ],
  
  // Expose these headers to the client
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  
  // Pre-flight request cache duration
  optionsSuccessStatus: 204,
  preflightContinue: false,
  maxAge: 86400 // 24 hours
};
export default corsConfig;