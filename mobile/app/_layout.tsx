import React from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../ui/ThemeProvider";
import { Screen } from "../ui/components/Screen";
import { useAppTheme } from "../ui/useTheme";

function RootLayoutInner() {
  const t = useAppTheme();
  return (
    <Screen showBack={false}>
      <StatusBar style="dark" />
      <Slot />
    </Screen>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}

