import { SetMetadata } from "@nestjs/common";

export const SUBSCRIPTION_TIER_KEY = "requiredTier";

/**
 * Decorator to mark endpoints that require a minimum subscription tier.
 * Usage: @RequiresTier("PREMIUM") or @RequiresTier("PRO")
 *
 * Tier hierarchy: FREE < PREMIUM < PRO
 */
export const RequiresTier = (tier: "PREMIUM" | "PRO") =>
  SetMetadata(SUBSCRIPTION_TIER_KEY, tier);
