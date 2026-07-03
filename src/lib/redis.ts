import { Redis } from "ioredis";

// REDIS_HOST နှင့် REDIS_PORT ကို အမြဲသုံးရန် သတ်မှတ်ခြင်း
export const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
 
});