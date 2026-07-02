import { Redis } from "ioredis";


const redisOptions = process.env.REDIS_URL 
  ? process.env.REDIS_URL 
  : { host: process.env.REDIS_HOST || "127.0.0.1", port: Number(process.env.REDIS_PORT) || 6379 };

export const redis = new Redis(redisOptions as any, {
  maxRetriesPerRequest: null,
  tls: process.env.REDIS_URL ? { rejectUnauthorized: false } : undefined,
});