import { useState, useEffect, useCallback } from 'react';
import { FaqEntity } from '@/domain/faq/entities/faqEntity';
import { container } from '@/core/di/container';

interface UseAdminFaqState {
  faqs: FaqEntity[];
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  createFaq: (question: string, answer: string, order: number) => Promise<boolean>;
  updateFaq: (id: string, question: string, answer: string, order: number) => Promise<boolean>;
  deleteFaq: (id: string) => Promise<boolean>;
  refetch: () => void;
}

export const useAdminFaq = (): UseAdminFaqState => {
  const [faqs, setFaqs] = useState<FaqEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getAdminFaqsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setFaqs(data),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const createFaq = useCallback(async (question: string, answer: string, order: number): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    const result = await container.createFaqUseCase.execute(question, answer, order);
    let success = false;
    result.fold(
      (failure) => setError(failure.message),
      (created) => {
        setFaqs((prev) => [...prev, created].sort((a, b) => a.order - b.order));
        success = true;
      },
    );
    setIsSaving(false);
    return success;
  }, []);

  const updateFaq = useCallback(async (id: string, question: string, answer: string, order: number): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    const result = await container.updateFaqUseCase.execute(id, question, answer, order);
    let success = false;
    result.fold(
      (failure) => setError(failure.message),
      (updated) => {
        setFaqs((prev) => prev.map((f) => (f.id === id ? updated : f)).sort((a, b) => a.order - b.order));
        success = true;
      },
    );
    setIsSaving(false);
    return success;
  }, []);

  const deleteFaq = useCallback(async (id: string): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    const result = await container.deleteFaqUseCase.execute(id);
    let success = false;
    result.fold(
      (failure) => setError(failure.message),
      () => {
        setFaqs((prev) => prev.filter((f) => f.id !== id));
        success = true;
      },
    );
    setIsSaving(false);
    return success;
  }, []);

  return { faqs, isLoading, isSaving, error, createFaq, updateFaq, deleteFaq, refetch: fetchFaqs };
};
