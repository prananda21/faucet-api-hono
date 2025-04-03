import {
  pgTable,
  pgEnum,
  varchar,
  uuid,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const statusEnum = pgEnum('status', ['PENDING', 'SUCCESS', 'FAILED']);

export const transactionTable = pgTable('transactions', {
  id: uuid().primaryKey().defaultRandom(),
  walletAddress: varchar('wallet_address').notNull(),
  status: statusEnum('status').default('PENDING').notNull(),
  transactionHash: text('transaction_hash'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
