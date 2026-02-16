import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function ChatScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();

  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Chat: {conversationId}</AppText>
        {/* TODO: Implement chat UI */}
      </View>
    </ScreenLayout>
  );
}
