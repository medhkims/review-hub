import { useLocalSearchParams } from 'expo-router';
import ReviewDetailScreen, { SerializedReview } from '@/presentation/businessDetail/screens/ReviewDetailScreen';

export default function ReviewDetailRoute() {
  const { reviewId, businessName, businessId, reviewData, from } = useLocalSearchParams<{
    reviewId: string;
    businessName: string;
    businessId?: string;
    reviewData: string;
    from?: string;
  }>();

  let initialReview: SerializedReview | null = null;
  if (reviewData) {
    try {
      initialReview = JSON.parse(reviewData) as SerializedReview;
    } catch {
      // ignore parse errors
    }
  }

  const backHref = from === 'my-reviews' ? '/(main)/(reviews)' : undefined;
  const resolvedBusinessId = businessId ?? initialReview?.businessId ?? '';

  return (
    <ReviewDetailScreen
      reviewId={reviewId ?? ''}
      businessName={businessName ?? ''}
      businessId={resolvedBusinessId}
      initialReview={initialReview}
      backHref={backHref}
    />
  );
}
