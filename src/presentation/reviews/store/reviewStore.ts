import { create } from 'zustand';

interface ReviewState {
  isSubmitting: boolean;
  submitSuccess: boolean;
  error: string | null;
  setSubmitting: (v: boolean) => void;
  setSubmitSuccess: (v: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  isSubmitting: false,
  submitSuccess: false,
  error: null,
  setSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitSuccess: (submitSuccess) => set({ submitSuccess }),
  setError: (error) => set({ error, isSubmitting: false }),
  reset: () =>
    set({
      isSubmitting: false,
      submitSuccess: false,
      error: null,
    }),
}));
