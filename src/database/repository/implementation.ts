import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '..';
import { transactionTable } from '../schema';
import { ITransactionRepo } from './interface';
import { TransactionValue } from '../../utils/interface';

export class TransactionRepository implements ITransactionRepo {
  async create(wallet_address: string): Promise<TransactionValue> {
    const [newTx] = await db
      .insert(transactionTable)
      .values({ walletAddress: wallet_address })
      .returning();

    return newTx;
  }

  async hasWalletDripToday(wallet_address: string): Promise<{
    canDrip: boolean;
    waitTimeMs: number;
    waitTimeSeconds: number;
  }> {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);

    /**
     * ! Code below for development only!!
     */
    const minuteAgo = new Date();
    minuteAgo.setTime(minuteAgo.getTime() - 60 * 1000);

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

    if (recentTx.length > 0) {
      const lastTxTime = new Date(recentTx[0].createdAt);
      // Next allowed time is 24 hours after the last transaction
      const nextAllowedTime = new Date(
        lastTxTime.getTime() + 24 * 60 * 60 * 1000,
      );
      const now = new Date();
      const waitTimeMs = nextAllowedTime.getTime() - now.getTime();
      // Calculate seconds, rounding up to include any partial second
      const waitTimeSeconds = waitTimeMs > 0 ? Math.ceil(waitTimeMs / 1000) : 0;

      return {
        canDrip: waitTimeMs <= 0,
        waitTimeMs: waitTimeMs > 0 ? waitTimeMs : 0,
        waitTimeSeconds,
      };
    }

    // If no transaction was found, the user is allowed to drip immediately.
    return {
      canDrip: true,
      waitTimeMs: 0,
      waitTimeSeconds: 0,
    };
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

  async deleteAll(): Promise<boolean> {
    try {
      await db.delete(transactionTable).execute();
      return true;
    } catch (error) {
      return false;
    }
  }
}
