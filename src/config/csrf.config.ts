import { doubleCsrf } from 'csrf-csrf';
import { config } from './env.config';

export const {
  generateToken,
  validateRequest,
  doubleCsrfProtection
} = doubleCsrf({
  getSecret: () => config.jwt.secret,
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax', // Utilisez 'lax' en développement
    secure: config.env === 'production', // false en développement
    path: '/'
  },
  size: 64,
  getTokenFromRequest: (req) => req.headers['x-csrf-token'] as string,
});