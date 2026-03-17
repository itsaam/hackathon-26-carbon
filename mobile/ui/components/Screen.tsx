import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, View, type StyleProp, type ViewStyle } from "react-native";
import { router, usePathname } from "expo-router";
import { useAppTheme } from "../useTheme";
import { theme } from "../theme";
import { AppText } from "./AppText";

export function Screen({
  children,
  style,
  showBack = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  showBack?: boolean;
}) {
  const t = useAppTheme();
  const pathname = usePathname();

  const onBack = () => {
    // Expo Router: back si possible, sinon fallback sur dashboard (évite un bouton "mort").
    const can = typeof (router as any).canGoBack === "function" ? (router as any).canGoBack() : true;
    if (can) router.back();
    else router.replace("/dashboard");
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: t.colors.background }, style]}>
      <View style={{ flex: 1 }}>
        {showBack && pathname !== "/" ? (
          <View
            style={{
              height: 44,
              justifyContent: "center",
              paddingHorizontal: theme.spacing.sm,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Retour"
              onPress={onBack}
              style={({ pressed }) => [
                {
                  alignSelf: "flex-start",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: theme.radius.pill,
                  backgroundColor: t.colors.card,
                  borderWidth: 1,
                  borderColor: t.colors.border,
                },
                pressed ? { opacity: 0.9 } : null,
              ]}
            >
              <AppText style={{ fontWeight: theme.font.weight.semibold as any }}>← Retour</AppText>
            </Pressable>
          </View>
        ) : null}

        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </SafeAreaView>
  );
}

