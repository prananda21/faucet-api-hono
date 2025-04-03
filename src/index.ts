import { Hono } from 'hono';
import { transactionValidatorMiddleware } from './middleware/validation';
import { describeRoute, openAPISpecs } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { transactionResponseSchema } from './utils/validation/schema';
import { swaggerUI } from '@hono/swagger-ui';
import { TransactionRepository } from './database/repository/implementation';
import { formatWaitTime, isHttpError } from './utils/function';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { BadRequestException } from './utils/error/custom';
import { addJobs, queueEvent, worker } from './provider/queue';
import { IDripResponse } from './utils/interface';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { languageDetector } from 'hono/language';
import { getOrigin } from './middleware/get-origin';

const app = new Hono();
const transactionRepo = new TransactionRepository();
const allowedOrigins = getOrigin();

/**
 * Global Middleware
 */
app.use(
  '/api/*',
  cors({
    origin: allowedOrigins,
  }),
);
app.use(
  csrf({
    origin: allowedOrigins,
  }),
);
app.use(
  languageDetector({
    supportedLanguages: ['en', 'id'],
    fallbackLanguage: 'en',
  }),
);

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
  '/api/drip',
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
    console.log('👨‍💻 Checking on database...');
    const alreadyTransaction = await transactionRepo.hasWalletDripToday(
      walletAddress,
    );
    if (alreadyTransaction.canDrip === false) {
      console.error('⛔️ Limitation Error due another transaction in one day.');
      const waitTimeFormat = formatWaitTime(alreadyTransaction.waitTimeSeconds);
      throw new BadRequestException(
        'Limitation Error',
        `Only one transaction for one wallet per day, try in ${waitTimeFormat}`,
      );
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
      tokenValue: Bun.env.TOKEN_VALUE as string,
      onchainUrl: `${Bun.env.ONCHAIN_URL}/${result.hash}`,
    };

    return c.json({ data, message: 'Transaction success.' });
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
