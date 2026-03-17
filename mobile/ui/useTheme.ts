import { useTheme } from "./ThemeProvider";

export function useAppTheme() {
  const t = useTheme();
  return { scheme: t.scheme, colors: t.colors } as const;
}

