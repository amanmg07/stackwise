import React, { useState } from "react";
import { View, Text, Image, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { AppProvider, useApp } from "./src/context/AppContext";
import { ToastProvider } from "./src/context/ToastContext";
import RootNavigator from "./src/navigation/RootNavigator";
import SplashScreen from "./src/screens/SplashScreen";
import OnboardingScreen from "./src/screens/onboarding/OnboardingScreen";
import DemographicsScreen from "./src/screens/onboarding/DemographicsScreen";
import DisclaimerScreen from "./src/screens/onboarding/DisclaimerScreen";
import ResearchConsentScreen from "./src/screens/onboarding/ResearchConsentScreen";
import { syncUserProfile } from "./src/services/analyticsService";
import { colors } from "./src/theme";
import ErrorBoundary from "./src/components/ErrorBoundary";

// Read from EXPO_PUBLIC_* so the value is bundled into the runtime
// build. Plain `process.env.SENTRY_DSN` works in dev but doesn't
// propagate to production builds.
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || "";
const APP_VERSION = "1.0.0";

if (!SENTRY_DSN) {
  // Loud-but-non-fatal warning. In production this should never
  // happen — if it does, you've shipped without error monitoring.
  if (!__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(
      "[Sentry] No EXPO_PUBLIC_SENTRY_DSN set — production errors won't be captured.",
    );
  }
}

Sentry.init({
  dsn: SENTRY_DSN,
  enabled: !__DEV__ && !!SENTRY_DSN,
  release: `stackwise@${APP_VERSION}`,
  environment: __DEV__ ? "development" : "production",
  tracesSampleRate: 0.2,
  // Strip Authorization headers from breadcrumbs so user JWTs never
  // accidentally leak into the Sentry dashboard.
  beforeBreadcrumb(breadcrumb) {
    if (breadcrumb.data && typeof breadcrumb.data === "object") {
      const data = breadcrumb.data as Record<string, any>;
      if (data.request_headers) delete data.request_headers.authorization;
    }
    return breadcrumb;
  },
});

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

  if (!settings.researchConsentDecided) {
    return (
      <ResearchConsentScreen
        onDecided={(consented) =>
          updateSettings({
            researchConsentDecided: true,
            researchDataConsent: consented,
          })
        }
      />
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

function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <StatusBar style="light" />
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
