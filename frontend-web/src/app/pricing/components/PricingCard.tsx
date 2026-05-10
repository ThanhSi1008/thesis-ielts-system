"use client";
import { Check, X, Loader2 } from "lucide-react";

interface PricingCardProps {
  tier: string;
  name: string;
  price: string;
  interval: string;
  description: string | null;
  features: string[];
  isCurrentPlan: boolean;
  isPopular?: boolean;
  onSelect: () => void;
  ctaLabel: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function PricingCard({
  name,
  price,
  interval,
  description,
  features,
  isCurrentPlan,
  isPopular,
  onSelect,
  ctaLabel,
  disabled,
  loading,
}: PricingCardProps) {
  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 shadow-sm transition-all duration-300 ${
        isPopular
          ? "ring-2 ring-primary shadow-xl scale-[1.02] bg-white dark:bg-gray-900 border-primary/30"
          : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:shadow-md"
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-gray-900 text-xs font-bold px-4 py-1 rounded-full shadow">
          ⭐ Most Popular
        </span>
      )}

      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
        {description && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">{price}</span>
          {price !== "Free" && (
            <span className="text-sm text-gray-500 dark:text-gray-400">{interval}</span>
          )}
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={onSelect}
        disabled={disabled || loading || isCurrentPlan}
        className={`w-full py-3 px-6 rounded-full font-semibold text-sm transition-all mb-8 flex items-center justify-center gap-2 ${
          isCurrentPlan
            ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-default"
            : isPopular
              ? "bg-primary hover:bg-yellow-400 text-gray-900 shadow-md hover:shadow-lg"
              : "bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900"
        } disabled:opacity-60 disabled:cursor-not-allowed`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {ctaLabel}
      </button>

      {/* Features */}
      <ul className="space-y-3 flex-1">
        {features.map((feature, i) => {
          const isExcluded = feature.startsWith("✗ ");
          const label = feature.replace(/^[✓✗] /, "");
          return (
            <li key={i} className="flex items-start gap-3 text-sm">
              {isExcluded ? (
                <X className="w-4 h-4 text-gray-300 dark:text-gray-600 mt-0.5 shrink-0" />
              ) : (
                <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
              )}
              <span
                className={
                  isExcluded
                    ? "text-gray-400 dark:text-gray-600"
                    : "text-gray-700 dark:text-gray-300"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
