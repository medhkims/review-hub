import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';

export default function ConversationsScreen() {
  useAnalyticsScreen(AnalyticsScreens.CONVERSATIONS);
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">Chat</AppText>
        <AppText className="text-gray-500 mt-2">No conversations yet</AppText>
      </View>
    </ScreenLayout>
  );
}
