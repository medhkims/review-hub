import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import BusinessDetailScreen from '@/presentation/businessDetail/screens/BusinessDetailScreen';

export default function BusinessDetailRoute() {
  const { businessId } = useLocalSearchParams<{ businessId: string }>();

  return <BusinessDetailScreen businessId={businessId} />;
}
