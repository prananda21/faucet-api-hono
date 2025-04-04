import { zValidator } from '@hono/zod-validator';
import { getTransactionSchema } from '../utils/validation/schema';
import { HttpStatusCode } from '../utils/enum';
import i18next from 'i18next';
import { Context, Next } from 'hono';

export const transactionValidatorMiddleware = async (
  c: Context,
  next: Next,
) => {
  const lng = c.get('language') || 'en';
  const schema = getTransactionSchema(lng);

  return zValidator('json', schema, (result, ctx) => {
    if (!result.success) {
      console.log('⛔️ Validation Error:', result.error);
      const message = result.error.issues.map((issue) => issue.message);
      const t = i18next.getFixedT(lng);

      return ctx.json(
        { errors: message, message: t('Validation Error') },
        HttpStatusCode.BAD_REQUEST,
      );
    }
  })(c, next);
};
