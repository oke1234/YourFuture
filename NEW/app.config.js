export default ({ config }) => ({
  ...config,
  name: "Your Future",
  slug: "yourfuture",
  version: "1.0.0",

  plugins: [
    "./app.plugin.cjs",
    "expo-font"
  ],

  icon: "./assets/icons/icon.png", // generiek app icon

  ios: {
    ...config.ios,
    bundleIdentifier: "casper.YourFuture.V1",
    buildNumber: "1",
    supportsTablet: true,
    icon: "./assets/icons/icon-1024.png",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: "casper.YourFuture.V1",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
    "extra": {
      "eas": {
        "projectId": "b37e6859-a0d6-4481-b9ec-027725387425"
      }
    }
});
