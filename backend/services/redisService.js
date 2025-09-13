const { redisClient, redisRateLimiter } = require("../config/redis");
const config = require("../config/env");
const crypto = require("crypto");

class RedisService {
  constructor() {
    this.tokenBlacklistPrefix = "blacklisted_token:";
    this.rateLimitPrefix = "rate_limit:";
    this.tokenBlacklistTTL = 86400; // 24 hours in seconds
    this.maxTokenLength = 4096; // Maximum token length for security
  }

  /**
   * Generate a secure hash for tokens to prevent key enumeration attacks
   * @param {string} token - JWT token to hash
   * @returns {string} - SHA256 hash of the token
   */
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Blacklist a JWT token with enhanced security
   * @param {string} token - JWT token to blacklist
   * @param {number} ttl - Time to live in seconds (default: 24 hours)
   * @returns {Promise<boolean>} - Success status
   */
  async blacklistToken(token, ttl = this.tokenBlacklistTTL) {
    try {
      // Security validation
      if (
        !token ||
        typeof token !== "string" ||
        token.length > this.maxTokenLength
      ) {
        console.warn("❌ Attempt to blacklist invalid token");
        return false;
      }

      // Use hashed token for security
      const hashedToken = this.hashToken(token);
      const key = `${this.tokenBlacklistPrefix}${hashedToken}`;

      // Store with expiration time
      await redisClient.setex(key, ttl, "1");
      console.log(`✅ Token blacklisted successfully`);
      return true;
    } catch (error) {
      console.error("❌ Error blacklisting token:", error);
      // Log security event
      console.warn(`⚠️ Security event: Token blacklisting failed for token`);
      return false;
    }
  }

  /**
   * Check if a token is blacklisted with enhanced security
   * @param {string} token - JWT token to check
   * @returns {Promise<boolean>} - True if blacklisted
   */
  async isTokenBlacklisted(token) {
    try {
      // Security validation
      if (
        !token ||
        typeof token !== "string" ||
        token.length > this.maxTokenLength
      ) {
        return false;
      }

      // Use hashed token for security
      const hashedToken = this.hashToken(token);
      const key = `${this.tokenBlacklistPrefix}${hashedToken}`;
      const result = await redisClient.get(key);
      return result === "1";
    } catch (error) {
      console.error("❌ Error checking token blacklist:", error);
      // In case of Redis failure, we default to not blacklisted for security
      // This prevents denial of service but could theoretically allow revoked tokens
      // In a production environment, you might want to fail securely instead
      return false;
    }
  }

  /**
   * Remove a token from blacklist (for admin purposes)
   * @param {string} token - JWT token to unblacklist
   * @returns {Promise<boolean>} - Success status
   */
  async unblacklistToken(token) {
    try {
      // Security validation
      if (
        !token ||
        typeof token !== "string" ||
        token.length > this.maxTokenLength
      ) {
        return false;
      }

      // Use hashed token for security
      const hashedToken = this.hashToken(token);
      const key = `${this.tokenBlacklistPrefix}${hashedToken}`;
      const result = await redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error("❌ Error unblacklisting token:", error);
      return false;
    }
  }

