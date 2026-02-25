import React from 'react';
import { View } from 'react-native';
import { AppText } from './ui/AppText';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export const NetworkBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();

  if (isConnected) return null;

  return (
    <View className="bg-red-500 py-2 px-4 items-center">
      <AppText className="text-white text-sm font-medium">
        You are offline
      </AppText>
    </View>
  );
};
