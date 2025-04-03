import { Hono } from 'hono';
import { transactionValidatorMiddleware } from './middleware/validation';
import { describeRoute, openAPISpecs } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { transactionResponseSchema } from './utils/validation/schema';
import { swaggerUI } from '@hono/swagger-ui';
import { TransactionRepository } from './database/repository/implementation';
import { isHttpError } from './utils/function';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { BadRequestException } from './utils/error/custom';

const app = new Hono();
const transactionRepo = new TransactionRepository();

/**
 * Routes
 */
app.get('/', (c) => {
  return c.json({ message: `Welcome to Faucet API!` });
});

/**
 * Transaction routes
 */
app.post(
  '/drip',
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
            },
            required: ['walletAddress'],
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
  transactionValidatorMiddleware,
  async (c) => {
    const { walletAddress } = c.req.valid('json');

    /**
     * Check database first
     */
    const alreadyTransaction = await transactionRepo.hasWalletDripToday(
      walletAddress,
    );
    if (alreadyTransaction) {
      throw new BadRequestException(
        'Limitation Error',
        'Only one transaction for one wallet per day, try in 24 hours',
      );
    }

    return c.json({ message: 'hello' });
  },
);

/**
 * Documentation routes
 */
app.get(
  '/openapi',
  openAPISpecs(app, {
    documentation: {
      info: {
        title: 'Faucet API',
        version: '1.0.0',
        description:
          'API for Faucet Transaction or Distribution Token for short.',
      },
      servers: [
        {
          url: 'http://localhost:1000',
          description: 'Local server',
        },
      ],
    },
  }),
);
app.get('/docs', swaggerUI({ url: 'openapi' }));

/**
 * Global Error Handler
 */
app.onError((err, c) => {
  console.error('Unhandled error: ', err);
  const status = isHttpError(err) ? err.status : 500;

  return c.json(
    {
      data: null,
      errors: err.name,
      message: err.message || 'Internal Server Error',
    },
    status as ContentfulStatusCode,
  );
});

export default {
  port: 1000,
  fetch: app.fetch,
};
