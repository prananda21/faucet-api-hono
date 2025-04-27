import { validateTurnstile } from '@/middleware/turnstile';
import { transactionSchema } from '@/utils/validation/schema';
import { zValidator } from '@hono/zod-validator';
import { createFactory } from 'hono/factory';
import i18next from 'i18next';
import { TransactionService } from './service';
import { ValidationException } from '@/utils/error/custom';

const factory = createFactory();
const transactionService = new TransactionService();

export const transactionDrip = factory.createHandlers(
  validateTurnstile,
  zValidator('json', transactionSchema, (result, c) => {
    if (result.success == false) {
      const errors = result.error.issues.map((issue) => issue.message);

      throw new ValidationException('Validation Error', errors);
    }
  }),
  async (c) => {
    const { walletAddress } = c.req.valid('json');

    /**
     * Language initiation
     */
    const lng = c.get('language') || 'en';
    const t = i18next.getFixedT(lng);

    const response = await transactionService.drip(walletAddress, lng);

    return c.json(response);
  },
);
