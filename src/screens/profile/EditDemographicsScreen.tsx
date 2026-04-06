import React from "react";
import { Alert } from "react-native";
import { useApp } from "../../context/AppContext";
import { useToast } from "../../context/ToastContext";
import { syncUserProfile } from "../../services/analyticsService";
import DemographicsScreen from "../onboarding/DemographicsScreen";

export default function EditDemographicsScreen({ navigation }: any) {
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();

  return (
    <DemographicsScreen
      isEditing
      initialValues={{
        age: settings.age,
        gender: settings.gender,
        goals: settings.goals,
        experienceLevel: settings.experienceLevel,
        analyticsConsent: settings.analyticsConsent,
      }}
      onComplete={async (data) => {
        updateSettings({
          age: data.age,
          gender: data.gender,
          goals: data.goals,
          experienceLevel: data.experienceLevel,
          analyticsConsent: data.analyticsConsent,
        });
        if (data.analyticsConsent) {
          const synced = await syncUserProfile({
            age: data.age,
            gender: data.gender,
            goals: data.goals,
            experienceLevel: data.experienceLevel,
          });
          if (!synced) {
            showToast("Profile saved locally. Sync will retry next time.");
          }
        }
        navigation.goBack();
      }}
    />
  );
}
