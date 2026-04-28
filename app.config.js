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
      bundleIdentifier: "com.stackwise.app",
      backgroundColor: "#0a0a0a",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "StackWise uses your photo library for Self Scan body composition analysis.",
        NSCameraUsageDescription: "StackWise uses your camera to take photos for Self Scan body composition analysis.",
      },
    },
    android: {
      package: "com.stackwise.app",
      permissions: ["CAMERA_ROLL", "CAMERA"],
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
    plugins: ["@sentry/react-native"],
    extra: {},
  },
};
