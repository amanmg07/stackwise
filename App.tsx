import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider, useApp } from "./src/context/AppContext";
import { ToastProvider } from "./src/context/ToastContext";
import RootNavigator from "./src/navigation/RootNavigator";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import DemographicsScreen from "./src/screens/onboarding/DemographicsScreen";
import DisclaimerScreen from "./src/screens/onboarding/DisclaimerScreen";
import { syncUserProfile } from "./src/services/analyticsService";
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
  const [splashDone, setSplashDone] = useState(false);

  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <Image source={require("./assets/logo.png")} style={loadingStyles.logo} />
        <ActivityIndicator size="small" color={colors.accent} style={loadingStyles.spinner} />
      </View>
    );
  }

  if (!settings.onboardingDone) {
    return (
      <OnboardingScreen onComplete={() => updateSettings({ onboardingDone: true })} />
    );
  }

  if (!settings.demographicsDone) {
    return (
      <DemographicsScreen
        onComplete={(data) => {
          updateSettings({
            demographicsDone: true,
            age: data.age,
            gender: data.gender,
            goals: data.goals,
            experienceLevel: data.experienceLevel,
            analyticsConsent: data.analyticsConsent,
          });
          if (data.analyticsConsent) {
            syncUserProfile({
              age: data.age,
              gender: data.gender,
              goals: data.goals,
              experienceLevel: data.experienceLevel,
            });
          }
        }}
      />
    );
  }

  if (!settings.disclaimerAccepted) {
    return (
      <DisclaimerScreen onAccept={() => updateSettings({ disclaimerAccepted: true })} />
    );
  }

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />;
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

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 180,
    resizeMode: "contain" as const,
  },
  spinner: { marginTop: 20 },
});

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
