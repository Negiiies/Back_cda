// src/types/index.ts

export interface BaseModel {
  id?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// User types
export interface ICreateUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  description?: string;
  status?: UserStatus;
}

export interface UserResponseDto {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Scale types
export interface ICreateScale {
  title: string; // Changed from name
  description?: string;
  creatorId: number; // Added
  criteria?: ICreateCriteria[];
}

export interface ScaleResponseDto {
  id: number;
  title: string; // Changed from name
  description?: string;
  creatorId: number; // Added
  creator?: UserResponseDto; // Added
  criteria?: CriteriaResponseDto[];
  createdAt: Date;
  updatedAt: Date;
}

// Criteria types
export interface ICreateCriteria {
  description: string; // Changed from name
  associatedSkill: string; // Added
  maxPoints: number;
  coefficient: number;
  scaleId?: number;
}

export interface CriteriaResponseDto {
  id: number;
  description: string; // Changed from name
  associatedSkill: string; // Added
  maxPoints: number;
  coefficient: number;
  scaleId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Grade types
export interface ICreateGrade {
  evaluationId: number;
  criteriaId: number;
  value: number;
}

export interface GradeResponseDto {
  id: number;
  evaluationId: number;
  criteriaId: number;
  value: number;
  criteria?: CriteriaResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

// Comment types
export interface ICreateComment {
  evaluationId: number;
  teacherId: number;
  text: string;
}

export interface CommentResponseDto {
  id: number;
  evaluationId: number;
  teacherId: number;
  text: string;
  teacher?: UserResponseDto;
  createdAt: Date;
  updatedAt: Date;
}

// Dans src/types/index.ts, modifiez l'interface ICreateEvaluation
export interface ICreateEvaluation {
  title: string;
  dateEval: Date | string;
  studentId: number | string;
  teacherId: number | string;
  scaleId: number | string;
  status?: EvaluationStatus;
}

// Update EvaluationResponseDto to properly type the nested objects
export interface EvaluationResponseDto {
  id: number;
  title: string;
  dateEval: Date;
  studentId: number;
  teacherId: number;
  scaleId: number;
  status: EvaluationStatus;
  student?: UserResponseDto;
  teacher?: UserResponseDto;
  scale?: ScaleResponseDto;
  grades?: Array<GradeResponseDto & {
    criteria?: CriteriaResponseDto;
  }>;
  comments?: Array<CommentResponseDto & {
    teacher?: UserResponseDto;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
// Enums
export type UserRole = 'student' | 'teacher' | 'admin';
export type UserStatus = 'active' | 'inactive';
export type EvaluationStatus = 'draft' | 'published' | 'archived';

// Model Interfaces
export interface IUser extends BaseModel {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  description?: string;
  status: UserStatus;
}

export interface IScale extends BaseModel {
  title: string; // Changed from name
  description?: string;
  creatorId: number; // Added
}

export interface ICriteria extends BaseModel {
  description: string; // Changed from name
  associatedSkill: string; // Added
  scaleId: number;
  maxPoints: number;
  coefficient: number;
}

export interface IEvaluation extends BaseModel {
  title: string;
  dateEval: Date;
  studentId: number;
  teacherId: number;
  scaleId: number;
  status: EvaluationStatus;
  
  // Add association properties
  student?: IUser;
  teacher?: IUser;
  scale?: IScale;
  grades?: IGrade[];
  comments?: IComment[];
}

export interface IGrade extends BaseModel {
  evaluationId: number;
  criteriaId: number;
  value: number;
}

export interface IComment extends BaseModel {
  evaluationId: number;
  teacherId: number;
  text: string;
}