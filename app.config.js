import 'dotenv/config';

export default {
  name: "Your Future",
  slug: "yourfuture",
  version: "1.0.0",

  ios: {
    bundleIdentifier: "com.huijsen.yourfuture",
    buildNumber: "1",
    supportsTablet: true,
    icon: "./assets/icons/icon-1024.png",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSContactsUsageDescription: "We use your contacts to help you connect with friends in Your Future",
      NSPhotoLibraryUsageDescription: "To set your profile picture",
      NSCameraUsageDescription: "To take a profile picture",
      NSPrivacyPolicyLink: "https://yourfuture.example.com/privacy",
    },
  },

  android: {
    package: "com.huijsen.yourfuture",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/icons/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },

  extra: {
    eas: {
      projectId: "35abaab1-bcbb-4ef8-8502-70193c953994", // hardcoded
    },
    firebaseConfig: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
    },
  },

  plugins: [
    "./app.plugin.cjs",
    "expo-font"
  ],

  icon: "./assets/icons/icon.png",
};
