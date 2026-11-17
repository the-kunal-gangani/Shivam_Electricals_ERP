import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/shivam_electricals'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-change-me-32'),
  JWT_REFRESH_SECRET: z.string().min(32).default('development-refresh-secret-change-me-32'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('*')
});

export const env = envSchema.parse(process.env);
