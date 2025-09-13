const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getProfile,
  updateProfile,
  getProfileStats,
} = require("../controllers/profileController");

const router = express.Router();

// All profile routes require authentication
router.use(authenticateToken);

// GET /api/profile - Get user profile
router.get("/", getProfile);

// POST /api/profile - Create or update user profile
router.post("/", updateProfile);

// PUT /api/profile - Update user profile (same as POST for upsert)
router.put("/", updateProfile);

// GET /api/profile/stats - Get profile statistics
router.get("/stats", getProfileStats);

module.exports = router;
