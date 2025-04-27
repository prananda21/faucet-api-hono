import { InternalServerException } from '@/utils/error/custom';
import Redis from 'ioredis';

export const connection = new Redis({
  host: Bun.env.REDIS_HOST,
  port: Number(Bun.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});

export async function isRedisInitialize() {
  connection.on('connecting', () => {
    console.log('🗂️ connecting into Redis...');
  });
  connection.on('ready', () => {
    console.log('✅ Redis connected successfully.');
  });
  connection.on('error', (err) => {
    console.error(`🚨 Redis not initialized! error: ${err.message}`);
    process.exit(1);
  });
}

class RedisInstance {
  private static client: Redis;

  public static loadRedis(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Redis({
        host: Bun.env.REDIS_HOST,
        port: Number(Bun.env.REDIS_PORT),
        maxRetriesPerRequest: null,
      });

      this.client.once('connecting', () => {
        console.log('🗂️ connecting into Redis...');
      });

      this.client.once('ready', () => {
        console.log('✅ Redis connected successfully.');
        resolve();
      });

      this.client.once('error', (err) => {
        console.error(`🚨 Redis not initialized! error: ${err.message}`);
        process.exit(1);
      });

      this.client.once('end', () => {
        console.info('client disconnected...');
      });
    });
  }

  static redisClient() {
    if (!this.client) {
      throw new InternalServerException(
        'Redis not initialized — call loadRedis() first',
      );
    }

    return this.client;
  }
}

export default RedisInstance;