  /**
   * Enhanced rate limiting using Redis sliding window with improved security
   * @param {string} identifier - Unique identifier (IP, user ID, etc.)
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Promise<{ allowed: boolean, remaining: number, resetTime: number }>} - Rate limit info
   */
  async checkRateLimit(identifier, maxRequests, windowMs) {
    try {
      // Security validation
      if (
        !identifier ||
        typeof identifier !== "string" ||
        identifier.length > 256
      ) {
        console.warn("❌ Invalid rate limit identifier");
        // Allow request to prevent DoS but log the event
        return {
          allowed: true,
          remaining: maxRequests,
          resetTime: Date.now() + windowMs,
        };
      }

      // Hash identifier for additional security
      const hashedIdentifier = this.hashToken(identifier);
      const key = `${this.rateLimitPrefix}${hashedIdentifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove old entries outside the window
      await redisRateLimiter.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      const currentCount = await redisRateLimiter.zcard(key);

      // Check if limit exceeded
      if (currentCount >= maxRequests) {
        const resetTime = await this.getRateLimitResetTime(key, windowMs);
        console.log(
          `⚠️ Rate limit exceeded for identifier: ${identifier.substring(
            0,
            30
          )}...`
        );
        return {
          allowed: false,
          remaining: 0,
          resetTime,
        };
      }

      // Add current request with timestamp
      await redisRateLimiter.zadd(key, now, `${now}-${Math.random()}`);
      // Set expiration to clean up old keys (add buffer time)
      await redisRateLimiter.expire(key, Math.ceil((windowMs * 2) / 1000));

      return {
        allowed: true,
        remaining: maxRequests - currentCount - 1,
        resetTime: now + windowMs,
      };
    } catch (error) {
      console.error("❌ Error checking rate limit:", error);
      // In case of Redis failure, we allow the request to avoid blocking legitimate users
      // This is a security trade-off to prevent DoS but could allow rate limit bypass
      return {
        allowed: true,
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
      };
    }
  }

  /**
   * Get the time when rate limit will reset
   * @param {string} key - Redis key
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Promise<number>} - Reset timestamp
   */
  async getRateLimitResetTime(key, windowMs) {
    try {
      const earliest = await redisRateLimiter.zrange(key, 0, 0, "WITHSCORES");
      if (earliest.length > 0) {
        const earliestTimestamp = parseInt(earliest[1]);
        return earliestTimestamp + windowMs;
      }
      return Date.now() + windowMs;
    } catch (error) {
      console.error("❌ Error getting rate limit reset time:", error);
      return Date.now() + windowMs;
    }
  }

  /**
   * Get rate limit info without incrementing
   * @param {string} identifier - Unique identifier
   * @param {number} maxRequests - Maximum requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Promise<{ remaining: number, resetTime: number }>} - Rate limit info
   */
  async getRateLimitInfo(identifier, maxRequests, windowMs) {
    try {
      // Security validation
      if (
        !identifier ||
        typeof identifier !== "string" ||
        identifier.length > 256
      ) {
        return {
          remaining: maxRequests,
          resetTime: Date.now() + windowMs,
        };
      }

      // Hash identifier for additional security
      const hashedIdentifier = this.hashToken(identifier);
      const key = `${this.rateLimitPrefix}${hashedIdentifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;

      // Remove old entries outside the window
      await redisRateLimiter.zremrangebyscore(key, 0, windowStart);

      // Count current requests
      const currentCount = await redisRateLimiter.zcard(key);

      const resetTime = await this.getRateLimitResetTime(key, windowMs);

      return {
        remaining: Math.max(0, maxRequests - currentCount),
        resetTime,
      };
    } catch (error) {
      console.error("❌ Error getting rate limit info:", error);
      return {
        remaining: maxRequests,
        resetTime: Date.now() + windowMs,
      };
    }
  }

  /**
   * Reset rate limit for an identifier
   * @param {string} identifier - Unique identifier
   * @returns {Promise<boolean>} - Success status
   */
  async resetRateLimit(identifier) {
    try {
      // Security validation
      if (
        !identifier ||
        typeof identifier !== "string" ||
        identifier.length > 256
      ) {
        return false;
      }

      // Hash identifier for additional security
      const hashedIdentifier = this.hashToken(identifier);
      const key = `${this.rateLimitPrefix}${hashedIdentifier}`;
      const result = await redisRateLimiter.del(key);
      return result > 0;
    } catch (error) {
      console.error("❌ Error resetting rate limit:", error);
      return false;
    }
  }

  /**
   * Get Redis connection status with enhanced error handling
   * @returns {Promise<string>} - Connection status
   */
  async getConnectionStatus() {
    try {
      const result = await redisClient.ping();
      return result === "PONG" ? "connected" : "disconnected";
    } catch (error) {
      console.error("❌ Redis connection status check failed:", error.message);
      return "disconnected";
    }
  }

  /**
   * Get Redis statistics with enhanced error handling
   * @returns {Promise<object>} - Redis stats
   */
  async getStats() {
    try {
      const info = await redisClient.info();
      return {
        status: await this.getConnectionStatus(),
        info,
      };
    } catch (error) {
      console.error("❌ Error getting Redis stats:", error.message);
      return {
        status: "error",
        error: error.message,
      };
    }
  }

  /**
   * Clean up expired keys to optimize Redis memory usage
   * @returns {Promise<number>} - Number of cleaned keys
   */
  async cleanupExpiredKeys() {
    try {
      // This is a no-op in most cases as Redis handles expiration automatically
      // But we can add specific cleanup logic if needed
      console.log("🧹 Redis cleanup completed");
      return 0;
    } catch (error) {
      console.error("❌ Error during Redis cleanup:", error);
      return 0;
    }
  }
}

// Export singleton instance
const redisService = new RedisService();
module.exports = redisService;
