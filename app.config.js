import "dotenv/config";

export default {
  expo: {
    name: "StackWise",
    slug: "stackwise",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#0a0a0a",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.stackwse.app",
      buildNumber: "4",
      backgroundColor: "#0a0a0a",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "StackWise uses your photo library for Self Scan body composition analysis.",
        NSCameraUsageDescription: "StackWise uses your camera to take photos for Self Scan body composition analysis.",
      },
    },
    android: {
      package: "com.stackwse.app",
      // POST_NOTIFICATIONS: required to display notifications on
      // Android 13+ (without it, scheduled reminders silently never
      // show). RECEIVE_BOOT_COMPLETED: re-arms scheduled reminders
      // after a device reboot — without it the daily reminder stops
      // firing until the app is reopened. The expo-notifications
      // plugin normally injects these; declaring them explicitly so
      // it doesn't depend on plugin behavior.
      permissions: [
        "CAMERA_ROLL",
        "CAMERA",
        "android.permission.POST_NOTIFICATIONS",
        "android.permission.RECEIVE_BOOT_COMPLETED",
      ],
      adaptiveIcon: {
        backgroundColor: "#0a0a0a",
        foregroundImage: "./assets/android-icon-foreground.png",
        backgroundImage: "./assets/android-icon-background.png",
        monochromeImage: "./assets/android-icon-monochrome.png",
      },
      navigationBarColor: "#0a0a0a",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "@sentry/react-native",
      [
        "expo-notifications",
        {
          // Default icon shown in the system notification tray.
          // Falls back to the app icon if not set.
          icon: "./assets/icon.png",
          color: "#0a0a0a",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "cd2a4aa2-0be9-48a4-92a5-30a5fe573587",
      },
    },
  },
};
