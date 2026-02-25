import React from 'react';
import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="[postId]" />
      <Stack.Screen name="business/[businessId]" />
    </Stack>
  );
}
