import { Redirect } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { View } from 'react-native';
import { colors } from '@/core/theme/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  // Auth is initialized in app/_layout.tsx — no need to call useAuth() here

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight }}>
        <LoadingIndicator />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/(feed)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
