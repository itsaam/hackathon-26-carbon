import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { theme, type AppColorScheme } from "./theme";
import { getThemePreference, setThemePreference, type ThemePreference } from "./themePreference";

type ThemeContextValue = {
  preference: ThemePreference;
  scheme: AppColorScheme;
  colors: ReturnType<typeof theme.scheme>["colors"];
  setPreference: (pref: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = (useColorScheme() ?? "light") as AppColorScheme;
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let alive = true;
    (async () => {
      const pref = await getThemePreference();
      if (!alive) return;
      setPreferenceState(pref);
    })();
    return () => {
      alive = false;
    };
  }, []);

  const scheme: AppColorScheme = preference === "system" ? system : preference;
  const resolved = theme.scheme(scheme);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    void setThemePreference(pref);
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      scheme: resolved.scheme,
      colors: resolved.colors,
      setPreference,
    }),
    [preference, resolved.scheme, resolved.colors],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme doit être utilisé dans <ThemeProvider>");
  return ctx;
}

