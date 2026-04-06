import React from "react";
import { useApp } from "../../context/AppContext";
import { syncUserProfile } from "../../services/analyticsService";
import DemographicsScreen from "../onboarding/DemographicsScreen";

export default function EditDemographicsScreen({ navigation }: any) {
  const { settings, updateSettings } = useApp();

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
      onComplete={(data) => {
        updateSettings({
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
        navigation.goBack();
      }}
    />
  );
}
