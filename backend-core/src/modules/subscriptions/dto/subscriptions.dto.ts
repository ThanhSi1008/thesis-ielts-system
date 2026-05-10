import { IsEnum, IsOptional, IsString, IsUUID } from "class-validator";

export class CheckoutDto {
  @IsString()
  planId: string; // PricingPlan ID
}

export class AdminGrantDto {
  @IsUUID()
  userId: string;

  @IsString()
  tier: string; // "PREMIUM" | "PRO"

  @IsOptional()
  @IsString()
  durationDays?: string; // Default: 30
}

export class CancelSubscriptionDto {
  @IsOptional()
  @IsString()
  reason?: string;
}

export class VerifyCheckoutDto {
  @IsString()
  sessionId: string;

  @IsOptional()
  vnpParams?: Record<string, string>;
}
