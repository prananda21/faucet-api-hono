import { zValidator } from '@hono/zod-validator';
import { transactionSchema } from '../utils/validation/schema';
import { HttpStatusCode } from '../utils/enum';

export const transactionValidatorMiddleware = zValidator(
  'json',
  transactionSchema,
  (result, c) => {
    if (!result.success) {
      console.log('⛔️ Validation Error: ', result.error);
      const message = result.error.issues.map((issue) => {
        if (issue.message === 'Invalid') {
          return 'Invalid format';
        }

        return issue.message;
      });
      return c.json(
        { errors: message, message: 'Validation Error' },
        HttpStatusCode.BAD_REQUEST,
      );
    }
  },
);
