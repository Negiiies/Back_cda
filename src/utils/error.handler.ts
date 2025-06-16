import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Handle CSRF errors (they come with status code 403)
  if (error.message === 'invalid csrf token') {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF validation failed'
    });
  }

  // Handle our custom AppError
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  // Handle all other errors
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};