import Redis from 'ioredis';

export const connection = new Redis({
  host: Bun.env.REDIS_HOST,
  port: Number(Bun.env.REDIS_PORT),
  maxRetriesPerRequest: null,
});
