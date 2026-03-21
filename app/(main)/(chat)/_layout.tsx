import React from 'react';
import { Stack } from 'expo-router';

export default function ChatLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="admin-business" />
      <Stack.Screen name="admin-moderator" />
      <Stack.Screen name="[conversationId]" />
    </Stack>
  );
}
