import { redis } from "./redis.js";

// Log Redis connection status so you can see what's happening
redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis connection error:", err.message));

export const getOrCache = async (key: any, cb: any) => {
  try {
    // Check if Redis is actually connected before attempting cache operations
    if (redis.status === "ready") {
      const cachedData = await redis.get(key);
      if (cachedData) {
        console.log("Cache hit:", key);
        return JSON.parse(cachedData);
      }
      console.log("Cache miss:", key);
    } else {
      console.log("Redis not ready (status:", redis.status, "), skipping cache for:", key);
    }
  } catch (error) {
    // Redis failed — log it but don't crash, fall through to callback
    console.error("Redis GET error:", error);
  }

  // Fallback: fetch fresh data from the database
  const freshData = await cb();

  // Try to cache the result, but don't fail if Redis is down
  try {
    if (redis.status === "ready") {
      await redis.setex(key, 3600, JSON.stringify(freshData)); // Cache for 1 hour
    }
  } catch (error) {
    console.error("Redis SETEX error:", error);
  }

  return freshData;
};