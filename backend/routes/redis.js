const express = require("express");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  getRedisStatus,
  testRedis,
  resetRateLimit,
  getRedisMemoryInfo,
  getRedisKeyPatterns,
  flushRedisDatabase,
} = require("../controllers/redisController");

const router = express.Router();

// All Redis routes require authentication
router.use(authenticateToken);

// GET /api/redis/status - Get Redis connection status and stats
router.get("/status", getRedisStatus);

// GET /api/redis/test - Test Redis functionality
router.get("/test", requireAdmin, testRedis);

// GET /api/redis/memory - Get Redis memory usage information
router.get("/memory", requireAdmin, getRedisMemoryInfo);

// GET /api/redis/keys - Get Redis key patterns (limited for security)
router.get("/keys", requireAdmin, getRedisKeyPatterns);

// POST /api/redis/reset-rate-limit - Reset rate limit for an identifier (admin only)
router.post("/reset-rate-limit", requireAdmin, resetRateLimit);

// POST /api/redis/flush - Flush Redis database (admin only, dangerous operation)
router.post("/flush", requireAdmin, flushRedisDatabase);

module.exports = router;
