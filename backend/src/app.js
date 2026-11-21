import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { isDatabaseReady } from './config/database.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { storesRouter } from './modules/stores/stores.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { productsRouter } from './modules/products/products.routes.js';
import { failure, success } from './utils/api-response.js';
import { notFound, errorHandler } from './middleware/error-handler.js';
import { globalLimiter, loginLimiter } from './middleware/rate-limit.js';

export function createApp() {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(helmet());
  const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    }
  }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/v1/hello', (req, res) => {
    return success(res, { service: 'shivam-electricals-api', message: 'Hello from Shivam Electricals ERP.' });
  });

  app.get('/api/v1/health', (req, res) => {
    const ready = isDatabaseReady();
    return success(res, {
      status: 'ok',
      db: ready,
      uptime: Math.round(process.uptime())
    });
  });

  app.use('/api/v1/auth/login', loginLimiter);
  app.use('/api/v1', globalLimiter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/stores', storesRouter);
  app.use('/api/v1/users', usersRouter);
  app.use('/api/v1/products', productsRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

export const app = createApp();
