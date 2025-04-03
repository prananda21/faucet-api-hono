import { z } from 'zod';
import 'zod-openapi/extend';

export const transactionSchema = z.object({
  walletAddress: z
    .string()
    .min(42)
    .regex(/^0x[a-fA-F0-9]{40}$/)
    .openapi({ example: '0x...' }),
});

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
