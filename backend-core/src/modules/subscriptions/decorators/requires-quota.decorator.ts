import { SetMetadata } from "@nestjs/common";

export const USAGE_QUOTA_KEY = "requiredQuota";

export interface QuotaMetadata {
  feature: string;
}

/**
 * Decorator to mark endpoints that consume a tracked quota feature.
 * Usage: @RequiresQuota("AI_WRITING_GRADING")
 *
 * The guard will:
 * 1. Check if the user's tier allows this feature at all
 * 2. Check if the user has remaining quota
 * 3. Increment usage on success
 */
export const RequiresQuota = (feature: string) =>
  SetMetadata(USAGE_QUOTA_KEY, { feature } as QuotaMetadata);
