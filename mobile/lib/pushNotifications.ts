import * as Notifications from "expo-notifications";
import { apiFetch } from "./api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande les permissions push, récupère le token Expo et l'enregistre côté backend.
 * À appeler une fois l'utilisateur connecté (ex. au chargement du dashboard).
 */
export async function registerPushTokenIfPossible(): Promise<void> {
  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== "granted") return;

  const projectId = process.env.EXPO_PUBLIC_PROJECT_ID;
  const tokenResult = await Notifications.getExpoPushTokenAsync({
    projectId: projectId ?? undefined,
  });
  const expoPushToken = tokenResult?.data;
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken[")) return;

  await apiFetch("/api/mobile/push-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expoPushToken }),
  });
}
