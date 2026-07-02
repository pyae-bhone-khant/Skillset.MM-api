import { Queue } from "bullmq"; 
// IORedis အစား { Redis } ကို import ပြောင်းလိုက်ပါ
import { Redis } from "ioredis"; 

const queueConnection = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
      maxRetriesPerRequest: null, 
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null, 
    });

export const cacheQueue = new Queue("cache-invalidation" , {
    connection: queueConnection as any, 
    defaultJobOptions: {
        attempts: 3, 
        backoff: {
            type: "exponential", 
            delay: 1000, 
        }, 
        removeOnComplete: true , 
        removeOnFail: 1000, 
    }, 
});