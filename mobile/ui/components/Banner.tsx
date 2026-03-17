import React from "react";
import { View, type ViewStyle } from "react-native";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";
import { AppText } from "./AppText";

type Variant = "error" | "info";

export function Banner({ text, variant = "info" }: { text: string; variant?: Variant }) {
  const t = useAppTheme();
  const isError = variant === "error";

  const box: ViewStyle = {
    backgroundColor: isError ? `${t.colors.destructive}15` : `${t.colors.primary}12`,
    borderWidth: 1,
    borderColor: isError ? `${t.colors.destructive}40` : `${t.colors.border}`,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  };

  return (
    <View style={box} accessibilityRole={isError ? "alert" : undefined}>
      <AppText style={{ color: isError ? t.colors.destructive : t.colors.foreground, fontSize: theme.font.size.sm }}>
        {text}
      </AppText>
    </View>
  );
}

