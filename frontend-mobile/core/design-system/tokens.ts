/**
 * Design Tokens - Synced with Web App
 */

export const tokens = {
  colors: {
    primary: "#FFC600",
    primaryHover: "#FFC600E6",
    secondary: "#EDEDED",
    background: {
      page: "#FFFFFF",
      card: "#FFFFFF",
      input: "#f8f9fa"
    },
    text: {
      primary: "#212529",
      secondary: "#64748b",
      disabled: "#cbd5e1",
      onPrimary: "#212529"
    },
    border: {
      default: "#e2e8f0",
      focus: "#FFC600",
      error: "#F44336"
    },
    status: {
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
      info: "#2196F3"
    }
  },
  typography: {
    fontFamily: {
      heading: "Farro",
      body: "Farro",
      mono: "ui-monospace"
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      "2xl": 24,
      "3xl": 30,
      "4xl": 36
    },
    fontWeight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const
    }
  },
  spacing: {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "6": 24,
    "8": 32,
    "10": 40,
    "12": 48,
    "16": 64,
    "20": 80
  },
  borderRadius: {
    sm: 4,
    md: 6,
    lg: 8,
    xl: 12,
    full: 9999
  }
} as const;

export type Tokens = typeof tokens;
