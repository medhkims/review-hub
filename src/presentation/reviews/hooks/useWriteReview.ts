import { useCallback } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { CreateReviewInput } from '@/domain/reviews/entities/createReviewInput';

// TODO: Use container use cases when wired in DI container
import { ReviewRemoteDataSourceImpl } from '@/data/reviews/datasources/reviewRemoteDataSource';
import { ReviewRepositoryImpl } from '@/data/reviews/repositories/reviewRepositoryImpl';
import { CreateReviewUseCase } from '@/domain/reviews/usecases/createReviewUseCase';

const reviewRemote = new ReviewRemoteDataSourceImpl();
const reviewRepo = new ReviewRepositoryImpl(reviewRemote);
const createReviewUseCase = new CreateReviewUseCase(reviewRepo);

export const useWriteReview = (businessId: string, businessName: string) => {
  const { isSubmitting, submitSuccess, error, setSubmitting, setSubmitSuccess, setError, reset } =
    useReviewStore();
  const { user } = useAuthStore();

  const submitReview = useCallback(
    async (ratings: Record<string, number>, reviewText: string, photoUrls: string[]) => {
      if (!user) {
        setError('You must be signed in to submit a review');
        return;
      }

      setSubmitting(true);
      setError(null);

      const ratingValues = Object.values(ratings);
      const overallRating =
        ratingValues.length > 0
          ? Math.round((ratingValues.reduce((sum, r) => sum + r, 0) / ratingValues.length) * 10) / 10
          : 0;

      const input: CreateReviewInput = {
        businessId,
        businessName,
        ratings,
        overallRating,
        reviewText,
        photoUrls,
      };

      const result = await createReviewUseCase.execute(user.id, input);

      result.fold(
        (failure) => {
          setError(failure.message);
          setSubmitting(false);
        },
        (_reviewId) => {
          setSubmitSuccess(true);
          setSubmitting(false);
        },
      );
    },
    [user, businessId, businessName, setSubmitting, setError, setSubmitSuccess],
  );

  return {
    isSubmitting,
    submitSuccess,
    error,
    submitReview,
    reset,
  };
};
