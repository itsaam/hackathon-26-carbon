import React from "react";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#020817" }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

