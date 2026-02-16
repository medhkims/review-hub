#!/bin/bash
# ============================================================================
# MASTER SKELETON BUILDER
# React Native Clean Architecture — Expo (Bare/Dev Build)
# Run this ONCE to scaffold the entire project structure.
#
# Usage:
#   chmod +x build-skeleton.sh
#   ./build-skeleton.sh my-app-name
# ============================================================================

set -e

APP_NAME=${1:-"my-app"}

echo "🚀 Creating Expo project: $APP_NAME"
npx create-expo-app@latest "$APP_NAME" --template blank-typescript
cd "$APP_NAME"

# ============================================================================
# 1. INSTALL DEPENDENCIES
# ============================================================================
echo "📦 Installing core dependencies..."

# Navigation (Expo Router)
npx expo install expo-router expo-linking expo-constants expo-status-bar expo-splash-screen react-native-safe-area-context react-native-screens react-native-gesture-handler

# NativeWind (Tailwind)
npx expo install nativewind tailwindcss@3.3.2 react-native-reanimated

# State Management
npx expo install zustand

# Firebase
npx expo install firebase @react-native-async-storage/async-storage

# Forms + Validation
npm install react-hook-form zod @hookform/resolvers

# i18n
npm install react-i18next i18next

# Networking / Offline detection
npx expo install @react-native-community/netinfo

# Secure Storage
npx expo install expo-secure-store

# Flash List (performant lists)
npx expo install @shopify/flash-list

# Dev dependencies
npm install -D @types/react @types/react-native

echo "✅ Dependencies installed"

# ============================================================================
# 2. CREATE FOLDER STRUCTURE
# ============================================================================
echo "📁 Creating Clean Architecture folder structure..."

# --- Core ---
mkdir -p src/core/di
mkdir -p src/core/error
mkdir -p src/core/network
mkdir -p src/core/firebase
mkdir -p src/core/theme
mkdir -p src/core/constants
mkdir -p src/core/utils
mkdir -p src/core/i18n/locales
mkdir -p src/core/types

# --- Data Layer (per feature) ---
for feature in auth profile chat feed settings; do
  mkdir -p src/data/$feature/datasources
  mkdir -p src/data/$feature/models
  mkdir -p src/data/$feature/mappers
  mkdir -p src/data/$feature/repositories
done

# --- Domain Layer (per feature) ---
for feature in auth profile chat feed settings; do
  mkdir -p src/domain/$feature/entities
  mkdir -p src/domain/$feature/repositories
  mkdir -p src/domain/$feature/usecases
done

# --- Presentation Layer (per feature) ---
for feature in auth profile chat feed settings; do
  mkdir -p src/presentation/$feature/screens
  mkdir -p src/presentation/$feature/components
  mkdir -p src/presentation/$feature/hooks
  mkdir -p src/presentation/$feature/store
done

# --- Shared UI ---
mkdir -p src/presentation/shared/components/ui
mkdir -p src/presentation/shared/hooks
mkdir -p src/presentation/shared/layouts

# --- Expo Router (app/) ---
mkdir -p app/\(auth\)
mkdir -p app/\(main\)/\(feed\)
mkdir -p app/\(main\)/\(chat\)
mkdir -p app/\(main\)/\(profile\)

# --- Assets ---
mkdir -p src/assets/images
mkdir -p src/assets/fonts
mkdir -p src/assets/animations

# --- E2E ---
mkdir -p e2e

echo "✅ Folder structure created"

# ============================================================================
# 3. CORE FILES
# ============================================================================
echo "📝 Writing core files..."

# --- Either type ---
cat > src/core/types/either.ts << 'EOF'
export type Either<L, R> = Left<L> | Right<R>;

export class Left<L> {
  constructor(public readonly value: L) {}
  isLeft(): this is Left<L> { return true; }
  isRight(): boolean { return false; }
  fold<T>(onLeft: (l: L) => T, _onRight: (r: never) => T): T { return onLeft(this.value); }
}

export class Right<R> {
  constructor(public readonly value: R) {}
  isLeft(): boolean { return false; }
  isRight(): this is Right<R> { return true; }
  fold<T>(_onLeft: (l: never) => T, onRight: (r: R) => T): T { return onRight(this.value); }
}

export const left = <L>(value: L): Either<L, never> => new Left(value);
export const right = <R>(value: R): Either<never, R> => new Right(value);
EOF

# --- Exceptions ---
cat > src/core/error/exceptions.ts << 'EOF'
export class ServerException extends Error {
  constructor(message: string = 'Server error occurred', public code?: string) {
    super(message);
    this.name = 'ServerException';
  }
}

