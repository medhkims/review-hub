import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: 'TChecki',
    slug: 'reviewhub',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'tchecki',
    userInterfaceStyle: 'automatic',
    icon: './assets/images/icon.png',
    assetBundlePatterns: ['**/*'],
    splash: {
      image: './assets/images/splash.png',
      resizeMode: 'contain' as const,
      backgroundColor: '#0F172A',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.reviewhub.app',
      buildNumber: '1',
      googleServicesFile: './GoogleService-Info.plist',
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          'TChecki needs access to your photo library to upload business and review images.',
        NSCameraUsageDescription:
          'TChecki needs access to your camera to take photos for reviews.',
        NSLocationWhenInUseUsageDescription:
          'TChecki uses your location to find businesses near you.',
      },
    },
    android: {
      package: 'com.reviewhub.app',
      versionCode: 1,
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/images/adaptive-icon.png',
        backgroundColor: '#0F172A',
      },
      permissions: [
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
      ],
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
        },
      },
    },
    web: {
      bundler: 'metro',
      output: 'static' as const,
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      'expo-asset',
      'expo-font',
      [
        'expo-splash-screen',
        {
          image: './assets/images/splash.png',
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#0F172A',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'TChecki needs access to your photos to upload business and review images.',
          cameraPermission:
            'TChecki needs access to your camera to take photos for reviews.',
        },
      ],
      [
        '@react-native-google-signin/google-signin',
        {
          iosUrlScheme:
            'com.googleusercontent.apps.713435343120-pk3qjgs7h4o88v5akco55h5htmgos2t4',
        },
      ],
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
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY ?? '',
      foursquareApiKey: process.env.FOURSQUARE_API_KEY ?? '',
    },
  };
};
