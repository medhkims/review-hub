import { useCallback, useRef } from 'react';
import { useReviewStore } from '../store/reviewStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { CreateReviewInput } from '@/domain/reviews/entities/createReviewInput';
import { SelectedPhoto } from '../components/PhotoPicker';
import { container } from '@/core/di/container';

export const useWriteReview = (businessId: string, businessName: string) => {
  const { isSubmitting, submitSuccess, submittedReviewId, error, setSubmitting, setSubmitSuccess, setError, reset } =
    useReviewStore();
  const { user } = useAuthStore();
  const inFlightRef = useRef(false);

  const submitReview = useCallback(
    async (ratings: Record<string, number>, reviewText: string, photos: SelectedPhoto[]) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      if (!user) {
        setError('You must be signed in to submit a review');
        inFlightRef.current = false;
        return;
      }

      setSubmitting(true);
      setError(null);

      // Upload photos to Firebase Storage first
      let photoUrls: string[] = [];
      if (photos.length > 0) {
        try {
          photoUrls = await Promise.all(
            photos.map((photo) =>
              container.reviewImageDataSource.uploadReviewImage(user.id, photo.uri, photo.mimeType),
            ),
          );
        } catch {
          setError('Failed to upload one or more photos. Please try again.');
          setSubmitting(false);
          inFlightRef.current = false;
          return;
        }
      }

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

      const result = await container.createReviewUseCase.execute(user.id, input);

      result.fold(
        (failure) => {
          setError(failure.message);
          setSubmitting(false);
          inFlightRef.current = false;
        },
        (reviewId) => {
          setSubmitSuccess(true, reviewId);
          setSubmitting(false);
          inFlightRef.current = false;
        },
      );
    },
    [user, businessId, businessName, setSubmitting, setError, setSubmitSuccess],
  );

  return {
    isSubmitting,
    submitSuccess,
    submittedReviewId,
    error,
    submitReview,
    reset,
  };
};
