import { useLocalSearchParams } from 'expo-router';
import ReviewDetailScreen, { SerializedReview } from '@/presentation/businessDetail/screens/ReviewDetailScreen';

export default function ReviewDetailRoute() {
  const { reviewId, businessName, reviewData, from } = useLocalSearchParams<{
    reviewId: string;
    businessName: string;
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

  return (
    <ReviewDetailScreen
      reviewId={reviewId ?? ''}
      businessName={businessName ?? ''}
      initialReview={initialReview}
      backHref={backHref}
    />
  );
}
