const express = require("express");
const {
  authenticateToken,
  revokeToken,
  rateLimitAPI,
} = require("../middleware/auth");
const { validateRequest } = require("../middleware/security");
const { authSchemas } = require("../middleware/validation");

const router = express.Router();

// Apply authentication rate limiting with enhanced security
router.use(rateLimitAPI(10, 15 * 60 * 1000)); // 10 requests per 15 minutes

// POST /api/auth/revoke - Revoke/blacklist a token with enhanced logging
router.post(
  "/revoke",
  authenticateToken,
  validateRequest(authSchemas.revokeToken),
  revokeToken
);

// POST /api/auth/validate - Validate current token with enhanced security info
router.post("/validate", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      valid: true,
      user_id: req.user.id,
      email: req.user.email,
      role: req.user.user_metadata?.role || "user",
      validated_at: new Date().toISOString(),
      token_info: {
        issued_at: req.user.iss,
        expires_at: req.user.exp,
        issuer: req.user.iss,
      },
      session_info: {
        authenticated_at: req.authContext?.authenticatedAt,
        ip: req.authContext?.ip,
        user_agent: req.authContext?.userAgent?.substring(0, 100),
      },
    },
    error: null,
  });
});

// GET /api/auth/session - Get current session info with enhanced details
router.get("/session", authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        email_verified: req.user.email_confirmed_at ? true : false,
        created_at: req.user.created_at,
        last_sign_in_at: req.user.last_sign_in_at,
        role: req.user.user_metadata?.role || "user",
        app_metadata: {
          provider: req.user.app_metadata?.provider,
          providers: req.user.app_metadata?.providers,
        },
      },
      session: {
        authenticated_at: req.authContext?.authenticatedAt,
        ip: req.authContext?.ip,
        user_agent: req.authContext?.userAgent?.substring(0, 100),
      },
      security: {
        token_blacklisted: false, // We know it's not blacklisted since auth succeeded
        rate_limit_remaining: res.get("X-RateLimit-Remaining"),
      },
    },
    error: null,
  });
});

module.exports = router;
