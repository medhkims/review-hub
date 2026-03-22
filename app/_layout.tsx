import React, { useEffect } from 'react';
import { Platform, LogBox } from 'react-native';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { Stack } from 'expo-router';
import { useTheme } from '@/core/theme/useTheme';

LogBox.ignoreLogs(['Unknown event handler property']);
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/presentation/shared/components/ErrorBoundary';
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
  useEffect(() => { loadCategoryDefaults(); }, [loadCategoryDefaults]);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style={theme.statusBar} />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
