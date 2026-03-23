import { useLocalSearchParams } from 'expo-router';
import BusinessReviewsScreen from '@/presentation/businessDetail/screens/BusinessReviewsScreen';

export default function BusinessReviewsRoute() {
  const { businessId, businessName, businessLogoUrl } = useLocalSearchParams<{
    businessId: string;
    businessName: string;
    businessLogoUrl?: string;
  }>();
  return (
    <BusinessReviewsScreen
      businessId={businessId ?? ''}
      businessName={businessName ?? ''}
      businessLogoUrl={businessLogoUrl ?? null}
    />
  );
}
