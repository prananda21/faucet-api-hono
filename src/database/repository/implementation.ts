import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '..';
import { transactionTable } from '../schema';
import { ITransactionRepo } from './interface';
import { TransactionValue } from '../../utils/interface';

export class TransactionRepository implements ITransactionRepo {
  async create(wallet_address: string): Promise<TransactionValue> {
    const [newTx] = await db
      .insert(transactionTable)
      .values({ walletAddress: wallet_address, status: 'PENDING' })
      .returning();

    return newTx;
  }

  async hasWalletDripToday(wallet_address: string): Promise<boolean> {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    const recentTx = await db
      .select()
      .from(transactionTable)
      .where(
        and(
          eq(transactionTable.walletAddress, wallet_address),
          eq(transactionTable.status, 'SUCCESS'),
          gte(transactionTable.createdAt, dayAgo),
        ),
      );

    return recentTx.length > 0;
  }

  async findLastTx(wallet_address: string): Promise<TransactionValue> {
    return await db
      .selectDistinct()
      .from(transactionTable)
      .where(eq(transactionTable.walletAddress, wallet_address))
      .orderBy(desc(transactionTable.createdAt))
      .limit(1)
      .then((res) => res[0] || null);
  }

  async updateSuccess(
    wallet_address: string,
    tx_hash: string,
  ): Promise<TransactionValue | null> {
    const existingTx = await this.findLastTx(wallet_address);
    if (!existingTx) return null;

    const [updatedTx] = await db
      .update(transactionTable)
      .set({ transactionHash: tx_hash, status: 'SUCCESS' })
      .where(eq(transactionTable.id, existingTx.id))
      .returning();

    return updatedTx;
  }

  async updateFailed(wallet_address: string): Promise<TransactionValue | null> {
    const existingTx = await this.findLastTx(wallet_address);
    if (!existingTx) return null;

    const [updatedTx] = await db
      .update(transactionTable)
      .set({ transactionHash: null, status: 'FAILED' })
      .where(eq(transactionTable.id, existingTx.id))
      .returning();

    return updatedTx;
  }
}
