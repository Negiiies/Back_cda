import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per windowMs
  message: { 
    status: 'error',
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ← REMOVE trustProxy, only keep these:
  keyGenerator: (req) => {
    // Use X-Forwarded-For header when behind proxy, fallback to req.ip
    return req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
  },
  // Skip rate limiting for internal Docker network
  skip: (req) => {
    const ip = req.headers['x-forwarded-for'] as string || req.ip;
    return ip?.startsWith('172.') || ip?.startsWith('192.168.') || false;
  }
});

export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per minute
  message: { 
    status: 'error',
    message: 'Too many requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // ← REMOVE trustProxy, only keep these:
  keyGenerator: (req) => {
    // Use X-Forwarded-For header when behind proxy, fallback to req.ip
    return req.headers['x-forwarded-for'] as string || req.ip || 'unknown';
  },
  // Skip rate limiting for internal Docker network
  skip: (req) => {
    const ip = req.headers['x-forwarded-for'] as string || req.ip;
    return ip?.startsWith('172.') || ip?.startsWith('192.168.') || false;
  }
});