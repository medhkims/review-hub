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