export class CacheException extends Error {
  constructor(message: string = 'Cache error occurred') {
    super(message);
    this.name = 'CacheException';
  }
}

export class NetworkException extends Error {
  constructor(message: string = 'No internet connection') {
    super(message);
    this.name = 'NetworkException';
  }
}

export class AuthException extends Error {
  constructor(message: string = 'Authentication failed', public code?: string) {
    super(message);
    this.name = 'AuthException';
  }
}
EOF

# --- Failures ---
cat > src/core/error/failures.ts << 'EOF'
export abstract class Failure {
  constructor(public readonly message: string) {}
}

export class ServerFailure extends Failure {}
export class CacheFailure extends Failure {}
export class NetworkFailure extends Failure {}
export class AuthFailure extends Failure {}
export class ValidationFailure extends Failure {}
EOF

# --- Network Info ---
cat > src/core/network/networkInfo.ts << 'EOF'
import NetInfo from '@react-native-community/netinfo';

export interface NetworkInfo {
  isConnected(): Promise<boolean>;
}

export class NetworkInfoImpl implements NetworkInfo {
  async isConnected(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }
}
EOF

# --- Firebase Config ---
cat > src/core/firebase/firebaseConfig.ts << 'EOF'
import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Move to environment variables
const firebaseConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

const app = initializeApp(firebaseConfig);

export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export default app;
EOF

# --- Theme ---
cat > src/core/theme/colors.ts << 'EOF'
export const colors = {
  primary: '#6366F1',
  primaryDark: '#4F46E5',
  secondary: '#EC4899',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#111827',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  error: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
} as const;
EOF

cat > src/core/theme/spacing.ts << 'EOF'
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
EOF

cat > src/core/theme/index.ts << 'EOF'
export { colors } from './colors';
export { spacing } from './spacing';
EOF

# --- Constants ---
cat > src/core/constants/appConstants.ts << 'EOF'
export const APP_NAME = 'MyApp';
export const DEFAULT_LANGUAGE = 'en';
export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
EOF

# --- i18n ---
cat > src/core/i18n/locales/en.json << 'EOF'
{
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "retry": "Retry",
    "save": "Save",
    "cancel": "Cancel",
    "offline": "You are offline"
  },
  "tabs": {
    "feed": "Feed",
    "chat": "Chat",
    "profile": "Profile",
    "settings": "Settings"
  },
  "auth": {
    "signIn": {
      "title": "Sign In",
      "email": "Email",
      "password": "Password",
      "button": "Sign In",
      "noAccount": "Don't have an account?"
    },
    "signUp": {
      "title": "Sign Up",
      "button": "Create Account"
    }
  },
  "feed": {
    "title": "Feed",
    "empty": "No posts yet"
  },
  "chat": {
    "title": "Chat",
    "empty": "No conversations yet"
  },
  "profile": {
    "title": "Profile"
  },
  "settings": {
    "title": "Settings"
  }
}
EOF

cat > src/core/i18n/locales/ar.json << 'EOF'
{
  "common": {
    "loading": "جاري التحميل...",
    "error": "حدث خطأ",
    "retry": "إعادة المحاولة",
    "save": "حفظ",
    "cancel": "إلغاء",
    "offline": "أنت غير متصل"
  },
  "tabs": {
    "feed": "الرئيسية",
    "chat": "المحادثات",
    "profile": "الملف الشخصي",
    "settings": "الإعدادات"
  }
}
EOF

cat > src/core/i18n/i18n.ts << 'EOF'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ar from './locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
EOF

# --- DI Container (empty scaffold) ---
cat > src/core/di/container.ts << 'EOF'
import { NetworkInfoImpl } from '@/core/network/networkInfo';

// ---- Shared ----
const networkInfo = new NetworkInfoImpl();

// ---- Auth ----
// TODO: Wire auth data sources → repository → use cases

// ---- Profile ----
// TODO: Wire profile data sources → repository → use cases

// ---- Chat ----
// TODO: Wire chat data sources → repository → use cases

// ---- Feed ----
// TODO: Wire feed data sources → repository → use cases

// ---- Settings ----
// TODO: Wire settings data sources → repository → use cases

export const container = {
  networkInfo,
  // TODO: Export all use cases here
};
EOF

# ============================================================================
# 4. SHARED PRESENTATION COMPONENTS
# ============================================================================
echo "📝 Writing shared UI components..."

