const redisService = require("../services/redisService");
const { redisClient } = require("../config/redis");

// Get Redis connection status and stats with enhanced information
const getRedisStatus = async (req, res) => {
  try {
    const status = await redisService.getConnectionStatus();
    const stats = await redisService.getStats();

    // Get additional Redis information
    const info = await redisClient.info();
    const time = await redisClient.time();
    const dbsize = await redisClient.dbsize();

    res.json({
      success: true,
      data: {
        status,
        stats: stats.info || "No stats available",
        info,
        time,
        dbsize,
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Redis status check error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Redis status: " + error.message,
      data: null,
    });
  }
};

// Test Redis functionality with enhanced security logging
const testRedis = async (req, res) => {
  try {
    // Test token blacklisting
    const testToken = "test_token_" + Date.now();

    // Blacklist token
    const blacklistResult = await redisService.blacklistToken(testToken, 60); // 1 minute TTL

    // Check if blacklisted
    const isBlacklisted = await redisService.isTokenBlacklisted(testToken);

    // Test rate limiting
    const rateLimitIdentifier = "test_rate_limit_" + Date.now();
    const rateLimitResult = await redisService.checkRateLimit(
      rateLimitIdentifier,
      5, // 5 requests
      60000 // 1 minute
    );

    // Get rate limit info
    const rateLimitInfo = await redisService.getRateLimitInfo(
      rateLimitIdentifier,
      5,
      60000
    );

    // Test unblacklisting
    const unblacklistResult = await redisService.unblacklistToken(testToken);
    const isStillBlacklisted = await redisService.isTokenBlacklisted(testToken);

    res.json({
      success: true,
      data: {
        tokenBlacklist: {
          token: testToken,
          blacklisted: isBlacklisted,
          result: blacklistResult,
          unblacklisted: unblacklistResult,
          stillBlacklisted: isStillBlacklisted,
        },
        rateLimit: {
          identifier: rateLimitIdentifier,
          allowed: rateLimitResult.allowed,
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          info: rateLimitInfo,
        },
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Redis test error:", error);
    res.status(500).json({
      success: false,
      error: "Redis test failed: " + error.message,
      data: null,
    });
  }
};

// Reset rate limit for an identifier
const resetRateLimit = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        error: "Identifier is required",
        data: null,
      });
    }

    const result = await redisService.resetRateLimit(identifier);

    res.json({
      success: true,
      data: {
        identifier,
        reset: result,
        message: result
          ? "Rate limit reset successfully"
          : "No rate limit found for identifier",
      },
      error: null,
    });
  } catch (error) {
    console.error("Rate limit reset error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset rate limit: " + error.message,
      data: null,
    });
  }
};

// Get Redis memory usage information
const getRedisMemoryInfo = async (req, res) => {
  try {
    const memoryInfo = await redisClient.info("memory");
    const clientsInfo = await redisClient.info("clients");
    const statsInfo = await redisClient.info("stats");

    res.json({
      success: true,
      data: {
        memory: memoryInfo,
        clients: clientsInfo,
        stats: statsInfo,
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Redis memory info error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Redis memory info: " + error.message,
      data: null,
    });
  }
};

// Get Redis key patterns (limited for security)
const getRedisKeyPatterns = async (req, res) => {
  try {
    // Only show key patterns, not actual keys for security
    const blacklistKeys = await redisClient.keys("blacklisted_token:*");
    const rateLimitKeys = await redisClient.keys("rate_limit:*");

    // Count patterns instead of showing actual keys
    res.json({
      success: true,
      data: {
        blacklistKeyCount: blacklistKeys.length,
        rateLimitKeyCount: rateLimitKeys.length,
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Redis key patterns error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get Redis key patterns: " + error.message,
      data: null,
    });
  }
};

// Flush Redis database (admin only, dangerous operation)
const flushRedisDatabase = async (req, res) => {
  try {
    // This is a dangerous operation, so we add extra confirmation
    const { confirm } = req.body;

    if (!confirm || confirm !== "YES_DELETE_ALL_DATA") {
      return res.status(400).json({
        success: false,
        error:
          "Confirmation required. Send { confirm: 'YES_DELETE_ALL_DATA' } to proceed.",
        data: null,
      });
    }

    // Log this dangerous operation
    console.warn(
      `⚠️ DANGEROUS OPERATION: Redis database flush initiated by user ${req.user.id}`
    );

    const result = await redisClient.flushdb();

    res.json({
      success: true,
      data: {
        flushed: result === "OK",
        message: "Redis database flushed successfully",
        timestamp: new Date().toISOString(),
      },
      error: null,
    });
  } catch (error) {
    console.error("Redis flush error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to flush Redis database: " + error.message,
      data: null,
    });
  }
};

module.exports = {
  getRedisStatus,
  testRedis,
  resetRateLimit,
  getRedisMemoryInfo,
  getRedisKeyPatterns,
  flushRedisDatabase,
};
