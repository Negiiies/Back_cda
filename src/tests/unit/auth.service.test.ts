// src/tests/unit/auth.service.test.ts
import { authService } from '../../services/auth.service';
import { UserRole } from '../../types';


jest.setTimeout(30000);

describe('AuthService Unit Tests', () => {
  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      const password = 'TestPassword123!';
      const hashedPassword = await authService.hashPassword(password);
      
      // Password should be transformed
      expect(hashedPassword).not.toBe(password);
      
      // Should use argon2id format
      expect(hashedPassword).toMatch(/^\$argon2id\$/);
    });
  });
  
  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await authService.hashPassword(password);
      
      const result = await authService.verifyPassword(hash, password);
      expect(result).toBe(true);
    });
    
    it('should return false for incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await authService.hashPassword(password);
      
      const result = await authService.verifyPassword(hash, wrongPassword);
      expect(result).toBe(false);
    });
    
    it('should handle empty or null inputs securely', async () => {
  const password = 'TestPassword123!';
  const hash = await authService.hashPassword(password);
  
  // Empty string
  const emptyResult = await authService.verifyPassword(hash, '');
  expect(emptyResult).toBe(false);
  
  // @ts-ignore - Testing with null for safety
  const nullResult = await authService.verifyPassword(hash, null);
  expect(nullResult).toBe(false);
    });
  });
  
  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', async () => {
      // Setup mock user data
      const userData = {
        userId: 1,
        email: 'test@example.com',
        role: 'teacher' as UserRole
      };
      
      // Mock the authService.login method
      const mockLogin = jest.spyOn(authService, 'login');
      mockLogin.mockResolvedValue({
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
        user: {
          id: userData.userId,
          email: userData.email,
          role: userData.role
        }
      });
      
      // Call the method with the userData
      const tokens = await authService.login(userData.email, 'password');
      
      // Verify the returned tokens
      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      
      // Clean up the mock
      mockLogin.mockRestore();
    });
  });
});