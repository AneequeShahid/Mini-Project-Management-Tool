import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const redisClient = redis;

export const cache = {
  async get(key) {
    const val = await redis.get(key);
    return val ? JSON.parse(val) : null;
  },
  async set(key, value, ttl = 3600) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  },
  async del(key) {
    await redis.del(key);
  },
};
