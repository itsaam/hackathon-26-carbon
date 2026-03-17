import React from "react";
import { TextInput, type TextInputProps, type TextStyle } from "react-native";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";

export function Input({ style, placeholderTextColor, ...props }: TextInputProps) {
  const t = useAppTheme();

  const base: TextStyle = {
    backgroundColor: t.colors.input,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    color: t.colors.foreground,
    fontFamily: theme.font.family,
    fontSize: theme.font.size.md,
  };

  return (
    <TextInput
      {...props}
      placeholderTextColor={placeholderTextColor ?? t.colors.mutedForeground}
      style={[base, style]}
    />
  );
}

