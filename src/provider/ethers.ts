import { ethers } from 'ethers';
import {
  InternalServerException,
  ServiceUnavailableException,
} from '../utils/error/custom';
import { TransactionRepository } from '../database/repository/implementation';
import * as dotenv from 'dotenv';
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
      throw new InternalServerException(
        'Get Nonce Error',
        'Failed to retrieve latest nonce, check the RPC Connection.',
      );
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
        throw new ServiceUnavailableException(
          'Balance too low',
          'Our server quite busy now.\n\n If you need a support please contact us in General Support Channel or sending email to support@mandalachain.io',
        );
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
}
