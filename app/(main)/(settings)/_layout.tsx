import React from 'react';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="manage-banners" />
      <Stack.Screen name="media-control" />
      <Stack.Screen name="category-defaults" />
      <Stack.Screen name="admin-info" />
    </Stack>
  );
}
