// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error("Error Stack:", err.stack);

  // Default error
  let error = {
    success: false,
    error: "Internal Server Error",
    data: null,
  };

  // Supabase errors
  if (err.message && err.message.includes("duplicate key")) {
    error.error = "Resource already exists";
    return res.status(409).json(error);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    error.error =
      "Validation Error: " +
      Object.values(err.errors)
        .map((val) => val.message)
        .join(", ");
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error.error = "Invalid token";
    return res.status(401).json(error);
  }

  if (err.name === "TokenExpiredError") {
    error.error = "Token expired";
    return res.status(401).json(error);
  }

  // OpenAI API errors
  if (err.message && err.message.includes("OpenAI")) {
    error.error = "AI service temporarily unavailable";
    return res.status(503).json(error);
  }

  // Custom application errors
  if (err.statusCode) {
    error.error = err.message;
    return res.status(err.statusCode).json(error);
  }

  // Default 500 error
  res.status(500).json(error);
};

// 404 handler for undefined routes
const notFound = (req, res, next) => {
  const error = {
    success: false,
    error: `Route ${req.originalUrl} not found`,
    data: null,
  };
  res.status(404).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};
