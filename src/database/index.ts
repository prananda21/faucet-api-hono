import { drizzle } from 'drizzle-orm/bun-sql';

export const db = drizzle({
  connection: {
    hostname: Bun.env.DB_HOST,
    port: Bun.env.DB_PORT,
    username: Bun.env.DB_USERNAME,
    password: Bun.env.DB_PASSWORD,
    database: Bun.env.DB_NAME,
  },
});
