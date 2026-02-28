import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/presentation/shared/components/ErrorBoundary';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import '@/core/i18n/i18n';
import '@/core/firebase/firebaseConfig';
import '../global.css';

GoogleSignin.configure({
  webClientId: Constants.expoConfig?.extra?.firebase?.webClientId,
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
