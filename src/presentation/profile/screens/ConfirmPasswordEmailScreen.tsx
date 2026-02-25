import React, { useCallback } from 'react';
import { View, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';

export default function ConfirmPasswordEmailScreen() {
  useAnalyticsScreen(AnalyticsScreens.CONFIRM_PASSWORD_EMAIL);
  const { t } = useTranslation();
  const router = useRouter();

  const handleGoToInbox = useCallback(async () => {
    const mailUrl = Platform.select({
      ios: 'message://',
      android: 'intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_EMAIL;end',
      default: 'mailto:',
    });

    const canOpen = await Linking.canOpenURL(mailUrl);
    if (canOpen) {
      await Linking.openURL(mailUrl);
    }
  }, []);

  const handleClose = useCallback(() => {
    router.dismissAll();
  }, [router]);

  return (
    <ScreenLayout>
      {/* Header */}
      <View className="px-6 pt-3 pb-4 flex-row items-center justify-between">
        <View className="w-10" />
        <View className="w-10" />
      </View>

      {/* Content */}
      <View className="flex-1 px-6 justify-center items-center -mt-20">
        {/* Icon with glow */}
        <View className="relative items-center justify-center mb-8">
          <View className="absolute w-40 h-40 rounded-full bg-purple-500/15 blur-[80px]" />
          <View className="w-24 h-24 bg-card-dark border border-slate-700/30 rounded-full items-center justify-center shadow-neon-glow z-10">
            <MaterialCommunityIcons name="email-check-outline" size={44} color="#A855F7" />
          </View>
        </View>

        {/* Heading */}
        <AppText className="text-2xl font-bold text-center mb-4">
          {t('confirmPasswordEmail.heading')}
        </AppText>

        {/* Description */}
        <AppText className="text-slate-400 text-sm text-center leading-relaxed max-w-[300px]">
          {t('confirmPasswordEmail.description')}
        </AppText>

        {/* Buttons */}
        <View className="mt-12 w-full space-y-4">
          <AppButton
            variant="primary"
            size="large"
            onPress={handleGoToInbox}
            className="shadow-lg shadow-purple-500/40"
            accessibilityLabel={t('confirmPasswordEmail.goToInbox')}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-2">
              <AppText className="text-white font-semibold text-base">
                {t('confirmPasswordEmail.goToInbox')}
              </AppText>
              <MaterialCommunityIcons name="open-in-new" size={16} color="#FFFFFF" />
            </View>
          </AppButton>

          <AppButton
            variant="secondary"
            size="large"
            onPress={handleClose}
            accessibilityLabel={t('confirmPasswordEmail.close')}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-2">
              <AppText className="text-slate-300 font-medium text-base">
                {t('confirmPasswordEmail.close')}
              </AppText>
              <MaterialCommunityIcons name="close" size={16} color="#CBD5E1" />
            </View>
          </AppButton>
        </View>
      </View>
    </ScreenLayout>
  );
}
