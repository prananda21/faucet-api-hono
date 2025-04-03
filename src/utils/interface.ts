import { TransactionStatus } from './enum';
import { TransactionStatusType } from './type';

export interface TransactionRequest {
  wallet_address: string;
}

export interface TransactionResponse {
  wallet_address: string;
  status: TransactionStatus;
  transaction_hash: string;
  token_value: string;
}

export interface TransactionValue {
  id: string;
  walletAddress: string;
  status: TransactionStatusType;
  transactionHash: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

export interface CustomResponse {
  status: number;
}

export interface IDripResponse {
  wallet_address: `0x${string}`;
  transaction_hash: `0x${string}`;
  token_value: string;
  onchain_url: string;
}