import React from 'react';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="change-email" />
      <Stack.Screen name="change-password" />
      <Stack.Screen name="add-email-for-password" />
      <Stack.Screen name="confirm-password-email" />
    </Stack>
  );
}
