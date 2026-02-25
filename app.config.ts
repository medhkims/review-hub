import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'ReviewHub',
    slug: 'reviewhub',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'reviewhub',
    userInterfaceStyle: 'automatic',
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.reviewhub.app',
      googleServicesFile: './GoogleService-Info.plist',
    },
    android: {
      package: 'com.reviewhub.app',
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#ffffff',
      },
    },
    web: {
      bundler: 'metro',
      output: 'static' as const,
    },
    plugins: [
      'expo-router',
      'expo-asset',
      'expo-font',
      '@react-native-firebase/app',
      '@react-native-firebase/crashlytics',
      '@react-native-firebase/messaging',
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      eas: {
        projectId: process.env.EAS_PROJECT_ID ?? '8935c0a8-1214-4be5-8086-866fd0b57565',
      },
      firebase: {
        apiKey: process.env.FIREBASE_API_KEY ?? '',
        authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
        projectId: process.env.FIREBASE_PROJECT_ID ?? '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
        appId: process.env.FIREBASE_APP_ID ?? '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID ?? '',
        webClientId: process.env.FIREBASE_WEB_CLIENT_ID ?? '',
      },
    },
  };
};
