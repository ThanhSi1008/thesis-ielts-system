/**
 * Programmatically control the top loading bar.
 *
 * Usage:
 *   import { navigationProgress } from "@/utils/navigationProgress";
 *   navigationProgress.start();
 *   await someApiCall();
 *   navigationProgress.complete();
 */
export const navigationProgress = {
  start: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("navigation-progress:start"));
    }
  },
  complete: () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("navigation-progress:complete"));
    }
  },
};
