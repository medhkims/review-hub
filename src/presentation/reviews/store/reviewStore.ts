import { create } from 'zustand';

interface ReviewState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  submittedReviewId: string | null;
  error: string | null;
  setSubmitting: (v: boolean) => void;
  setSubmitSuccess: (v: boolean, reviewId?: string) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  isSubmitting: false,
  submitSuccess: false,
  submittedReviewId: null,
  error: null,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitSuccess: (submitSuccess, reviewId) =>
    set({ submitSuccess, submittedReviewId: reviewId ?? null }),
  setError: (error) => set({ error, isSubmitting: false }),
  reset: () =>
    set({
      isSubmitting: false,
      submitSuccess: false,
      submittedReviewId: null,
      error: null,
    }),
}));
