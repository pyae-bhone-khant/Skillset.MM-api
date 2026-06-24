import { Queue } from "bullmq"; 

export const cacheQueue = new Queue("cache-invalidation" , {
    connection: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
    }, 
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