const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getBusinessIdeasWithRAG,
  getTrendingSectorsWithRAG,
  getInvestmentRecommendations,
} = require("../controllers/businessIdeasControllerRAG");

const router = express.Router();

// All business ideas routes require authentication
router.use(authenticateToken);

// POST /api/business-ideas - Generate business ideas with Graph RAG enhancement
router.post("/", getBusinessIdeasWithRAG);

// GET /api/business-ideas/trending - Get trending business sectors with personalization
router.get("/trending", getTrendingSectorsWithRAG);

// GET /api/business-ideas/recommendations - Get investment-based recommendations
router.get("/recommendations", getInvestmentRecommendations);

module.exports = router;
