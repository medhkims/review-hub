import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useIsGuest } from '@/presentation/shared/hooks/useIsGuest';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface GuestGateProps {
  children: React.ReactNode;
}

/**
 * Wraps a screen that requires a full account.
 * If the user is a guest (under 13 / anonymous), shows a message
 * instead of the actual screen content.
 */
export const GuestGate: React.FC<GuestGateProps> = ({ children }) => {
  const isGuest = useIsGuest();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();

  if (!isGuest) return <>{children}</>;

  return (
    <ScreenLayout>
      <View style={{
        flex: 1, justifyContent: 'center', alignItems: 'center',
        paddingHorizontal: 32,
      }}>
        <View style={{
          width: 80, height: 80, borderRadius: 40,
          backgroundColor: `${colors.neonPurple}15`,
          alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <MaterialCommunityIcons name="lock-outline" size={40} color={colors.neonPurple} />
        </View>

        <AppText style={{
          fontSize: 20, fontWeight: '700', color: theme.text,
          textAlign: 'center', marginBottom: 8,
        }}>
          {t('auth.ageGate.title')}
        </AppText>

        <AppText style={{
          fontSize: 14, color: theme.textSecondary,
          textAlign: 'center', lineHeight: 20, marginBottom: 32,
        }}>
          {t('auth.guestRestriction')}
        </AppText>

        <AppButton
          title={t('auth.signUp.button')}
          variant="primary"
          size="lg"
          shape="pill"
          onPress={() => router.push('/(auth)/sign-up')}
          accessibilityLabel={t('auth.signUp.button')}
          accessibilityRole="button"
          style={{ width: '100%', maxWidth: 280, marginBottom: 16 }}
        />

        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <AppText style={{ fontSize: 14, color: theme.textSecondary, fontWeight: '600' }}>
            {t('common.back')}
          </AppText>
        </Pressable>
      </View>
    </ScreenLayout>
  );
};
