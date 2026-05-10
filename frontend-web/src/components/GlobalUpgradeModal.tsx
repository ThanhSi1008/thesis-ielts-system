"use client";
import { useEffect, useState } from "react";
import UpgradeModal from "@/components/UpgradeModal";
import { subscriptionEvents } from "@/lib/api";

/**
 * Singleton modal that listens to the global subscriptionEvents bus.
 * Automatically opens whenever a 403 subscription/quota error is detected by the API interceptor.
 */
export default function GlobalUpgradeModal() {
  const [modalData, setModalData] = useState<{
    title: string;
    message: string;
    requiredTier: string;
  } | null>(null);

  useEffect(() => {
    const handler = (error: any) => {
      setModalData({
        title:
          error.error === "QUOTA_EXCEEDED" || error.error === "DAILY_QUOTA_EXCEEDED"
            ? "Quota Reached"
            : "Upgrade Required",
        message: error.message ?? "Upgrade your plan to continue.",
        requiredTier: error.requiredTier ?? error.currentTier ?? "PREMIUM",
      });
    };

    subscriptionEvents.on(handler);
    return () => subscriptionEvents.off(handler);
  }, []);

  return (
    <UpgradeModal
      isOpen={!!modalData}
      onClose={() => setModalData(null)}
      title={modalData?.title}
      message={modalData?.message}
      requiredTier={modalData?.requiredTier}
    />
  );
}
