const Redis = require("ioredis");
const config = require("./env");

// Redis configuration with enhanced production settings
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  // Connection pooling for better performance
  connectionName: "veda-finance-bot",
  maxRetriesPerRequest: 3,
  retryDelayOnFailover: 1000,
  showFriendlyErrorStack: config.nodeEnv === "development",

  // Enhanced production settings
  connectTimeout: 10000, // 10 seconds
  lazyConnect: true,
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },

  // Connection management
  keepAlive: 10000, // 10 seconds
  noDelay: true,

  // Performance optimizations
  enableOfflineQueue: true,
  enableReadyCheck: true,

  // Security settings
  tls:
    config.nodeEnv === "production"
      ? {
          rejectUnauthorized: true,
        }
      : undefined,
};

// Create Redis clients with enhanced configuration
const redisClient = new Redis({
  ...redisConfig,
  connectionName: "veda-finance-bot-main",
});

// Create separate client for pub/sub with optimized settings
const redisSubscriber = new Redis({
  ...redisConfig,
  connectionName: "veda-finance-bot-subscriber",
  lazyConnect: true,
  // Subscriber-specific optimizations
  enableOfflineQueue: false, // Don't queue commands when offline for subscribers
});

// Create separate client for rate limiting with different configuration
const redisRateLimiter = new Redis({
  ...redisConfig,
  connectionName: "veda-finance-bot-rate-limiter",
  lazyConnect: true,
  // Rate limiter-specific settings
  enableOfflineQueue: true,
  retryDelayOnFailover: 500, // Faster retry for rate limiting
});

// Enhanced Redis connection event handling
const setupRedisEventHandlers = (client, clientName) => {
  client.on("connect", () => {
    console.log(`✅ Redis ${clientName} connected`);
  });

  client.on("ready", () => {
    console.log(`✅ Redis ${clientName} ready`);
  });

  client.on("error", (err) => {
    console.error(`❌ Redis ${clientName} error:`, err.message);
    // Log additional context for debugging
    console.error(
      `   Context: ${clientName} client, Host: ${config.redis.host}:${config.redis.port}`
    );
  });

  client.on("close", () => {
    console.log(`⚠️ Redis ${clientName} connection closed`);
  });

  client.on("reconnecting", () => {
    console.log(`🔄 Redis ${clientName} reconnecting...`);
  });

  client.on("end", () => {
    console.log(`🛑 Redis ${clientName} connection ended`);
  });
};

// Setup event handlers for all clients
setupRedisEventHandlers(redisClient, "main");
setupRedisEventHandlers(redisSubscriber, "subscriber");
setupRedisEventHandlers(redisRateLimiter, "rate-limiter");

// Enhanced graceful shutdown
const shutdownRedisClients = async () => {
  console.log("🛑 Shutting down Redis connections...");

  try {
    // Quit all clients with timeout
    const quitPromises = [
      redisClient
        .quit()
        .catch((err) =>
          console.error("Error quitting main client:", err.message)
        ),
      redisSubscriber
        .quit()
        .catch((err) =>
          console.error("Error quitting subscriber client:", err.message)
        ),
      redisRateLimiter
        .quit()
        .catch((err) =>
          console.error("Error quitting rate limiter client:", err.message)
        ),
    ];

    // Wait for all clients to quit with a timeout
    await Promise.race([
      Promise.all(quitPromises),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Redis shutdown timeout")), 5000)
      ),
    ]);

    console.log("✅ All Redis connections closed gracefully");
  } catch (error) {
    console.error("⚠️ Error during Redis shutdown:", error.message);

    // Force disconnect if graceful quit fails
    redisClient.disconnect();
    redisSubscriber.disconnect();
    redisRateLimiter.disconnect();
    console.log("🔌 All Redis connections force disconnected");
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received, shutting down Redis connections...");
  await shutdownRedisClients();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received, shutting down Redis connections...");
  await shutdownRedisClients();
  process.exit(0);
});

// Enhanced Redis connection test with detailed diagnostics
const testRedisConnection = async () => {
  try {
    // Test basic connectivity
    const pingResult = await redisClient.ping();
    console.log(`✅ Redis ping test successful: ${pingResult}`);

    // Test set/get operations
    const testKey = "redis_test_key";
    const testValue = "redis_test_value_" + Date.now();

    await redisClient.setex(testKey, 10, testValue); // 10 seconds TTL
    const retrievedValue = await redisClient.get(testKey);

    if (retrievedValue === testValue) {
      console.log("✅ Redis set/get test successful");

      // Clean up test key
      await redisClient.del(testKey);
      return true;
    } else {
      console.error("❌ Redis set/get test failed: values don't match");
      return false;
    }
  } catch (error) {
    console.error("❌ Redis connection test failed:", error.message);
    return false;
  }
};

// Enhanced Redis health check with detailed information
const getRedisHealth = async () => {
  try {
    const info = await redisClient.info();
    const time = await redisClient.time();

    // Parse Redis info for key metrics
    const infoLines = info.split("\n");
    const redisVersion = infoLines
      .find((line) => line.startsWith("redis_version:"))
      ?.split(":")[1];
    const connectedClients = infoLines
      .find((line) => line.startsWith("connected_clients:"))
      ?.split(":")[1];
    const usedMemory = infoLines
      .find((line) => line.startsWith("used_memory_human:"))
      ?.split(":")[1];
    const uptime = infoLines
      .find((line) => line.startsWith("uptime_in_seconds:"))
      ?.split(":")[1];

    return {
      status: "healthy",
      version: redisVersion?.trim(),
      connectedClients: parseInt(connectedClients) || 0,
      usedMemory: usedMemory?.trim(),
      uptimeSeconds: parseInt(uptime) || 0,
      serverTime: time,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
    };
  }
};

module.exports = {
  redisClient,
  redisSubscriber,
  redisRateLimiter,
  testRedisConnection,
  getRedisHealth,
  shutdownRedisClients,
};
