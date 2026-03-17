import React from "react";
import { View, type ViewProps, type ViewStyle } from "react-native";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";

export function Card({ style, ...props }: ViewProps) {
  const t = useAppTheme();

  const base: ViewStyle = {
    backgroundColor: t.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: theme.spacing.md,
  };

  return <View {...props} style={[base, style]} />;
}

