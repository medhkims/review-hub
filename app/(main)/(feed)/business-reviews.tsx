import { useLocalSearchParams } from 'expo-router';
import BusinessReviewsScreen from '@/presentation/businessDetail/screens/BusinessReviewsScreen';

export default function BusinessReviewsRoute() {
  const { businessId, businessName } = useLocalSearchParams<{ businessId: string; businessName: string }>();
  return <BusinessReviewsScreen businessId={businessId ?? ''} businessName={businessName ?? ''} />;
}
