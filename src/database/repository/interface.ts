import { TransactionValue } from '../../utils/interface';

export interface ITransactionRepo {
  create(wallet_address: string): Promise<TransactionValue>;
  hasWalletDripToday(
    wallet_address: string,
  ): Promise<{ canDrip: boolean; waitTimeMs: number }>;
  updateSuccess(
    wallet_address: string,
    tx_hash: string,
  ): Promise<TransactionValue | null>;
  updateFailed(wallet_address: string): Promise<TransactionValue | null>;
  findLastTx(wallet_address: string): Promise<TransactionValue>;
  deleteAll(): Promise<boolean>
}
