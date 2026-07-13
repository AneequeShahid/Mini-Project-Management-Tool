import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export const cacheService = {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  async set(key, value, ttl = 3600) {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  },

  async del(key) {
    await redis.del(key);
  },

  async flush() {
    await redis.flushall();
  }
};
