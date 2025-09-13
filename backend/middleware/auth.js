const { supabase } = require("../config/supabase");
const redisService = require("../services/redisService");

// Helper function to validate token format
const validateTokenFormat = (token) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  // Basic JWT format validation (3 parts separated by dots)
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  // Check if token is not obviously malformed
  return parts.every(
    (part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part)
  );
};

// Enhanced security logging function
const logSecurityEvent = (event, details) => {
  console.log(`[SECURITY] ${event}:`, details);
};

// Middleware to authenticate requests using Supabase JWT tokens with enhanced security
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    const userAgent = req.get("User-Agent") || "unknown";

    // Create a more detailed identifier for rate limiting
    const authIdentifier = `${clientIP}:auth:${userAgent.substring(0, 50)}`;

    // Rate limiting check using Redis with enhanced security
    const rateLimitResult = await redisService.checkRateLimit(
      authIdentifier,
      50, // 50 requests per minute for auth
      60000 // 1 minute window
    );

    if (!rateLimitResult.allowed) {
      logSecurityEvent("RATE_LIMIT_EXCEEDED", {
        identifier: authIdentifier.substring(0, 50),
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
      });

      return res.status(429).json({
        success: false,
        error: "Too many authentication attempts. Please try again later.",
        data: null,
      });
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logSecurityEvent("MISSING_AUTH_HEADER", {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
      });

      return res.status(401).json({
        success: false,
        error: "Access token required",
        data: null,
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate token format
    if (!validateTokenFormat(token)) {
      logSecurityEvent("INVALID_TOKEN_FORMAT", {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
      });

      return res.status(401).json({
        success: false,
        error: "Invalid token format",
        data: null,
      });
    }

    // Check if token is blacklisted using Redis with enhanced security
    const isBlacklisted = await redisService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      logSecurityEvent("BLACKLISTED_TOKEN_USED", {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
        tokenId: token.substring(0, 20) + "...",
      });

      return res.status(401).json({
        success: false,
        error: "Token has been revoked",
        data: null,
      });
    }

    // Verify the token with Supabase
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Log suspicious activity with enhanced details
      logSecurityEvent("FAILED_AUTH_ATTEMPT", {
        ip: clientIP,
        userAgent: userAgent.substring(0, 50),
        tokenId: token.substring(0, 20) + "...",
        error: error ? error.message : "No user found",
      });

      return res.status(401).json({
        success: false,
        error: "Invalid or expired token",
        data: null,
      });
    }

    // Additional security checks
    if (user.banned_until && new Date(user.banned_until) > new Date()) {
      logSecurityEvent("BANNED_USER_ATTEMPT", {
        userId: user.id,
        ip: clientIP,
        bannedUntil: user.banned_until,
      });

      return res.status(403).json({
        success: false,
        error: "Account temporarily suspended",
        data: null,
      });
    }

    // Add user information and security context to request object
    req.user = user;
    req.accessToken = token;
    req.authContext = {
      ip: clientIP,
      userAgent,
      authenticatedAt: new Date().toISOString(),
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    logSecurityEvent("AUTH_SYSTEM_ERROR", {
      error: error.message,
      stack: error.stack,
    });

    return res.status(401).json({
      success: false,
      error: "Token validation failed",
      data: null,
    });
  }
};

// Optional authentication - doesn't fail if no token provided
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);

      // Validate token format
      if (validateTokenFormat(token)) {
        // Check if token is blacklisted using Redis with enhanced security
        const isBlacklisted = await redisService.isTokenBlacklisted(token);
        if (!isBlacklisted) {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser(token);

          if (
            !error &&
            user &&
            (!user.banned_until || new Date(user.banned_until) <= new Date())
          ) {
            req.user = user;
            req.accessToken = token;
            req.authContext = {
              ip: clientIP,
              userAgent: req.get("User-Agent") || "unknown",
              authenticatedAt: new Date().toISOString(),
            };
          }
        }
      }
    }

    next();
  } catch (error) {
    console.error("Optional auth error:", error);
    logSecurityEvent("OPTIONAL_AUTH_ERROR", {
      error: error.message,
    });

    // Continue without authentication
    next();
  }
};

