"use client";
import { X, Sparkles, Crown } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  requiredTier?: string;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  title,
  message,
  requiredTier = "PREMIUM",
}: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-primary/20 to-amber-200/30 flex items-center justify-center">
            <Crown className="w-10 h-10 text-primary" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {title ?? "Upgrade Required"}
          </h2>

          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {message ??
              `This feature requires a ${requiredTier} subscription. Upgrade to unlock all features!`}
          </p>

          <button
            onClick={() => {
              onClose();
              router.push("/pricing");
            }}
            className="w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-yellow-400 text-gray-900 font-bold py-3.5 px-6 rounded-full transition-all shadow-md hover:shadow-lg mb-3"
          >
            <Sparkles className="w-5 h-5" />
            View Plans
          </button>

          <button
            onClick={onClose}
            className="w-full text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 py-2 transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
