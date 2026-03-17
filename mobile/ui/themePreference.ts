import * as SecureStore from "expo-secure-store";

const KEY = "carbontrack_theme_preference";

export type ThemePreference = "system" | "light" | "dark";

export async function getThemePreference(): Promise<ThemePreference> {
  try {
    const v = await SecureStore.getItemAsync(KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
    return "system";
  } catch {
    return "system";
  }
}

export async function setThemePreference(pref: ThemePreference): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, pref);
  } catch {
    // ignore
  }
}