// Middleware to check if user has admin privileges
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      logSecurityEvent("ADMIN_CHECK_UNAUTHENTICATED", {
        ip: req.authContext?.ip || "unknown",
      });

      return res.status(401).json({
        success: false,
        error: "Authentication required",
        data: null,
      });
    }

    // Check if user has admin role in user metadata
    const isAdmin =
      req.user.user_metadata?.role === "admin" ||
      req.user.app_metadata?.role === "admin" ||
      req.user.user_metadata?.admin === true;

    if (!isAdmin) {
      // Log unauthorized admin access attempt with enhanced details
      logSecurityEvent("UNAUTHORIZED_ADMIN_ACCESS", {
        userId: req.user.id,
        ip: req.authContext?.ip || "unknown",
        userAgent: req.authContext?.userAgent?.substring(0, 50) || "unknown",
      });

      return res.status(403).json({
        success: false,
        error: "Admin privileges required",
        data: null,
      });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    logSecurityEvent("ADMIN_CHECK_ERROR", {
      error: error.message,
      userId: req.user?.id || "unknown",
    });

    return res.status(500).json({
      success: false,
      error: "Authorization check failed",
      data: null,
    });
  }
};

// Middleware to revoke/blacklist tokens using Redis with enhanced security
const revokeToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      logSecurityEvent("REVOKE_TOKEN_MISSING", {
        userId: req.user?.id || "unknown",
        ip: req.authContext?.ip || "unknown",
      });

      return res.status(400).json({
        success: false,
        error: "Token is required",
        data: null,
      });
    }

    // Validate token format before attempting to blacklist
    if (validateTokenFormat(token)) {
      // Blacklist token using Redis with enhanced security
      const result = await redisService.blacklistToken(token);

      if (result) {
        logSecurityEvent("TOKEN_REVOKED", {
          userId: req.user?.id || "unknown",
          ip: req.authContext?.ip || "unknown",
          tokenId: token.substring(0, 20) + "...",
        });

        return res.json({
          success: true,
          data: { message: "Token revoked successfully" },
          error: null,
        });
      } else {
        logSecurityEvent("TOKEN_REVOCATION_FAILED", {
          userId: req.user?.id || "unknown",
          ip: req.authContext?.ip || "unknown",
          tokenId: token.substring(0, 20) + "...",
        });

        return res.status(500).json({
          success: false,
          error: "Failed to revoke token",
          data: null,
        });
      }
    }

    logSecurityEvent("REVOKE_INVALID_TOKEN", {
      userId: req.user?.id || "unknown",
      ip: req.authContext?.ip || "unknown",
    });

    return res.status(400).json({
      success: false,
      error: "Invalid token format",
      data: null,
    });
  } catch (error) {
    console.error("Token revocation error:", error);
    logSecurityEvent("TOKEN_REVOCATION_ERROR", {
      error: error.message,
      userId: req.user?.id || "unknown",
      ip: req.authContext?.ip || "unknown",
    });

    return res.status(500).json({
      success: false,
      error: "Token revocation failed",
      data: null,
    });
  }
};

// Rate limiting middleware for general API calls using Redis with enhanced security
const rateLimitAPI = (maxRequests = 100, windowMs = 60000) => {
  return async (req, res, next) => {
    const clientIP = req.ip || req.connection.remoteAddress || "unknown";
    // Create a more detailed identifier that includes user agent for better security
    const userAgent = req.get("User-Agent") || "unknown";
    const identifier = req.user
      ? `user:${req.user.id}`
      : `ip:${clientIP}:ua:${userAgent.substring(0, 100)}`;

    const rateLimitResult = await redisService.checkRateLimit(
      identifier,
      maxRequests,
      windowMs
    );

    if (!rateLimitResult.allowed) {
      logSecurityEvent("API_RATE_LIMIT_EXCEEDED", {
        identifier: identifier.substring(0, 50),
        userId: req.user?.id || "anonymous",
        ip: clientIP,
      });

      return res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please try again later.",
        data: null,
      });
    }

    // Add rate limit info to response headers
    res.set({
      "X-RateLimit-Limit": maxRequests,
      "X-RateLimit-Remaining": rateLimitResult.remaining,
      "X-RateLimit-Reset": new Date(rateLimitResult.resetTime).toUTCString(),
    });

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  revokeToken,
  rateLimitAPI,
  // Utility functions for external use
  validateTokenFormat,
};
