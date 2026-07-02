import { Redis } from "ioredis";

// Render ပေါ်မှာဆိုရင် Connection URL သုံးမယ်၊ Local ဆိုရင် host/port နဲ့ သွားမယ်
export const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false, // Upstash ရဲ့ SSL ကို အဆင်ပြေပြေ လက်ခံဖို့
      },
    })
  : new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
    });

export const getOrCache = async (key: any, cb: any) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("from cache");
      const data = JSON.parse(cachedData);
      return reviveDates(data);
    }

    console.log("cache miss");
    const freshData = await cb();
    await redis.setex(key, 3600, JSON.stringify(freshData)); // for 1 hour

    return freshData;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

function reviveDates(data: any): any {
  if (typeof data !== 'object' || data === null) return data;

  if (Array.isArray(data)) {
    return data.map(reviveDates);
  }

  const revived: any = { ...data };
  for (const key in revived) {
    if (key === 'updatedAt' && typeof revived[key] === 'string') {
      revived[key] = new Date(revived[key]);
    } else if (typeof revived[key] === 'object') {
      revived[key] = reviveDates(revived[key]);
    }
  }
  return revived;
}