import React from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider, useApp } from "./src/context/AppContext";
import { ToastProvider } from "./src/context/ToastContext";
import RootNavigator from "./src/navigation/RootNavigator";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import { colors } from "./src/theme";

const navTheme = {
  dark: true,
  colors: {
    primary: colors.accent,
    background: colors.background,
    card: colors.background,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
  fonts: {
    regular: { fontFamily: "System", fontWeight: "400" as const },
    medium: { fontFamily: "System", fontWeight: "500" as const },
    bold: { fontFamily: "System", fontWeight: "700" as const },
    heavy: { fontFamily: "System", fontWeight: "900" as const },
  },
};

function AppContent() {
  const { settings, updateSettings, loading } = useApp();

  if (loading) return null;

  if (!settings.onboardingDone) {
    return (
      <OnboardingScreen onComplete={() => updateSettings({ onboardingDone: true })} />
    );
  }

  return (
    <ToastProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootNavigator />
      </NavigationContainer>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="light" />
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}
