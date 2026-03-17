import React from 'react';
import { Stack } from 'expo-router';

export default function InsightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="engagement-details" />
      <Stack.Screen name="boost-history" />
      <Stack.Screen name="top-menu-items" />
      <Stack.Screen name="search-keywords" />
    </Stack>
  );
}
