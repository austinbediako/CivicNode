import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z
    .string({ required_error: 'MONGODB_URI is required — provide a MongoDB connection string' })
    .min(1, 'MONGODB_URI cannot be empty'),

  REDIS_URL: z
    .string({ required_error: 'REDIS_URL is required — provide a Redis connection URL' })
    .min(1, 'REDIS_URL cannot be empty'),

  JWT_SECRET: z
    .string({ required_error: 'JWT_SECRET is required — set a strong random secret for signing tokens' })
    .min(16, 'JWT_SECRET must be at least 16 characters for security'),

  ANTHROPIC_API_KEY: z
    .string({ required_error: 'ANTHROPIC_API_KEY is required — get one from console.anthropic.com' })
    .min(1, 'ANTHROPIC_API_KEY cannot be empty'),

  ANTHROPIC_MODEL: z
    .string()
    .default('claude-sonnet-4-6'),

  APTOS_NODE_URL: z
    .string({ required_error: 'APTOS_NODE_URL is required — e.g. https://fullnode.testnet.aptoslabs.com/v1' })
    .url('APTOS_NODE_URL must be a valid URL'),

  APTOS_MODULE_ADDRESS: z
    .string({ required_error: 'APTOS_MODULE_ADDRESS is required — the on-chain module address' })
    .min(1, 'APTOS_MODULE_ADDRESS cannot be empty'),

  APTOS_EXECUTOR_PRIVATE_KEY: z
    .string({ required_error: 'APTOS_EXECUTOR_PRIVATE_KEY is required — hex-encoded private key for proposal execution' })
    .min(1, 'APTOS_EXECUTOR_PRIVATE_KEY cannot be empty'),

  PORT: z
    .string()
    .default('4000')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('PORT must be a positive integer')),

  CORS_ORIGIN: z
    .string()
    .default('http://localhost:3000'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  RATE_LIMIT_AI_PER_DAY: z
    .string()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive('RATE_LIMIT_AI_PER_DAY must be a positive integer')),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and export the typed environment configuration.
 * Call this once at startup — throws with descriptive messages if any vars are missing/invalid.
 */
export function validateEnv(): Env {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(
      `\n\nEnvironment validation failed:\n${formatted}\n\nSee .env.example for reference.\n`
    );
  }

  return result.data;
}

// Lazily initialized — call validateEnv() from server.ts at startup
let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    _env = validateEnv();
  }
  return _env;
}

export { _env as env };
