import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private redis: Redis | null = null;
  private memoryStore = new Map<string, { value: string; expiry: number }>();
  private memoryCleanupInterval: NodeJS.Timeout | null = null;

  constructor(private configService: ConfigService) {
    const redisUrl = this.configService.get('REDIS_URL');

    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) return null;
            return Math.min(times * 100, 3000);
          },
        });

        this.redis.on('error', (err) => {
          console.warn(
            'Redis connection error, falling back to memory cache:',
            err.message,
          );
          this.redis = null;
        });

        this.redis.on('connect', () => {
          console.log('Redis connected successfully');
        });
      } catch {
        console.warn('Failed to connect to Redis, using memory cache');
        this.redis = null;
      }
    }

    this.memoryCleanupInterval = setInterval(() => {
      this.cleanupMemory();
    }, 60000);
  }

  onModuleDestroy() {
    if (this.redis) {
      this.redis.disconnect();
    }
    if (this.memoryCleanupInterval) {
      clearInterval(this.memoryCleanupInterval);
    }
  }

  private cleanupMemory() {
    const now = Date.now();
    for (const [key, entry] of this.memoryStore.entries()) {
      if (entry.expiry < now) {
        this.memoryStore.delete(key);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return null;

    if (entry.expiry < Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return JSON.parse(entry.value);
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const ttl = options?.ttl || 3600;

    if (this.redis) {
      await this.redis.setex(key, ttl, JSON.stringify(value));
      return;
    }

    const expiry = Date.now() + ttl * 1000;
    this.memoryStore.set(key, { value: JSON.stringify(value), expiry });
  }

  async del(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
      return;
    }

    this.memoryStore.delete(key);
  }

  async delPattern(pattern: string): Promise<void> {
    if (this.redis) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return;
    }

    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.memoryStore.keys()) {
      if (regex.test(key)) {
        this.memoryStore.delete(key);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    if (this.redis) {
      const exists = await this.redis.exists(key);
      return exists === 1;
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return false;

    if (entry.expiry < Date.now()) {
      this.memoryStore.delete(key);
      return false;
    }

    return true;
  }

  async ttl(key: string): Promise<number> {
    if (this.redis) {
      return await this.redis.ttl(key);
    }

    const entry = this.memoryStore.get(key);
    if (!entry) return -1;

    const remaining = Math.floor((entry.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -1;
  }

  async incr(key: string): Promise<number> {
    if (this.redis) {
      return await this.redis.incr(key);
    }

    const entry = this.memoryStore.get(key);
    const current = entry ? parseInt(JSON.parse(entry.value), 10) : 0;
    const newValue = current + 1;
    this.memoryStore.set(key, {
      value: JSON.stringify(newValue),
      expiry: Date.now() + 86400000,
    });
    return newValue;
  }

  async cacheResponse<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) {
      return cached;
    }

    const data = await fetchFn();
    await this.set(key, data, { ttl });
    return data;
  }
}
