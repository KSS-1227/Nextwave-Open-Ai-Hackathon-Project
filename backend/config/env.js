const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",

  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  // Google Veo 3 Video Generation API Configuration
  veo3: {
    // Recommended: Kie.ai for cost optimization ($0.05/sec vs $0.75/sec)
    kieApiKey: process.env.KIE_AI_API_KEY,

    // Alternative: Google Direct APIs
    googleApiKey: process.env.GOOGLE_GEMINI_API_KEY,
    vertexApiKey: process.env.VERTEX_AI_API_KEY,

    // Provider preference (kie_ai, google_gemini, vertex_ai)
    preferredProvider: process.env.VEO3_PROVIDER || "kie_ai",

    // Cost optimization settings
    maxCostPerVideo: parseFloat(process.env.VEO3_MAX_COST) || 5.0, // $5 max per video
    defaultDuration: parseInt(process.env.VEO3_DEFAULT_DURATION) || 30, // 30 seconds
  },

  jwt: {
    secret: process.env.JWT_SECRET,
  },

  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB) || 0,
  },

  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  },
};

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "OPENAI_API_KEY",
  "JWT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error(
    "Please check your .env file and ensure all required variables are set."
  );
  process.exit(1);
}

module.exports = config;
