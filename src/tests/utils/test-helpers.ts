// src/tests/utils/test-helpers.ts
import { User, Scale, Criteria, Evaluation } from '../../models';
import { authService } from '../../services/auth.service';
import { jwtService } from '../../services/jwt.service';
import { UserRole } from '../../types';

export interface TestUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface TestScale {
  id: number;
  title: string;
  criteria: TestCriteria[];
}

export interface TestCriteria {
  id: number;
  description: string;
  associatedSkill: string;
  maxPoints: number;
  coefficient: number;
  scaleId: number;
}

/**
 * Create a test user with specified role
 */
export async function createTestUser(
  role: UserRole,
  emailSuffix: string = Math.random().toString(36).substring(7)
): Promise<TestUser> {
  const hashedPassword = await authService.hashPassword('Test123!');
  
  const user = await User.create({
    name: `Test ${role} ${emailSuffix}`,
    email: `${role.toLowerCase()}.${emailSuffix}@test.com`,
    password: hashedPassword,
    role,
    status: 'active'
  });

  const token = jwtService.generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    token
  };
}

/**
 * Create a test scale with criteria
 */
export async function createTestScale(
  creatorId: number,
  criteriaCount: number = 3
): Promise<TestScale> {
  const scale = await Scale.create({
    title: `Test Scale ${Math.random().toString(36).substring(7)}`,
    description: 'A test scale for automated testing',
    creatorId
  });

  const criteriaData = [];
  const remainingCoefficient = 1.0;
  const coefficientPerCriteria = remainingCoefficient / criteriaCount;

  for (let i = 0; i < criteriaCount; i++) {
    criteriaData.push({
      description: `Test Criterion ${i + 1}`,
      associatedSkill: `Test Skill ${i + 1}`,
      maxPoints: 20 + (i * 10), // 20, 30, 40, etc.
      coefficient: coefficientPerCriteria,
      scaleId: scale.id
    });
  }

  const criteria = await Criteria.bulkCreate(criteriaData);

  return {
    id: scale.id,
    title: scale.title,
    criteria: criteria.map(c => ({
      id: c.id,
      description: c.description,
      associatedSkill: c.associatedSkill,
      maxPoints: c.maxPoints,
      coefficient: c.coefficient,
      scaleId: c.scaleId
    }))
  };
}

/**
 * Create a test evaluation
 */
export async function createTestEvaluation(
  teacherId: number,
  studentId: number,
  scaleId: number,
  status: 'draft' | 'published' | 'archived' = 'draft'
): Promise<any> {
  return await Evaluation.create({
    title: `Test Evaluation ${Math.random().toString(36).substring(7)}`,
    dateEval: new Date(),
    studentId,
    teacherId,
    scaleId,
    status
  });
}

/**
 * Clean up test data by email patterns
 */
export async function cleanupTestUsers(emailPatterns: string[]): Promise<void> {
  for (const pattern of emailPatterns) {
    await User.destroy({
      where: {
        email: {
          [require('sequelize').Op.like]: `%${pattern}%`
        }
      }
    });
  }
}

/**
 * Clean up test scales by title patterns
 */
export async function cleanupTestScales(titlePatterns: string[]): Promise<void> {
  for (const pattern of titlePatterns) {
    const scales = await Scale.findAll({
      where: {
        title: {
          [require('sequelize').Op.like]: `%${pattern}%`
        }
      }
    });

    for (const scale of scales) {
      // Clean up associated criteria first
      await Criteria.destroy({ where: { scaleId: scale.id } });
      await Scale.destroy({ where: { id: scale.id } });
    }
  }
}

/**
 * Wait for a specified time (useful for async operations)
 */
export async function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
export function generateRandomString(length: number = 10): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Validate response structure for API tests
 */
export function validateUserResponse(user: any): void {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('email');
  expect(user).toHaveProperty('role');
  expect(user).toHaveProperty('status');
  expect(user).not.toHaveProperty('password');
}

/**
 * Validate evaluation response structure
 */
export function validateEvaluationResponse(evaluation: any): void {
  expect(evaluation).toHaveProperty('id');
  expect(evaluation).toHaveProperty('title');
  expect(evaluation).toHaveProperty('dateEval');
  expect(evaluation).toHaveProperty('studentId');
  expect(evaluation).toHaveProperty('teacherId');
  expect(evaluation).toHaveProperty('scaleId');
  expect(evaluation).toHaveProperty('status');
}

/**
 * Create a complete test environment with users, scales, and evaluations
 */
export async function createTestEnvironment() {
  const admin = await createTestUser('admin', 'env');
  const teacher = await createTestUser('teacher', 'env');
  const student = await createTestUser('student', 'env');
  
  const scale = await createTestScale(teacher.id, 2);
  
  const evaluation = await createTestEvaluation(
    teacher.id,
    student.id,
    scale.id,
    'draft'
  );

  return {
    users: { admin, teacher, student },
    scale,
    evaluation
  };
}

/**
 * Clean up a complete test environment
 */
export async function cleanupTestEnvironment(): Promise<void> {
  await cleanupTestUsers(['env@test.com']);
  await cleanupTestScales(['Test Scale']);
}

export default {
  createTestUser,
  createTestScale,
  createTestEvaluation,
  cleanupTestUsers,
  cleanupTestScales,
  wait,
  generateRandomString,
  validateUserResponse,
  validateEvaluationResponse,
  createTestEnvironment,
  cleanupTestEnvironment
};