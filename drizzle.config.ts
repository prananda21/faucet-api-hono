import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const env = typeof Bun !== 'undefined' ? Bun.env : process.env;

const requiredEnv = (key: string): string => {
  if (!env[key]) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return env[key]!;
};

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: requiredEnv('DB_HOST'),
    port: Number(env.DB_PORT) || 5432,
    user: requiredEnv('DB_USERNAME'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
    ssl: false,
  },
});
