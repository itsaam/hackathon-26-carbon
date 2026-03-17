import React from "react";
import { ActivityIndicator, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";
import { AppText } from "./AppText";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md";

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  style,
  ...props
}: PressableProps & {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useAppTheme();
  const isDisabled = Boolean(disabled || loading);

  const height = size === "sm" ? 40 : 46;
  const paddingH = size === "sm" ? 14 : 16;

  const base: ViewStyle = {
    height,
    paddingHorizontal: paddingH,
    borderRadius: theme.radius.pill,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  };

  const variants: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: t.colors.primary },
    secondary: { backgroundColor: t.colors.secondary },
    outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: t.colors.border },
    ghost: { backgroundColor: "transparent" },
    destructive: { backgroundColor: t.colors.destructive },
  };

  const textColor =
    variant === "outline" || variant === "ghost" ? t.colors.foreground : t.colors.primaryForeground;

  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={isDisabled}
      style={({ pressed }) => [
        base,
        variants[variant],
        pressed && !isDisabled ? { opacity: 0.92 } : null,
        isDisabled ? { opacity: 0.55 } : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="body" style={{ color: textColor, fontWeight: theme.font.weight.semibold as any }}>
          {title}
        </AppText>
      )}
    </Pressable>
  );
}

