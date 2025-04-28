import { Hono } from 'hono';
import { openAPISpecs } from 'hono-openapi';
import { swaggerUI } from '@hono/swagger-ui';
import { isHttpError } from './utils/function';
import { ContentfulStatusCode } from 'hono/utils/http-status';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { languageDetector } from 'hono/language';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import path from 'path';
import transactionRoute from '@/feature/transaction/routes';
import { getOrigin } from './middleware/get-origin';
import {
  HttpException,
  InternalServerException,
  ValidationException,
} from './utils/error/custom';
import { ApiResponse, ErrorResponse } from './utils/interface';
import { serve } from 'bun';
import { isDatabaseInitialized } from './database';
import RedisInstance, { connection, isRedisInitialize } from './provider/redis';
import { Ethers } from './provider/ethers';
import { sentry } from '@hono/sentry';
import { dedupeIntegration } from 'toucan-js';

const app = new Hono();
const allowedOrigins = getOrigin();
const ethersService = new Ethers();

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
    lookupFromHeaderKey: 'accept-language',
    ignoreCase: true,
    debug: true,
  }),
);

// Monitoring (Sentry)
app.use(
  '*',
  sentry({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    sampleRate: parseFloat(process.env.SENTRY_SAMPLE_RATE ?? '1.0'), // % of errors sent
    tracesSampleRate: parseFloat(
      process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.0',
    ),
    debug: process.env.SENTRY_DEBUG === 'true', // prints internal logs,
    integrations: [dedupeIntegration()],

    // **Drop noisy events**: health checks, pings, etc.
    beforeSend(event) {
      if (event.transaction === '/health') {
        return null;
      }
      return event;
    },
  }),
);

/**
 * Locale Instance
 */

await (async () => {
  await i18next.use(Backend).init({
    fallbackLng: 'en',
    preload: ['en', 'id'],
    backend: {
      loadPath: path.resolve(__dirname, './locales/{{lng}}.json'),
    },
  });
})();

/**
 * Routes
 */
app.get('/', (c) => {
  return c.json({ message: `Welcome to Faucet API!` });
});

const api = app.basePath('/api');
api.route('/transaction', transactionRoute);

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
  const client = c.get('sentry');

  /**
   * Language initiation
   */
  const lng = c.get('language') || 'en';
  const t = i18next.getFixedT(lng);

  const localizedMessage = err.message
    ? err.message
    : status === 400
    ? t('bad_request')
    : t('internal_server_error');

  if (err instanceof ValidationException) {
    const status = err.status;
    const resp = err.errors;
    const message = resp.error || err.message;
    console.log(message);
    const errors = Array.isArray(resp) ? resp : [resp];

    const localizedErrors = errors.map((value) => {
      return t(value);
    });

    return c.json<ErrorResponse<null, string[]>>(
      {
        status: false,
        message: t(message),
        errors: localizedErrors,
        data: null,
      },
      status as ContentfulStatusCode,
    );
  }

  if (err instanceof InternalServerException) {
    // this monitoring only capture error
    client.captureException(err);

    return c.json<ApiResponse<null>>(
      {
        status: false,
        message: err.message,
        data: null,
      },
      err.status as ContentfulStatusCode,
    );
  }

  if (err instanceof HttpException) {
    return c.json<ApiResponse<null>>(
      {
        status: false,
        message: err.message,
        data: null,
      },
      err.status as ContentfulStatusCode,
    );
  }

  return c.json(
    {
      status: false,
      errors: err.name,
      message: err.message || 'Internal Server Error',
    },
    500,
  );
});

async function bootstrap() {
  try {
    console.log('📊 connecting into database...');
    if (!(await isDatabaseInitialized())) {
      console.error('🚨 Database not initialized! Run migrations first.');
      process.exit(1);
    }
    console.log('✅ Database connected successfully.');

    await RedisInstance.loadRedis();

    console.log('⛓️ connecting into chain network...');
    await ethersService.ensureChainConnected();

    const server = serve({
      port: 1000,
      fetch: app.fetch,
    });

    console.log(`server is running on http://localhost:${server.port}`);
    console.log(`environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(
      `server documentation is running on http://localhost:${server.port}/docs`,
    );

    console.log(`
███████╗██╗   ██╗ ██████╗ ██████╗███████╗███████╗███████╗                
██╔════╝██║   ██║██╔════╝██╔════╝██╔════╝██╔════╝██╔════╝                
███████╗██║   ██║██║     ██║     █████╗  ███████╗███████╗                
╚════██║██║   ██║██║     ██║     ██╔══╝  ╚════██║╚════██║                
███████║╚██████╔╝╚██████╗╚██████╗███████╗███████║███████║                
╚══════╝ ╚═════╝  ╚═════╝ ╚═════╝╚══════╝╚══════╝╚══════╝                
                                                                         
███████╗ █████╗ ██╗   ██╗ ██████╗███████╗████████╗     █████╗ ██████╗ ██╗
██╔════╝██╔══██╗██║   ██║██╔════╝██╔════╝╚══██╔══╝    ██╔══██╗██╔══██╗██║
█████╗  ███████║██║   ██║██║     █████╗     ██║       ███████║██████╔╝██║
██╔══╝  ██╔══██║██║   ██║██║     ██╔══╝     ██║       ██╔══██║██╔═══╝ ██║
██║     ██║  ██║╚██████╔╝╚██████╗███████╗   ██║       ██║  ██║██║     ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ╚═╝
                                                                         
██████╗  █████╗  ██████╗██╗  ██╗███████╗███╗   ██╗██████╗                
██╔══██╗██╔══██╗██╔════╝██║ ██╔╝██╔════╝████╗  ██║██╔══██╗               
██████╔╝███████║██║     █████╔╝ █████╗  ██╔██╗ ██║██║  ██║               
██╔══██╗██╔══██║██║     ██╔═██╗ ██╔══╝  ██║╚██╗██║██║  ██║               
██████╔╝██║  ██║╚██████╗██║  ██╗███████╗██║ ╚████║██████╔╝               
╚═════╝ ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═════╝           
                                                                          
      `);
    console.log('----------------Logs Below---------------');

    // Note: Bun.serve returns immediately—no need to await it.
  } catch (error) {
    console.error('failed to initialize services:', error);
    process.exit(1);
  }
}

bootstrap();
