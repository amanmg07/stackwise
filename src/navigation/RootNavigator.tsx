import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

import ExploreScreen from "../screens/explore/ExploreScreen";
import PeptideDetailScreen from "../screens/research/PeptideDetailScreen";
import CycleTrackerScreen from "../screens/cycle/CycleTrackerScreen";
import NewCycleScreen from "../screens/cycle/NewCycleScreen";
import LogDoseScreen from "../screens/cycle/LogDoseScreen";
import JournalScreen from "../screens/journal/JournalScreen";
import NewEntryScreen from "../screens/journal/NewEntryScreen";
import ProtocolBuilderScreen from "../screens/protocol/ProtocolBuilderScreen";
import ProtocolResultScreen from "../screens/protocol/ProtocolResultScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import ReconCalculatorScreen from "../screens/tools/ReconCalculatorScreen";
import InteractionCheckerScreen from "../screens/research/InteractionCheckerScreen";
import CompareScreen from "../screens/research/CompareScreen";
import CommunityScreen from "../screens/community/CommunityScreen";
import NewPostScreen from "../screens/community/NewPostScreen";

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
      <ExploreStack.Screen name="ExploreHub" component={ExploreScreen} options={{ headerShown: false }} />
      <ExploreStack.Screen name="PeptideDetail" component={PeptideDetailScreen} options={{ title: "Details" }} />
      <ExploreStack.Screen name="ReconCalculator" component={ReconCalculatorScreen} options={{ title: "Dosing Calculator" }} />
      <ExploreStack.Screen name="InteractionChecker" component={InteractionCheckerScreen} options={{ title: "Interaction Checker" }} />
      <ExploreStack.Screen name="Compare" component={CompareScreen} options={{ title: "Compare" }} />
    </ExploreStack.Navigator>
  );
}

// Cycle Stack
const CycleStack = createNativeStackNavigator();
function CycleNavigator() {
  return (
    <CycleStack.Navigator screenOptions={screenOptions}>
      <CycleStack.Screen name="CycleTracker" component={CycleTrackerScreen} options={{ headerShown: false }} />
      <CycleStack.Screen name="NewCycle" component={NewCycleScreen} options={{ title: "New Cycle" }} />
      <CycleStack.Screen name="LogDose" component={LogDoseScreen} options={{ title: "Log Dose" }} />
    </CycleStack.Navigator>
  );
}

// Journal Stack
const JournalStack = createNativeStackNavigator();
function JournalNavigator() {
  return (
    <JournalStack.Navigator screenOptions={screenOptions}>
      <JournalStack.Screen name="Journal" component={JournalScreen} options={{ headerShown: false }} />
      <JournalStack.Screen name="NewEntry" component={NewEntryScreen} options={{ title: "New Entry" }} />
    </JournalStack.Navigator>
  );
}

// Protocol/Home Stack (includes Profile)
const ProtocolStack = createNativeStackNavigator();
function ProtocolNavigator() {
  return (
    <ProtocolStack.Navigator screenOptions={screenOptions}>
      <ProtocolStack.Screen name="ProtocolBuilder" component={ProtocolBuilderScreen} options={{ headerShown: false }} />
      <ProtocolStack.Screen name="ProtocolResult" component={ProtocolResultScreen} options={{ title: "Results" }} />
      <ProtocolStack.Screen name="NewCycle" component={NewCycleScreen} options={{ title: "New Cycle" }} />
      <ProtocolStack.Screen name="ReconCalculator" component={ReconCalculatorScreen} options={{ title: "Dosing Calculator" }} />
      <ProtocolStack.Screen name="InteractionChecker" component={InteractionCheckerScreen} options={{ title: "Interaction Checker" }} />
      <ProtocolStack.Screen name="Compare" component={CompareScreen} options={{ title: "Compare" }} />
      <ProtocolStack.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
    </ProtocolStack.Navigator>
  );
}

// Community Stack
const CommunityStack = createNativeStackNavigator();
function CommunityNavigator() {
  return (
    <CommunityStack.Navigator screenOptions={screenOptions}>
      <CommunityStack.Screen name="CommunityFeed" component={CommunityScreen} options={{ headerShown: false }} />
      <CommunityStack.Screen name="NewPost" component={NewPostScreen} options={{ title: "Share Your Stack" }} />
      <CommunityStack.Screen name="PeptideDetail" component={PeptideDetailScreen} options={{ title: "Details" }} />
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
