export type BandTone = "success" | "danger" | "info" | "warning" | "primary";

export interface BandToneStyle {
  bg: string;
  softBg: string;
  border: string;
  text: string;
  ring: string;
  hex: string;
  label: string;
}

export const BAND_TONE_STYLES: Record<BandTone, BandToneStyle> = {
  success: {
    bg: "bg-success/20",
    softBg: "bg-success/10",
    border: "border-success/30",
    text: "text-success",
    ring: "ring-success/20",
    hex: "#22c55e",
    label: "Advanced",
  },
  danger: {
    bg: "bg-danger/10",
    softBg: "bg-danger/10",
    border: "border-danger/25",
    text: "text-danger",
    ring: "ring-danger/20",
    hex: "#ef4444",
    label: "Beginner",
  },
  warning: {
    bg: "bg-warning/20",
    softBg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    ring: "ring-warning/20",
    hex: "#f59e0b",
    label: "Intermediate",
  },
  info: {
    bg: "bg-info/20",
    softBg: "bg-info/10",
    border: "border-info/30",
    text: "text-info",
    ring: "ring-info/20",
    hex: "#3b82f6",
    label: "Upper-Intermediate",
  },
  primary: {
    bg: "bg-primary/10",
    softBg: "bg-primary/10",
    border: "border-primary/25",
    text: "text-primary",
    ring: "ring-primary/20",
    hex: "var(--color-primary, #FFC600)",
    label: "Not enough data",
  },
};

export const STAT_PALETTE_SEQUENCE: BandTone[] = ["primary", "success", "info", "warning", "danger"];

export function getBandTone(band?: number | null): BandTone {
  if (band == null || Number.isNaN(band)) return "primary";
  if (band <= 4.5) return "danger";
  if (band <= 6.0) return "warning";
  if (band <= 7.5) return "info";
  return "success";
}
