import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();

  return (
    <ScreenLayout>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Post: {postId}</AppText>
        {/* TODO: Implement post detail */}
      </View>
    </ScreenLayout>
  );
}
