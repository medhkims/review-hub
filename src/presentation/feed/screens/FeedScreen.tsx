import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function FeedScreen() {
  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-2xl font-bold">Feed</AppText>
        <AppText className="text-gray-500 mt-2">No posts yet</AppText>
      </View>
    </ScreenLayout>
  );
}
