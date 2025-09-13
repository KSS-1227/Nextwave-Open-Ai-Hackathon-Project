const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
} = require("../controllers/documentController");

const router = express.Router();

// All document routes require authentication
router.use(authenticateToken);

// GET /api/documents - Get all documents for user
router.get("/", getDocuments);

// GET /api/documents/stats - Get document statistics
router.get("/stats", getDocumentStats);

// GET /api/documents/:id - Get specific document
router.get("/:id", getDocument);

// POST /api/documents - Create new document record
router.post("/", createDocument);

// PUT /api/documents/:id - Update document
router.put("/:id", updateDocument);

// PATCH /api/documents/:id - Partially update document
router.patch("/:id", updateDocument);

// DELETE /api/documents/:id - Delete document
router.delete("/:id", deleteDocument);

module.exports = router;
