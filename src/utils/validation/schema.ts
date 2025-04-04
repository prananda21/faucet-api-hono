import { z } from 'zod';
import 'zod-openapi/extend';
import { regexPattern } from '../regex';
import i18next from 'i18next';
import {
  INVALID_FORMAT_ADDRESS,
  INVALID_TYPE_ADDRESS,
} from '../../locales';

export const getTransactionSchema = (lng: string) => {
  const t = i18next.getFixedT(lng);

  return z.object({
    walletAddress: z
      .string({
        invalid_type_error: t(INVALID_TYPE_ADDRESS),
      })
      .min(42, t('invalid_format_address'))
      .regex(regexPattern.walletRegex, t(INVALID_FORMAT_ADDRESS))
      .openapi({ example: '0x...' }),
  });
};

/**
 * Response Schema
 */
export const transactionResponseSchema = z
  .object({
    transactionHash: z.string(),
    walletAddress: z.string(),
    tokenValue: z.string(),
    status: z.enum(['PENDING', 'SUCCESS', 'FAILED']),
  })
  .openapi({
    example: {
      walletAddress: '0x...',
      tokenValue: '100 ETH',
      transactionHash: '0x...',
      status: 'PENDING',
    },
  });
