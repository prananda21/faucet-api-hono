import { TransactionRepository } from '@/database/repository/implementation';
import { LIMIT_ERROR, TRANSACTION_SUCCESS } from '@/locales';
import { addJobs, queueEvent } from '@/provider/queue';
import {
  BadRequestException,
  HttpException,
  InternalServerException,
} from '@/utils/error/custom';
import { formatWaitTime } from '@/utils/function';
import { ApiResponse, IDripResponse } from '@/utils/interface';
import i18next from 'i18next';

const transactionRepo = new TransactionRepository();

export class TransactionService {
  async drip(
    walletAddress: string,
    lng: string,
  ): Promise<ApiResponse<IDripResponse>> {
    try {
      const t = i18next.getFixedT(lng);

      /**
       * Check database first
       */
      console.log('👨‍💻 Checking on database...');
      const alreadyTransaction = await transactionRepo.hasWalletDripToday(
        walletAddress,
      );

      if (alreadyTransaction.canDrip === false) {
        console.error(
          '⛔️ Limitation Error due another transaction in one day.',
        );
        const waitTimeFormat = formatWaitTime(
          alreadyTransaction.waitTimeSeconds,
          t,
        );

        const errorMessage = t(LIMIT_ERROR, { waitTimeFormat });
        console.log('errorMessage: ', errorMessage);
        throw new BadRequestException(errorMessage);
      }
      console.log('✅ Database checking success, continue to next flow.');

      /**
       * Add Queue
       */
      console.log('🚶 Entering queue...');
      const job = await addJobs(walletAddress, { walletAddress });
      const result = await job.waitUntilFinished(queueEvent);
      const data: IDripResponse = {
        walletAddress: result.to,
        transactionHash: result.hash,
        tokenValue: `${Bun.env.TOKEN_VALUE as string} ${
          Bun.env.TOKEN_CURRENCY
        }`,
        onchainUrl: `${Bun.env.ONCHAIN_URL}/${result.hash}`,
      };

      return { status: true, message: t(TRANSACTION_SUCCESS), data };
    } catch (error) {
      console.error('🚨 Error on transaction, error: ', error);
      if (error instanceof HttpException) {
        console.log('masuk instance httpException');
        throw error;
      }

      throw new InternalServerException(
        'An unexpected error occurred. please try again later.',
      );
    }
  }
}
