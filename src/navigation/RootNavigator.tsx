import React, { lazy, Suspense } from "react";
import { View, ActivityIndicator } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Eagerly load the home tab (first screen users see)
import ProtocolBuilderScreen from "../screens/protocol/ProtocolBuilderScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

// Lazy load everything else
const ExploreScreen = lazy(() => import("../screens/explore/ExploreScreen"));
const PeptideDetailScreen = lazy(() => import("../screens/research/PeptideDetailScreen"));
const CycleTrackerScreen = lazy(() => import("../screens/cycle/CycleTrackerScreen"));
const NewCycleScreen = lazy(() => import("../screens/cycle/NewCycleScreen"));
const LogDoseScreen = lazy(() => import("../screens/cycle/LogDoseScreen"));
const CycleDetailScreen = lazy(() => import("../screens/cycle/CycleDetailScreen"));
const JournalScreen = lazy(() => import("../screens/journal/JournalScreen"));
const NewEntryScreen = lazy(() => import("../screens/journal/NewEntryScreen"));
const ProtocolResultScreen = lazy(() => import("../screens/protocol/ProtocolResultScreen"));
const ReconCalculatorScreen = lazy(() => import("../screens/tools/ReconCalculatorScreen"));
const InteractionCheckerScreen = lazy(() => import("../screens/research/InteractionCheckerScreen"));
const CompareScreen = lazy(() => import("../screens/research/CompareScreen"));
const CommunityScreen = lazy(() => import("../screens/community/CommunityScreen"));
const NewPostScreen = lazy(() => import("../screens/community/NewPostScreen"));

function LazyFallback() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="small" color={colors.accent} />
    </View>
  );
}

function withSuspense<P extends object>(Component: React.ComponentType<P>) {
  return function SuspenseWrapper(props: P) {
    return (
      <Suspense fallback={<LazyFallback />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerShadowVisible: false,
};

// Explore Stack (Chat + Browse)
const ExploreStack = createNativeStackNavigator();
function ExploreNavigator() {
  return (
    <ExploreStack.Navigator screenOptions={screenOptions}>
      <ExploreStack.Screen name="ExploreHub" component={withSuspense(ExploreScreen)} options={{ headerShown: false }} />
      <ExploreStack.Screen name="PeptideDetail" component={withSuspense(PeptideDetailScreen)} options={{ title: "Details" }} />
      <ExploreStack.Screen name="ReconCalculator" component={withSuspense(ReconCalculatorScreen)} options={{ title: "Dosing Calculator" }} />
      <ExploreStack.Screen name="InteractionChecker" component={withSuspense(InteractionCheckerScreen)} options={{ title: "Interaction Checker" }} />
      <ExploreStack.Screen name="Compare" component={withSuspense(CompareScreen)} options={{ title: "Compare" }} />
    </ExploreStack.Navigator>
  );
}

// Cycle Stack
const CycleStack = createNativeStackNavigator();
function CycleNavigator() {
  return (
    <CycleStack.Navigator screenOptions={screenOptions}>
      <CycleStack.Screen name="CycleTracker" component={withSuspense(CycleTrackerScreen)} options={{ headerShown: false }} />
      <CycleStack.Screen name="NewCycle" component={withSuspense(NewCycleScreen)} options={{ title: "New Cycle" }} />
      <CycleStack.Screen name="LogDose" component={withSuspense(LogDoseScreen)} options={{ title: "Log Dose" }} />
      <CycleStack.Screen name="CycleDetail" component={withSuspense(CycleDetailScreen)} options={{ title: "Cycle Details" }} />
    </CycleStack.Navigator>
  );
}

// Journal Stack
const JournalStack = createNativeStackNavigator();
function JournalNavigator() {
  return (
    <JournalStack.Navigator screenOptions={screenOptions}>
      <JournalStack.Screen name="Journal" component={withSuspense(JournalScreen)} options={{ headerShown: false }} />
      <JournalStack.Screen name="NewEntry" component={withSuspense(NewEntryScreen)} options={{ title: "New Entry" }} />
    </JournalStack.Navigator>
  );
}

// Protocol/Home Stack (includes Profile)
const ProtocolStack = createNativeStackNavigator();
function ProtocolNavigator() {
  return (
    <ProtocolStack.Navigator screenOptions={screenOptions}>
      <ProtocolStack.Screen name="ProtocolBuilder" component={ProtocolBuilderScreen} options={{ headerShown: false }} />
      <ProtocolStack.Screen name="ProtocolResult" component={withSuspense(ProtocolResultScreen)} options={{ title: "Results" }} />
      <ProtocolStack.Screen name="NewCycle" component={withSuspense(NewCycleScreen)} options={{ title: "New Cycle" }} />
      <ProtocolStack.Screen name="ReconCalculator" component={withSuspense(ReconCalculatorScreen)} options={{ title: "Dosing Calculator" }} />
      <ProtocolStack.Screen name="InteractionChecker" component={withSuspense(InteractionCheckerScreen)} options={{ title: "Interaction Checker" }} />
      <ProtocolStack.Screen name="Compare" component={withSuspense(CompareScreen)} options={{ title: "Compare" }} />
      <ProtocolStack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </ProtocolStack.Navigator>
  );
}

// Community Stack
const CommunityStack = createNativeStackNavigator();
function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={screenOptions}>
      <CommunityStack.Screen name="CommunityFeed" component={withSuspense(CommunityScreen)} options={{ headerShown: false }} />
      <CommunityStack.Screen name="NewPost" component={withSuspense(NewPostScreen)} options={{ title: "Share Your Stack" }} />
      <CommunityStack.Screen name="PeptideDetail" component={withSuspense(PeptideDetailScreen)} options={{ title: "Details" }} />
    </CommunityStack.Navigator>
  );
}

type TabIconName = React.ComponentProps<typeof Ionicons>["name"];

const TAB_ICONS: Record<string, { focused: TabIconName; default: TabIconName }> = {
  HomeTab: { focused: "home", default: "home-outline" },
  CycleTab: { focused: "repeat", default: "repeat-outline" },
  ExploreTab: { focused: "compass", default: "compass-outline" },
  JournalTab: { focused: "book", default: "book-outline" },
  CommunityTab: { focused: "people", default: "people-outline" },
};

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.default;
          return <Ionicons name={iconName} size={22} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      })}
    >
      <Tab.Screen name="HomeTab" component={ProtocolNavigator} options={{ title: "Home" }} />
      <Tab.Screen name="CycleTab" component={CycleNavigator} options={{ title: "Cycle" }} />
      <Tab.Screen name="ExploreTab" component={ExploreNavigator} options={{ title: "Explore" }} />
      <Tab.Screen name="JournalTab" component={JournalNavigator} options={{ title: "Journal" }} />
      <Tab.Screen name="CommunityTab" component={CommunityNavigator} options={{ title: "Feed" }} />
    </Tab.Navigator>
  );
}
