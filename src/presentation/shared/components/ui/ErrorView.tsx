import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from './AppText';

interface ErrorViewProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ message, onRetry }) => {
  return (
    <View className="flex-1 items-center justify-center p-6">
      <AppText className="text-red-500 text-center text-lg mb-4">
        {message ?? 'Something went wrong'}
      </AppText>
      {onRetry && (
        <Pressable
          onPress={onRetry}
          className="bg-indigo-500 px-6 py-3 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Retry"
        >
          <AppText className="text-white font-semibold">Retry</AppText>
        </Pressable>
      )}
    </View>
  );
};
