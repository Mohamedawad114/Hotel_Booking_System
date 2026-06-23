import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URI as string, {
  maxRetriesPerRequest: null,
});
export const redisPub = new Redis(process.env.REDIS_URI as string);
export const redisSub = new Redis(process.env.REDIS_URI as string);


