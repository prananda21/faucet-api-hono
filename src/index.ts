import { Hono } from 'hono';
import { transactionValidatorMiddleware } from './middleware/validation';
import { describeRoute, openAPISpecs } from 'hono-openapi';
import { resolver } from 'hono-openapi/zod';
import { transactionResponseSchema } from './utils/validation/schema';
import { swaggerUI } from '@hono/swagger-ui';

const app = new Hono();

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
    const validate = c.req.valid('json');
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

export default {
  port: 1000,
  fetch: app.fetch,
};
