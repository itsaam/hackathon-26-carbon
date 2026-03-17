import React from "react";
import { Text, type TextProps } from "react-native";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";

type Variant = "body" | "muted" | "title" | "subtitle" | "caption" | "kpi" | "link";

export function AppText({
  variant = "body",
  style,
  ...props
}: TextProps & { variant?: Variant }) {
  const t = useAppTheme();

  const base = {
    color: t.colors.foreground,
    fontFamily: theme.font.family,
    fontSize: theme.font.size.md,
    fontWeight: theme.font.weight.regular,
  } as const;

  const variants: Record<Variant, object> = {
    body: {},
    muted: { color: t.colors.mutedForeground, fontSize: theme.font.size.sm },
    title: { fontSize: theme.font.size.xl, fontWeight: theme.font.weight.extrabold as any },
    subtitle: { fontSize: theme.font.size.lg, fontWeight: theme.font.weight.semibold as any, color: t.colors.mutedForeground },
    caption: { fontSize: theme.font.size.xs, color: t.colors.mutedForeground },
    kpi: { fontSize: theme.font.size.lg, fontWeight: theme.font.weight.bold as any },
    link: { color: t.colors.primary, fontWeight: theme.font.weight.semibold as any },
  };

  return <Text {...props} style={[base, variants[variant], style]} />;
}

