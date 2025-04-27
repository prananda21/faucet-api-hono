import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import { BALANCE_TOO_LOW, GET_NONCE_ERROR } from '@/locales';
import {
  InternalServerException,
  ServiceUnavailableException,
} from '@/utils/error/custom';
dotenv.config();

export class Ethers {
  private provider: ethers.providers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(Bun.env.RPC_ADDRESS);
    this.signer = new ethers.Wallet(String(Bun.env.PK_WALLET), this.provider);
  }

  private async getNonce() {
    try {
      return await this.signer.getTransactionCount('latest');
    } catch (error) {
      throw new InternalServerException(GET_NONCE_ERROR);
    }
  }

  public async requestToken(walletAddress: `0x${string}`) {
    try {
      const getBalance = Number(
        ethers.utils.formatEther(
          await this.provider.getBalance(this.signer.address),
        ),
      );
      if (getBalance <= 5000) {
        throw new ServiceUnavailableException(BALANCE_TOO_LOW);
      }

      const nonce = await this.getNonce();
      const gasPrice = await this.provider.getGasPrice();
      const adjustedGasPrice = gasPrice
        .mul(ethers.BigNumber.from(140))
        .div(ethers.BigNumber.from(100));

      const request: ethers.providers.TransactionRequest = {
        to: walletAddress,
        value: ethers.utils.parseEther(Bun.env.TOKEN_VALUE as string),
        nonce,
        gasPrice: adjustedGasPrice,
        gasLimit: ethers.BigNumber.from(21000),
      };

      const signTx = await this.signer.signTransaction(request);
      const txResponse = await this.provider.sendTransaction(signTx);
      console.log('₿ Sending the token to target wallet address...');
      await this.provider.waitForTransaction(txResponse.hash);

      return txResponse;
    } catch (error) {
      throw error;
    }
  }

  // for log if the blockchain connection success
  public async ensureChainConnected(): Promise<void> {
    try {
      const network = await this.provider.getNetwork();
      console.log(
        `✅ Blockchain RPC healthy: ${network.name} (chainId ${network.chainId})`,
      );
    } catch (error) {
      console.error('❌ Blockchain RPC connection failed:', error);
      process.exit(1);
    }
  }
}
