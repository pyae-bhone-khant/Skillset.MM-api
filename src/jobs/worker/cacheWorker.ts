import { Worker } from "bullmq";
import { Redis } from "ioredis";

// ၁။ ၎င်းဖိုင်အတွင်းသုံးမည့် Redis client (invalidateCache အတွက်)
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { tls: { rejectUnauthorized: false } })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    });

// ၂။ Worker အတွက် Connection Config သတ်မှတ်ခြင်း
const getWorkerConnectionOptions = () => {
  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      tls: {
        rejectUnauthorized: false,
      },
      maxRetriesPerRequest: null, // BullMQ Worker အတွက် မဖြစ်မနေလိုအပ်သည်
      connectTimeout: 10000,
    };
  }

  return {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
  };
};

export const caheWorker = new Worker(
  "cache-invalidation",
  async (job) => {
    const { pattern } = job.data;
    await invalidateCache(pattern);
  },
  {
    connection: getWorkerConnectionOptions(), // ဒီနေရာမှာ configuration အား ပေးလိုက်ခြင်း
    concurrency: 5,
  },
);

caheWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

caheWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with ${err.message}`);
});

const invalidateCache = async (pattern: string) => {
  try {
    const stream = redis.scanStream({
      match: pattern,
      count: 100,
    });

    const pipeline = redis.pipeline();
    let totalKeys = 0;

    stream.on("data", (keys: string[]) => {
      if (keys.length > 0) {
        keys.forEach((key) => {
          pipeline.del(key);
          totalKeys++;
        });
      }
    });

    await new Promise<void>((resolve, reject) => {
      stream.on("end", async () => {
        try {
          if (totalKeys > 0) {
            await pipeline.exec();
            console.log(`Invalidated ${totalKeys} keys`);
          }
          resolve();
        } catch (execError) {
          reject(execError);
        }
      });

      stream.on("error", (error: any) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error("Cache Invalidation error: ", error);
    throw error;
  }
};