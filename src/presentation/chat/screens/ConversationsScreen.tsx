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
