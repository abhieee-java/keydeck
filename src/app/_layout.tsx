import React from "react";
import { Slot } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ControllerProvider } from "../hooks/ControllerProvider";
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ControllerProvider>
        <Slot />
      </ControllerProvider>
    </SafeAreaProvider>
  );
}
