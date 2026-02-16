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
