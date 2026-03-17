import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, type StyleProp, type ViewStyle } from "react-native";
import { useAppTheme } from "../useTheme";

export function Screen({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useAppTheme();
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: t.colors.background }, style]}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}

