import { Redirect } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { View } from 'react-native';
import { colors } from '@/core/theme/colors';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const {} = useAuth(); // triggers loadCurrentUser on mount

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
