import { Crown, Gem } from "lucide-react";
import type { SubscriptionTier } from "@/types";

interface SubscriptionBadgeProps {
  tier: SubscriptionTier;
  size?: "sm" | "md";
}

export default function SubscriptionBadge({ tier, size = "sm" }: SubscriptionBadgeProps) {
  if (tier === "FREE") return null;

  const config =
    tier === "PRO"
      ? {
          icon: Gem,
          label: "PRO",
          bg: "bg-violet-100 dark:bg-violet-900/30",
          text: "text-violet-600 dark:text-violet-400",
        }
      : {
          icon: Crown,
          label: "PREMIUM",
          bg: "bg-amber-100 dark:bg-amber-900/30",
          text: "text-amber-600 dark:text-amber-400",
        };

  const Icon = config.icon;
  const sizeClass =
    size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-0.5" : "text-xs px-2 py-1 gap-1";

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full ${config.bg} ${config.text} ${sizeClass}`}
    >
      <Icon className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
      {config.label}
    </span>
  );
}
