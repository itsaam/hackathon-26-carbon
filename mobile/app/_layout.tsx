import React, { useEffect, useRef } from "react";
import { Slot, router } from "expo-router";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider } from "../ui/ThemeProvider";
import { Screen } from "../ui/components/Screen";
import { useAppTheme } from "../ui/useTheme";

function RootLayoutInner() {
  const t = useAppTheme();
  const subscriptionRef = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    subscriptionRef.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as { type?: string; siteId?: number };
      if (data?.type === "co2_threshold_exceeded" && typeof data.siteId === "number") {
        router.push(`/sites/${data.siteId}` as any);
      }
    });
    return () => {
      if (subscriptionRef.current) Notifications.removeNotificationSubscription(subscriptionRef.current);
    };
  }, []);

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

