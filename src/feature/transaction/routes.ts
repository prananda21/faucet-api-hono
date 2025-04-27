import { transactionResponseSchema } from '@/utils/validation/schema';
import { Hono } from 'hono';
import { describeRoute } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { transactionDrip } from './controller';

const transaction = new Hono();

transaction.post(
  '/',
  describeRoute({
    description: 'Do Transaction for Token Request.',
    tags: ['Transactions'], // Add one or more tags here
    requestBody: {
      description: 'Payload for token request',
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              walletAddress: {
                type: 'string',
                description: 'Unique Address of target wallet.',
                example: '0x...', // Example value for amount
              },
              captchaToken: {
                type: 'string',
                description: 'Captcha Token.',
                example: '...', // Example value for amount
              },
            },
            required: ['walletAddress', 'captcha_token'],
          },
        },
      },
    },
    responses: {
      200: {
        description: 'Successful sending token.',
        content: {
          'application/json': {
            schema: resolver(transactionResponseSchema),
          },
        },
      },
    },
  }),
  ...transactionDrip
);

export default transaction