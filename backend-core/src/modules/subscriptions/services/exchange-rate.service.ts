import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RedisService } from "../../../common/redis/redis.service";

// ─── Constants ─────────────────────────────────────────────
const REDIS_KEY = "exchange_rate:USD_VND";
const CACHE_TTL_SECONDS = 25 * 60 * 60; // 25 hours (survives if daily cron is slightly delayed)
const FALLBACK_RATE = Number(process.env.USD_TO_VND_RATE) || 25_400;
const API_URL = "https://open.er-api.com/v6/latest/USD";

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name);

  constructor(private readonly redis: RedisService) {}

  /**
   * Get the current USD → VND rate.
   * Priority: Redis cache → live API fetch → env fallback.
   */
  async getUsdToVndRate(): Promise<number> {
    // 1. Try Redis cache
    try {
      const cached = await this.redis.get(REDIS_KEY);
      if (cached) {
        const rate = Number(cached);
        if (rate > 0) return rate;
      }
    } catch (err) {
      this.logger.warn(`Redis read failed: ${err}`);
    }

    // 2. Try live API fetch (and cache the result)
    const fetched = await this.fetchAndCache();
    if (fetched) return fetched;

    // 3. Fallback to env / hardcoded default
    this.logger.warn(`Using fallback rate: ${FALLBACK_RATE}`);
    return FALLBACK_RATE;
  }

  /**
   * Cron: refresh exchange rate every day at 1:00 AM.
   * Runs before the subscription lifecycle cron (2 AM).
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async refreshRate() {
    this.logger.log("Refreshing USD → VND exchange rate...");
    const rate = await this.fetchAndCache();
    if (rate) {
      this.logger.log(`Exchange rate updated: 1 USD = ${rate.toLocaleString()} VND`);
    } else {
      this.logger.warn(`Failed to refresh, cached/fallback rate will be used.`);
    }
  }

  /**
   * Fetch rate from API and store in Redis.
   * Returns the rate on success, null on failure.
   */
  private async fetchAndCache(): Promise<number | null> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);

      const res = await fetch(API_URL, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) {
        this.logger.warn(`Exchange rate API returned ${res.status}`);
        return null;
      }

      const data = (await res.json()) as { result: string; rates?: Record<string, number> };
      if (data.result !== "success" || !data.rates?.VND) {
        this.logger.warn(`Unexpected API response: ${JSON.stringify(data).slice(0, 200)}`);
        return null;
      }

      const rate = Math.round(data.rates.VND);

      await this.redis.set(REDIS_KEY, String(rate), CACHE_TTL_SECONDS);
      return rate;
    } catch (err) {
      this.logger.warn(`Exchange rate fetch failed: ${err}`);
      return null;
    }
  }
}
