import React, { createContext, useContext, useMemo } from "react";
import { theme } from "./theme";

type ThemeContextValue = {
  scheme: "light";
  colors: ReturnType<typeof theme.scheme>["colors"];
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const resolved = theme.scheme("light");

  const value = useMemo<ThemeContextValue>(
    () => ({
      scheme: "light",
      colors: resolved.colors,
    }),
    [resolved.colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}

