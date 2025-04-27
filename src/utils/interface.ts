import { TransactionStatus } from './enum';
import { TransactionStatusType } from './type';

type DEFAULT_EVM_ADDRESS = `0x${string}`;

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
  walletAddress: DEFAULT_EVM_ADDRESS;
  transactionHash: DEFAULT_EVM_ADDRESS;
  tokenValue: string;
  onchainUrl: string;
}

export interface JobDataType {
  walletAddress: DEFAULT_EVM_ADDRESS;
}

export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface ErrorResponse<T, E> extends ApiResponse<T> {
  errors: E;
}
