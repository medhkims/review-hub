import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';

export default function NotFoundScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <AppText className="text-2xl font-bold mb-4">404 — Not Found</AppText>
      <Pressable
        onPress={() => router.replace('/')}
        className="bg-indigo-500 px-6 py-3 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Go home"
      >
        <AppText className="text-white font-semibold">Go Home</AppText>
      </Pressable>
    </View>
  );
}
