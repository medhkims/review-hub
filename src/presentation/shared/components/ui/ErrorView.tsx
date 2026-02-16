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
