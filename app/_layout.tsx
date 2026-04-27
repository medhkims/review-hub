import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { Stack } from 'expo-router';
import { useTheme } from '@/core/theme/useTheme';
import { useFonts } from 'expo-font';
import { useAuth } from '@/presentation/auth/hooks/useAuth';

LogBox.ignoreLogs(['Unknown event handler property']);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/presentation/shared/components/ErrorBoundary';
import { CookieConsentBanner } from '@/presentation/shared/components/CookieConsentBanner';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import '@/core/i18n/i18n';
import '@/core/firebase/firebaseConfig';
import '../global.css';

if (Platform.OS === 'web') {
  const _origError = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('onResponderTerminate')) return;
    _origError(...args);
  };
}

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: Constants.expoConfig?.extra?.firebase?.webClientId,
  });
}

export default function RootLayout() {
  const loadCategoryDefaults = useCategoryDefaultStore((s) => s.load);
  const theme = useTheme();
  useAuth(); // Initialize auth state on every page load (not just on '/')
  useEffect(() => { loadCategoryDefaults(); }, [loadCategoryDefaults]);

  // On web, @expo/vector-icons' TTF import is redirected to null (see metro.config.js)
  // to avoid Firebase Hosting's SPA rewrite returning HTML instead of a font.
  // useFonts registers 'material-community' in expo-font's cache synchronously so
  // that when icon components check Font.isLoaded() on first render they get true.
  useFonts(
    Platform.OS === 'web'
      ? { 'material-community': '/fonts/MaterialCommunityIcons.ttf' }
      : {}
  );

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style={theme.statusBar} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
        <CookieConsentBanner />
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
