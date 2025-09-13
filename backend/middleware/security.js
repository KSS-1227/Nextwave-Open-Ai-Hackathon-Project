const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Enhanced security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.openai.com", "https://*.supabase.co"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable to allow Supabase integration
  crossOriginResourcePolicy: { policy: "cross-origin" },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  noSniff: true,
  frameguard: { action: "deny" },
  xssFilter: true,
});

// Rate limiting configurations
const createRateLimit = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      data: null,
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Custom key generator based on user or IP
    keyGenerator: (req) => {
      return req.user ? `user:${req.user.id}` : req.ip;
    },
  });

// Different rate limits for different endpoints
const rateLimits = {
  // General API rate limit
  general: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    100, // limit each user to 100 requests per windowMs
    "Too many requests from this user, please try again later."
  ),

  // Strict rate limit for authentication endpoints
  auth: createRateLimit(
    15 * 60 * 1000, // 15 minutes
    10, // limit each IP to 10 requests per windowMs
    "Too many authentication attempts, please try again later."
  ),

  // Rate limit for AI chat endpoints (more restrictive)
  aiChat: createRateLimit(
    60 * 1000, // 1 minute
    10, // limit each user to 10 requests per minute
    "Too many AI requests, please slow down."
  ),

  // Rate limit for file uploads
  upload: createRateLimit(
    60 * 60 * 1000, // 1 hour
    20, // limit each user to 20 uploads per hour
    "Too many file uploads, please try again later."
  ),
};

// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
  // Recursively sanitize strings in request body
  const sanitizeString = (str) => {
    if (typeof str !== "string") return str;

    // Remove potentially dangerous characters and patterns
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/javascript:/gi, "") // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .trim();
  };

  const sanitizeObject = (obj) => {
    if (obj && typeof obj === "object") {
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (typeof obj[key] === "string") {
            obj[key] = sanitizeString(obj[key]);
          } else if (typeof obj[key] === "object") {
            obj[key] = sanitizeObject(obj[key]);
          }
        }
      }
    }
    return obj;
  };

  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  next();
};

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//g, // Directory traversal
    /<script/gi, // XSS attempts
    /union\s+select/gi, // SQL injection
    /drop\s+table/gi, // SQL injection
    /exec\s*\(/gi, // Code injection
  ];

  const requestData = JSON.stringify(req.body || {});
  const isSuspicious = suspiciousPatterns.some(
    (pattern) => pattern.test(requestData) || pattern.test(req.url)
  );

  if (isSuspicious) {
    console.warn(`🚨 Suspicious request detected:`, {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
  }

  // Continue with request
  next();

  // Log response time for monitoring
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    if (duration > 5000) {
      // Log slow requests (> 5 seconds)
      console.warn(
        `⏱️ Slow request detected: ${req.method} ${req.url} took ${duration}ms`
      );
    }
  });
};

// CORS security enhancement
const corsSecurityCheck = (req, res, next) => {
  const origin = req.get("Origin");
  const referer = req.get("Referer");

  // Log potential CSRF attempts
  if (
    req.method !== "GET" &&
    req.method !== "HEAD" &&
    req.method !== "OPTIONS"
  ) {
    if (!origin && !referer) {
      console.warn(`🚨 Request without Origin/Referer headers:`, {
        ip: req.ip,
        method: req.method,
        url: req.url,
        userAgent: req.get("User-Agent"),
      });
    }
  }

  next();
};

// Validation middleware factory
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        error: `Validation error: ${error.details[0].message}`,
        data: null,
      });
    }

    next();
  };
};

module.exports = {
  securityHeaders,
  rateLimits,
  sanitizeInput,
  securityLogger,
  corsSecurityCheck,
  validateRequest,
  createRateLimit,
};