cat > src/presentation/shared/components/ui/AppText.tsx << 'EOF'
import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({ children, className, ...props }) => {
  return (
    <Text className={`text-base text-gray-900 ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
};
EOF

cat > src/presentation/shared/components/ui/LoadingIndicator.tsx << 'EOF'
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '@/core/theme';

export const LoadingIndicator: React.FC = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
};
EOF

cat > src/presentation/shared/components/ui/ErrorView.tsx << 'EOF'
import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from './AppText';
import { useTranslation } from 'react-i18next';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  const { t } = useTranslation();

  return (
    <View className="flex-1 items-center justify-center p-6">
      <AppText className="text-red-500 text-center text-lg mb-4">
        {message ?? t('common.error')}
      </AppText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-indigo-500 px-6 py-3 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel={t('common.retry')}
        >
          <AppText className="text-white font-semibold">{t('common.retry')}</AppText>
        </Pressable>
      )}
    </View>
  );
};
EOF

cat > src/presentation/shared/components/NetworkBanner.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from './ui/AppText';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';

export const NetworkBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const { t } = useTranslation();

  if (isConnected) return null;

  return (
    <View className="bg-red-500 py-2 px-4 items-center">
      <AppText className="text-white text-sm font-medium">
        {t('common.offline')}
      </AppText>
    </View>
  );
};
EOF

cat > src/presentation/shared/components/ErrorBoundary.tsx << 'EOF'
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from './ui/AppText';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // TODO: Log to Crashlytics
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <View className="flex-1 items-center justify-center p-6">
          <AppText className="text-red-500 text-lg mb-4">Something went wrong</AppText>
          <Pressable
            onPress={this.handleReset}
            className="bg-indigo-500 px-6 py-3 rounded-xl"
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <AppText className="text-white font-semibold">Try Again</AppText>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
EOF

# --- Shared Hooks ---
cat > src/presentation/shared/hooks/useNetworkStatus.ts << 'EOF'
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetworkStatus = () => {
  const [isConnected, setIsConnected] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return { isConnected };
};
EOF

# --- Shared Layout ---
cat > src/presentation/shared/layouts/ScreenLayout.tsx << 'EOF'
import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NetworkBanner } from '../components/NetworkBanner';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withKeyboardAvoid?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  withKeyboardAvoid = false,
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <NetworkBanner />
      {children}
    </View>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};
EOF

# ============================================================================
# 5. FEATURE PLACEHOLDER SCREENS
# ============================================================================
echo "📝 Writing feature screens..."

# --- Feed ---
cat > src/presentation/feed/screens/FeedScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function FeedScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">{t('feed.title')}</AppText>
        <AppText className="text-gray-500 mt-2">{t('feed.empty')}</AppText>
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Chat ---
cat > src/presentation/chat/screens/ConversationsScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function ConversationsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">{t('chat.title')}</AppText>
        <AppText className="text-gray-500 mt-2">{t('chat.empty')}</AppText>
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Profile ---
cat > src/presentation/profile/screens/ProfileScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">{t('profile.title')}</AppText>
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Settings ---
cat > src/presentation/settings/screens/SettingsScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">{t('settings.title')}</AppText>
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Auth ---
cat > src/presentation/auth/screens/SignInScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function SignInScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center px-6">
        <AppText className="text-3xl font-bold mb-8">{t('auth.signIn.title')}</AppText>
        {/* TODO: Add AuthForm component with React Hook Form + Zod */}
        <AppText className="text-gray-500">{t('auth.signIn.noAccount')}</AppText>
      </View>
    </ScreenLayout>
  );
}
EOF

cat > src/presentation/auth/screens/SignUpScreen.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useTranslation } from 'react-i18next';

export default function SignUpScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center px-6">
        <AppText className="text-3xl font-bold mb-8">{t('auth.signUp.title')}</AppText>
        {/* TODO: Add SignUp form */}
      </View>
    </ScreenLayout>
  );
}
EOF

# ============================================================================
# 6. EXPO ROUTER — APP DIRECTORY (Bottom Tab Navigation)
# ============================================================================
echo "📝 Writing Expo Router files with bottom tab navigation..."

# --- Root Layout ---
cat > app/_layout.tsx << 'EOF'
import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from '@/presentation/shared/components/ErrorBoundary';
import '@/core/i18n/i18n';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
EOF

# --- Root Index (redirect) ---
cat > app/index.tsx << 'EOF'
import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: Check auth state and redirect accordingly
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(main)/(feed)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
EOF

# --- Auth Group ---
cat > app/\(auth\)/_layout.tsx << 'EOF'
import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}
EOF

cat > app/\(auth\)/sign-in.tsx << 'EOF'
export { default } from '@/presentation/auth/screens/SignInScreen';
EOF

cat > app/\(auth\)/sign-up.tsx << 'EOF'
export { default } from '@/presentation/auth/screens/SignUpScreen';
EOF

# --- Main Group (Bottom Tabs) ---
cat > app/\(main\)/_layout.tsx << 'EOF'
import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';
import { colors } from '@/core/theme';

export default function MainLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 88 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="(feed)"
        options={{
          title: t('tabs.feed'),
          tabBarLabel: t('tabs.feed'),
          // TODO: Add tabBarIcon with your icon library
        }}
      />
      <Tabs.Screen
        name="(chat)"
        options={{
          title: t('tabs.chat'),
          tabBarLabel: t('tabs.chat'),
        }}
      />
      <Tabs.Screen
        name="(profile)"
        options={{
          title: t('tabs.profile'),
          tabBarLabel: t('tabs.profile'),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarLabel: t('tabs.settings'),
        }}
      />
    </Tabs>
  );
}
EOF

# --- Feed Tab ---
cat > app/\(main\)/\(feed\)/_layout.tsx << 'EOF'
import React from 'react';
import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[postId]" />
    </Stack>
  );
}
EOF

cat > app/\(main\)/\(feed\)/index.tsx << 'EOF'
export { default } from '@/presentation/feed/screens/FeedScreen';
EOF

cat > app/\(main\)/\(feed\)/\[postId\].tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Post: {postId}</AppText>
        {/* TODO: Implement post detail */}
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Chat Tab ---
cat > app/\(main\)/\(chat\)/_layout.tsx << 'EOF'
import React from 'react';
import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[conversationId]" />
    </Stack>
  );
}
EOF

cat > app/\(main\)/\(chat\)/index.tsx << 'EOF'
export { default } from '@/presentation/chat/screens/ConversationsScreen';
EOF

cat > app/\(main\)/\(chat\)/\[conversationId\].tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Chat: {conversationId}</AppText>
        {/* TODO: Implement chat UI */}
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Profile Tab ---
cat > app/\(main\)/\(profile\)/_layout.tsx << 'EOF'
import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
    </Stack>
  );
}
EOF

cat > app/\(main\)/\(profile\)/index.tsx << 'EOF'
export { default } from '@/presentation/profile/screens/ProfileScreen';
EOF

cat > app/\(main\)/\(profile\)/edit.tsx << 'EOF'
import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function EditProfileScreen() {
  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Edit Profile</AppText>
        {/* TODO: Implement edit profile form */}
      </View>
    </ScreenLayout>
  );
}
EOF

# --- Settings Tab ---
cat > app/\(main\)/settings.tsx << 'EOF'
export { default } from '@/presentation/settings/screens/SettingsScreen';
EOF

# --- Not Found ---
cat > app/+not-found.tsx << 'EOF'
import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <AppText className="text-2xl font-bold mb-4">404 — Not Found</AppText>
      <Pressable
        onPress={() => router.replace('/')}
        className="bg-indigo-500 px-6 py-3 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Go home"
      >
        <AppText className="text-white font-semibold">Go Home</AppText>
      </Pressable>
    </View>
  );
}
EOF

# ============================================================================
# 7. DOMAIN LAYER PLACEHOLDER ENTITIES
# ============================================================================
echo "📝 Writing domain entity placeholders..."

cat > src/domain/auth/entities/userEntity.ts << 'EOF'
export interface UserEntity {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  createdAt: Date;
}
EOF

cat > src/domain/profile/entities/profileEntity.ts << 'EOF'
export interface ProfileEntity {
  id: string;
  userId: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
  followersCount: number;
  followingCount: number;
}
EOF

cat > src/domain/chat/entities/messageEntity.ts << 'EOF'
export interface MessageEntity {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Date;
  isPending: boolean;
}
EOF

cat > src/domain/chat/entities/conversationEntity.ts << 'EOF'
export interface ConversationEntity {
  id: string;
  participantIds: string[];
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}
EOF

cat > src/domain/feed/entities/postEntity.ts << 'EOF'
export interface PostEntity {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  content: string;
  imageUrl: string | null;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: Date;
}
EOF

cat > src/domain/settings/entities/settingsEntity.ts << 'EOF'
export interface SettingsEntity {
  language: string;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}
EOF

# ============================================================================
# 8. DOMAIN LAYER PLACEHOLDER REPOSITORY INTERFACES
# ============================================================================
echo "📝 Writing domain repository interfaces..."

cat > src/domain/auth/repositories/authRepository.ts << 'EOF'
import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<Either<Failure, UserEntity>>;
  signUp(email: string, password: string, displayName: string): Promise<Either<Failure, UserEntity>>;
  signOut(): Promise<Either<Failure, void>>;
  getCurrentUser(): Promise<Either<Failure, UserEntity | null>>;
}
EOF

cat > src/domain/profile/repositories/profileRepository.ts << 'EOF'
import { ProfileEntity } from '../entities/profileEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ProfileRepository {
  getProfile(userId: string): Promise<Either<Failure, ProfileEntity>>;
  updateProfile(profile: Partial<ProfileEntity>): Promise<Either<Failure, ProfileEntity>>;
}
EOF

cat > src/domain/chat/repositories/chatRepository.ts << 'EOF'
import { ConversationEntity } from '../entities/conversationEntity';
import { MessageEntity } from '../entities/messageEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ChatRepository {
  getConversations(): Promise<Either<Failure, ConversationEntity[]>>;
  getMessages(conversationId: string): Promise<Either<Failure, MessageEntity[]>>;
  sendMessage(conversationId: string, text: string): Promise<Either<Failure, MessageEntity>>;
}
EOF

cat > src/domain/feed/repositories/feedRepository.ts << 'EOF'
import { PostEntity } from '../entities/postEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface FeedRepository {
  getPosts(page?: number): Promise<Either<Failure, PostEntity[]>>;
  createPost(content: string, imageUrl?: string): Promise<Either<Failure, PostEntity>>;
  likePost(postId: string): Promise<Either<Failure, void>>;
}
EOF

cat > src/domain/settings/repositories/settingsRepository.ts << 'EOF'
import { SettingsEntity } from '../entities/settingsEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface SettingsRepository {
  getSettings(): Promise<Either<Failure, SettingsEntity>>;
  updateSettings(settings: Partial<SettingsEntity>): Promise<Either<Failure, SettingsEntity>>;
}
EOF

# ============================================================================
# 9. CONFIG FILES
# ============================================================================
echo "📝 Writing config files..."

# --- tsconfig paths ---
cat > tsconfig.json << 'EOF'
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
EOF

# --- tailwind.config.js ---
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        secondary: '#EC4899',
      },
    },
  },
  plugins: [],
};
EOF

# --- babel.config.js (NativeWind + path aliases) ---
cat > babel.config.js << 'EOF'
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      [
        'module-resolver',
        {
          alias: {
            '@': './src',
          },
        },
      ],
    ],
  };
};
EOF

# Install babel module resolver
npm install -D babel-plugin-module-resolver

# --- .env example ---
cat > .env.example << 'EOF'
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
EOF

# --- .gitignore additions ---
cat >> .gitignore << 'EOF'

# Environment
.env
.env.local
.env.production

# Firebase
google-services.json
GoogleService-Info.plist

# Maestro
e2e/.maestro/
EOF

# --- Copy CLAUDE.md into project ---
if [ -f "../CLAUDE.md" ]; then
  cp ../CLAUDE.md ./CLAUDE.md
  echo "✅ CLAUDE.md copied into project"
fi

# ============================================================================
# 10. GLOBAL CSS (NativeWind)
# ============================================================================
cat > global.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;
EOF

# ============================================================================
# DONE
# ============================================================================
echo ""
echo "============================================"
echo "✅ Skeleton built successfully!"
echo "============================================"
echo ""
echo "Project: $APP_NAME"
echo ""
echo "Structure:"
echo "  src/core/        → DI, errors, Firebase, theme, i18n, utils"
echo "  src/data/         → Data sources, models, mappers, repo impls"
echo "  src/domain/       → Entities, repository interfaces, use cases"
echo "  src/presentation/ → Feature screens, components, hooks, stores"
echo "  app/              → Expo Router (bottom tabs: Feed, Chat, Profile, Settings)"
echo ""
echo "Next steps:"
echo "  1. Add your Firebase config to .env (see .env.example)"
echo "  2. Update src/core/firebase/firebaseConfig.ts with env vars"
echo "  3. Place CLAUDE.md in the project root"
echo "  4. Run: npx expo start"
echo ""
echo "  Tab bar icons: Install an icon library (e.g. lucide-react-native)"
echo "  and update app/(main)/_layout.tsx tabBarIcon options."
echo ""
