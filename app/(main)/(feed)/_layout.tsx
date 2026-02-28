import React from 'react';
import { Stack } from 'expo-router';

export default function FeedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="categories" />
      <Stack.Screen name="[postId]" />
      <Stack.Screen name="business/[businessId]" />
      <Stack.Screen name="write-review" />
      <Stack.Screen name="add-business" />
      <Stack.Screen name="location-search" />
      <Stack.Screen name="category-selection" />
      <Stack.Screen name="sub-category" />
      <Stack.Screen name="business-insights" />
      <Stack.Screen name="all-businesses" />
    </Stack>
  );
}
