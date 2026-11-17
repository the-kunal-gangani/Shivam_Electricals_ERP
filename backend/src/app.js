import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseReady } from './config/database.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { storesRouter } from './modules/stores/stores.routes.js';
import { failure, success } from './utils/api-response.js';
import { notFound, errorHandler } from './middleware/error-handler.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/v1/hello', (req, res) => {
    return success(res, { service: 'shivam-electricals-api', message: 'Hello from Shivam Electricals ERP.' });
  });

  app.get('/api/v1/health', (req, res) => {
    const ready = isDatabaseReady();
    return (ready ? success : failure)(
      res,
      ready ? { service: 'api', database: 'connected' } : 'Database is not connected.',
      ready ? 200 : 503
    );
  });

  app.use(
    '/api/v1/auth/login',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      message: { success: false, message: 'Too many login attempts. Please try again later.' }
    })
  );
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/stores', storesRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
