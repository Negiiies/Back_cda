import logger from './logger';

// src/utils/token.blacklist.ts
class TokenBlacklist {
  private blacklistedTokens: Set<string>;
  private userTokens: Map<number, Set<string>>;  // Track tokens by userId

  constructor() {
    this.blacklistedTokens = new Set<string>();
    this.userTokens = new Map();
  }

  addToken(token: string, userId?: number): void {
    this.blacklistedTokens.add(token);
    
    // If userId is provided, track this token for the user
    if (userId) {
      if (!this.userTokens.has(userId)) {
        this.userTokens.set(userId, new Set());
      }
      this.userTokens.get(userId)?.add(token);
    }
    
    logger.info(`Token blacklisted successfully`);
  }

  revokeAllUserTokens(userId: number): void {
    // Get all tokens for this user
    const userTokens = this.userTokens.get(userId);
    if (userTokens) {
      // Add all user's tokens to the blacklist
      userTokens.forEach(token => {
        this.blacklistedTokens.add(token);
      });
      // Clear the user's tokens
      this.userTokens.delete(userId);
      logger.info(`All tokens revoked for user ${userId}. Total tokens blacklisted: ${this.blacklistedTokens.size}`);
    }
  }

  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  // For debugging/monitoring
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }
}

export const tokenBlacklist = new TokenBlacklist();