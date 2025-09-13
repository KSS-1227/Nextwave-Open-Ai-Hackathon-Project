const Joi = require("joi");

// Profile validation schemas
const profileSchemas = {
  updateProfile: Joi.object({
    business_name: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .required()
      .pattern(/^[a-zA-Z0-9\s\-&.'()]+$/)
      .messages({
        "string.pattern.base": "Business name contains invalid characters",
      }),

    owner_name: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .pattern(/^[a-zA-Z\s\-.']+$/)
      .messages({
        "string.pattern.base":
          "Owner name should only contain letters, spaces, hyphens, periods, and apostrophes",
      }),

    business_type: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .optional()
      .pattern(/^[a-zA-Z\s\-&]+$/)
      .messages({
        "string.pattern.base": "Business type contains invalid characters",
      }),

    location: Joi.string()
      .trim()
      .min(1)
      .max(100)
      .optional()
      .pattern(/^[a-zA-Z0-9\s\-,.'()]+$/)
      .messages({
        "string.pattern.base": "Location contains invalid characters",
      }),

    monthly_revenue: Joi.number().min(0).max(1000000000).optional(),
    monthly_expenses: Joi.number().min(0).max(1000000000).optional(),

    preferred_language: Joi.string()
      .trim()
      .valid(
        "English",
        "Hindi",
        "Tamil",
        "Telugu",
        "Marathi",
        "Bengali",
        "Gujarati",
        "Kannada",
        "Malayalam",
        "Punjabi"
      )
      .optional(),
  })
    .custom((value, helpers) => {
      // Custom validation: expenses shouldn't exceed revenue
      if (value.monthly_revenue && value.monthly_expenses) {
        if (value.monthly_expenses > value.monthly_revenue * 2) {
          return helpers.error("custom.expensesExceedRevenue");
        }
      }
      return value;
    })
    .messages({
      "custom.expensesExceedRevenue":
        "Monthly expenses seem unusually high compared to revenue. Please verify the amounts.",
    }),
};

// Chat validation schemas
const chatSchemas = {
  sendMessage: Joi.object({
    message: Joi.string()
      .trim()
      .min(1)
      .max(1000)
      .required()
      .pattern(/^[^<>{}\\]+$/)
      .messages({
        "string.pattern.base": "Message contains invalid characters",
      }),
  }),
};

// Document validation schemas
const documentSchemas = {
  createDocument: Joi.object({
    file_name: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .required()
      .pattern(/^[a-zA-Z0-9\s\-_.\(\)]+\.[a-zA-Z0-9]+$/)
      .messages({
        "string.pattern.base": "Invalid file name format",
      }),

    file_url: Joi.string().uri().required(),

    doc_type: Joi.string()
      .valid("invoice", "receipt", "bank_statement", "tax_document", "general")
      .optional(),

    extracted_text: Joi.string().max(10000).optional(),

    file_size: Joi.number()
      .min(1)
      .max(50 * 1024 * 1024)
      .optional(), // Max 50MB

    mime_type: Joi.string()
      .valid(
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "text/plain",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      )
      .optional(),
  }),

  updateDocument: Joi.object({
    file_name: Joi.string()
      .trim()
      .min(1)
      .max(255)
      .optional()
      .pattern(/^[a-zA-Z0-9\s\-_.\(\)]+\.[a-zA-Z0-9]+$/)
      .messages({
        "string.pattern.base": "Invalid file name format",
      }),

    doc_type: Joi.string()
      .valid("invoice", "receipt", "bank_statement", "tax_document", "general")
      .optional(),

    extracted_text: Joi.string().max(10000).optional(),

    status: Joi.string()
      .valid("uploaded", "processing", "processed", "failed")
      .optional(),
  }),
};

// Business ideas validation schemas
const businessIdeasSchemas = {
  generateIdeas: Joi.object({
    budget: Joi.number().min(1000).max(10000000000).required().messages({
      "number.min": "Budget must be at least ₹1,000",
      "number.max": "Budget cannot exceed ₹10,00,00,00,000",
    }),

    field: Joi.string()
      .trim()
      .min(1)
      .max(50)
      .required()
      .pattern(/^[a-zA-Z\s\-&]+$/)
      .messages({
        "string.pattern.base": "Field name contains invalid characters",
      }),
  }),
};

// Authentication validation schemas
const authSchemas = {
  revokeToken: Joi.object({
    token: Joi.string()
      .trim()
      .required()
      .pattern(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
      .messages({
        "string.pattern.base": "Invalid token format",
      }),
  }),
};

// Common validation helpers
const commonValidation = {
  // UUID validation
  uuid: Joi.string().guid({ version: "uuidv4" }),

  // Pagination validation
  pagination: Joi.object({
    page: Joi.number().integer().min(1).max(1000).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),

  // Date validation
  date: Joi.date().iso().max("now").optional(),

  // Search query validation
  searchQuery: Joi.string()
    .trim()
    .min(1)
    .max(100)
    .optional()
    .pattern(/^[a-zA-Z0-9\s\-_]+$/)
    .messages({
      "string.pattern.base": "Search query contains invalid characters",
    }),
};

module.exports = {
  profileSchemas,
  chatSchemas,
  documentSchemas,
  businessIdeasSchemas,
  authSchemas,
  commonValidation,
};
