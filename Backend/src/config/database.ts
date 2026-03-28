import mongoose from 'mongoose';
import { getEnv } from './env.js';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Connect to MongoDB with retry logic.
 * Attempts up to 3 times with a 2-second delay between each attempt.
 */
export async function connectDatabase(): Promise<typeof mongoose> {
  const { MONGODB_URI } = getEnv();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[database] Connection attempt ${attempt}/${MAX_RETRIES}...`);

      const connection = await mongoose.connect(MONGODB_URI, {
        // Mongoose 8 uses sensible defaults; only override what we need
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(`[database] Connected to MongoDB at ${maskUri(MONGODB_URI)}`);
      return connection;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[database] Attempt ${attempt} failed: ${message}`);

      if (attempt < MAX_RETRIES) {
        console.log(`[database] Retrying in ${RETRY_DELAY_MS}ms...`);
        await sleep(RETRY_DELAY_MS);
      } else {
        throw new Error(
          `[database] Failed to connect after ${MAX_RETRIES} attempts. Last error: ${message}`
        );
      }
    }
  }

  // TypeScript needs this — the loop always throws or returns
  throw new Error('[database] Unreachable');
}

/**
 * Mask credentials in a MongoDB URI for safe logging.
 */
function maskUri(uri: string): string {
  try {
    const url = new URL(uri);
    if (url.password) {
      url.password = '***';
    }
    return url.toString();
  } catch {
    // If the URI can't be parsed, just show the host portion
    return uri.replace(/\/\/[^@]+@/, '//***:***@');
  }
}
