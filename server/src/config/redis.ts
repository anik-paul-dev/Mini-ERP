import Redis from 'ioredis';

let redis: Redis | null = null;

// In-memory fallback cache
const memoryCache = new Map<string, { value: string; expires: number }>();

const connectRedis = (): void => {
  const redisUrl = process.env.REDIS_URL;
  if (redisUrl) {
    try {
      redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times: number) => {
          if (times > 3) return null;
          return Math.min(times * 200, 2000);
        },
      });
      redis.on('connect', () => console.log('Redis connected'));
      redis.on('error', (err) => {
        console.log('Redis error, using memory cache fallback:', err.message);
        redis = null;
      });
    } catch {
      console.log('Redis not available, using memory cache');
    }
  } else {
    console.log('No REDIS_URL provided, using in-memory cache');
  }
};

const cache = {
  get: async (key: string): Promise<string | null> => {
    if (redis) {
      try {
        return await redis.get(key);
      } catch {
        return null;
      }
    }
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      memoryCache.delete(key);
      return null;
    }
    return item.value;
  },

  set: async (key: string, value: string, ttlSeconds: number = 300): Promise<void> => {
    if (redis) {
      try {
        await redis.setex(key, ttlSeconds, value);
        return;
      } catch {
        // fallback to memory
      }
    }
    memoryCache.set(key, { value, expires: Date.now() + ttlSeconds * 1000 });
  },

  del: async (key: string): Promise<void> => {
    if (redis) {
      try {
        await redis.del(key);
        return;
      } catch {
        // fallback
      }
    }
    memoryCache.delete(key);
  },

  delPattern: async (pattern: string): Promise<void> => {
    if (redis) {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) await redis.del(...keys);
        return;
      } catch {
        // fallback
      }
    }
    for (const key of memoryCache.keys()) {
      if (key.startsWith(pattern.replace('*', ''))) {
        memoryCache.delete(key);
      }
    }
  },
};

export { connectRedis, cache };
