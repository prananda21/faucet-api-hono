import { sql } from 'drizzle-orm';
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

/**
 * Returns true if the database is reachable.
 */
export async function canConnect(): Promise<boolean> {
  try {
    // simple SELECT 1 connectivity check
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (err) {
    console.error('DB connectivity check failed:', err);
    return false;
  }
}

/**
 * Returns true if the given table exists in the `public` schema.
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    // execute returns Record<string, any>[] – an array of row objects
    const rows = await db.execute<{ exists: boolean }>(sql`
      SELECT EXISTS (
        SELECT 1
          FROM information_schema.tables
         WHERE table_schema = 'public'
           AND table_name = ${tableName}
      ) AS "exists"
    `);

    // now just index into the array directly:
    return rows[0]?.exists ?? false;
  } catch (err) {
    console.error(`Error checking for table "${tableName}":`, err);
    return false;
  }
}

/**
 * “Initialized” means both reachable *and* a known table is present.
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  if (!(await canConnect())) return false;
  // change 'users' to any table that your migrations should have created
  return tableExists('transactions');
}
