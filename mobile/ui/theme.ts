import { Platform } from "react-native";

export type AppColorScheme = "light" | "dark";

// Palette calquée sur `frontend/src/index.css` (HSL → hex approchés).
const palette = {
  capBlue: "#0063AD",
  capVibrant: "#14B8D4",
  capDeepPurple: "#6D3BB3",
  capTechRed: "#DC2626",
  capZestGreen: "#2AAE7B",

  grey50: "#F7F8FA",
  grey100: "#EFF2F5",
  grey200: "#E3E8EF",
  grey700: "#556273",
  grey900: "#1F2A37",

  darkBg: "#121923",
  darkCard: "#192231",
  darkCardAlt: "#223046",
} as const;

export const theme = {
  font: {
    // Inter n'est pas installé côté Expo; on se cale sur le system font comme fallback.
    family: Platform.select({ ios: "System", android: "System", default: "System" }),
    size: {
      xs: 12,
      sm: 13,
      md: 15,
      lg: 18,
      xl: 22,
      "2xl": 28,
    },
    weight: {
      regular: "400" as const,
      medium: "500" as const,
      semibold: "600" as const,
      bold: "700" as const,
      extrabold: "800" as const,
    },
  },
  radius: {
    sm: 10,
    md: 12,
    lg: 16,
    pill: 999,
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
  },
  scheme: (scheme: AppColorScheme) => {
    const isDark = scheme === "dark";
    return {
      scheme,
      colors: {
        background: isDark ? palette.darkBg : palette.grey50,
        foreground: isDark ? "#F3F4F6" : palette.grey900,
        muted: isDark ? palette.darkCardAlt : palette.grey100,
        mutedForeground: isDark ? "#A7B0BE" : palette.grey700,
        card: isDark ? palette.darkCard : "#FFFFFF",
        cardAlt: isDark ? palette.darkCardAlt : "#FFFFFF",
        border: isDark ? "#2B3A52" : palette.grey200,
        input: isDark ? "#223046" : "#FFFFFF",
        ring: isDark ? palette.capVibrant : palette.capBlue,
        primary: isDark ? palette.capVibrant : palette.capBlue,
        primaryForeground: "#FFFFFF",
        secondary: isDark ? palette.capBlue : palette.capVibrant,
        secondaryForeground: "#FFFFFF",
        destructive: isDark ? "#B91C1C" : palette.capTechRed,
        destructiveForeground: "#FFFFFF",
        success: palette.capZestGreen,
      },
    } as const;
  },
} as const;

