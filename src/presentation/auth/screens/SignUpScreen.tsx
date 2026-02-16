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
