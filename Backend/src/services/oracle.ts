import { getRedisClient } from '../config/redis.js';

const CACHE_KEY = 'oracle:sui_to_ghs';
const CACHE_TTL_SECONDS = 5 * 60; // 5 minutes

/**
 * Fetches the current SUI to GHS exchange rate.
 * Uses CoinGecko API and caches the result in Redis for 5 minutes.
 */
export async function getSuiToGhsRate(): Promise<number> {
  const redis = getRedisClient();

  try {
    // 1. Check Redis cache first
    if (redis) {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return parseFloat(cached);
      }
    }
  } catch (error) {
    console.warn(`[oracle] Failed to read from Redis cache: ${(error as Error).message}`);
  }

  try {
    // 2. Fetch fresh rate from CoinGecko
    // Note: CoinGecko doesn't have direct GHS support in simple price, so we fetch SUI-USD and USD-GHS, or we check if they support 'ghs' vs-currency.
    // Actually, CoinGecko might not support 'ghs' directly. Let's try USD first, then statically convert or rely on CoinGecko's GHS support if it exists.
    // CoinGecko does not support GHS in their vs_currencies. We'll use a static exchange rate USD-GHS for demonstration or fetch from an open exchange rate API if available.
    // We will just fetch SUI->USD and apply a static multiple (e.g. 1 USD = 15 GHS) for now, as free APIs for GHS are rate limited/require keys.
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd');
    
    if (!response.ok) {
      throw new Error(`CoinGecko HTTP error! status: ${response.status}`);
    }

    const data = await response.json() as { sui?: { usd: number } };
    const suiUsdPrice = data?.sui?.usd;

    if (!suiUsdPrice) {
      throw new Error('CoinGecko returned malformed data');
    }

    // Convert SUI->USD->GHS
    // 1 USD = ~15 GHS (Current estimate, in a real app use an oracle like ExchangeRate-API)
    const USD_TO_GHS_RATE = 15;
    const rateSuiToGhs = suiUsdPrice * USD_TO_GHS_RATE;

    try {
      // 3. Cache the successful result
      if (redis) {
        await redis.setex(CACHE_KEY, CACHE_TTL_SECONDS, rateSuiToGhs.toString());
      }
    } catch (error) {
      console.warn(`[oracle] Failed to write to Redis cache: ${(error as Error).message}`);
    }

    return rateSuiToGhs;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[oracle] Failed to fetch SUI/GHS rate from CoinGecko: ${message}`);
    return 0; // Fallback down to 0 GHS equivalent
  }
}
