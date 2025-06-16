// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request against schema
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    return next();
  } catch (error) {
    // If validation error occurs
    if (error instanceof ZodError) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    
    // For other types of errors
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error during validation'
    });
  }
};