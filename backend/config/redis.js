const { createClient } = require("redis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Two separate clients: one publishes, one subscribes (Redis requirement).
const pubClient = createClient({ url: REDIS_URL });
const subClient = pubClient.duplicate();

// A third general-purpose client for caching (session presence, rate limits, etc.)
const cacheClient = createClient({ url: REDIS_URL });

async function connectRedis() {
  pubClient.on("error", (err) => console.error("[Redis pub] error:", err.message));
  subClient.on("error", (err) => console.error("[Redis sub] error:", err.message));
  cacheClient.on("error", (err) => console.error("[Redis cache] error:", err.message));

  await Promise.all([pubClient.connect(), subClient.connect(), cacheClient.connect()]);
  console.log("[Redis] pub/sub + cache clients connected");
}

module.exports = { pubClient, subClient, cacheClient, connectRedis };
