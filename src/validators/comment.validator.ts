// src/validators/comment.validator.ts - ✅ VERSION FINALE À APPLIQUER
import { z } from 'zod';

// ✅ Create comment schema - SANS evaluationId (vient de l'URL)
export const createCommentSchema = z.object({
  text: z.string()
    .min(1, 'Comment text cannot be empty')
    .max(1000, 'Comment text cannot exceed 1000 characters')
    .trim()
  // ❌ PAS d'evaluationId ici (vient de l'URL)
});

// Update comment schema
export const updateCommentSchema = z.object({
  text: z.string()
    .min(1, 'Comment text cannot be empty')
    .max(1000, 'Comment text cannot exceed 1000 characters')
    .trim()
});

// Comment ID parameter schema
export const commentIdSchema = z.object({
  id: z.string().or(z.number()).pipe(z.coerce.number().positive())
});

// ✅ Evaluation ID parameter schema (pour valider l'URL)
export const evaluationIdSchema = z.object({
  evaluationId: z.string().or(z.number()).pipe(z.coerce.number().positive())
});

// ✅ Schemas complets pour validation avec params
export const createCommentValidation = z.object({
  params: evaluationIdSchema,
  body: createCommentSchema
});

export const getCommentsValidation = z.object({
  params: evaluationIdSchema
});

export const updateCommentValidation = z.object({
  params: commentIdSchema,
  body: updateCommentSchema
});

export const deleteCommentValidation = z.object({
  params: commentIdSchema
});