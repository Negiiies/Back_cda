import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
   setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testTimeout: 15000, // Increase global timeout
  detectOpenHandles: true, // Help identify leaked resources
};

export default config;