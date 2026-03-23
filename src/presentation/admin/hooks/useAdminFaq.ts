import { useState, useEffect, useCallback } from 'react';
import { FaqAudience, FaqEntity } from '@/domain/faq/entities/faqEntity';
import { container } from '@/core/di/container';
import { FAQ_SEED_DATA } from '@/core/utils/faqSeedData';

interface UseAdminFaqState {
  faqs: FaqEntity[];
  isLoading: boolean;
  isSaving: boolean;
  isSeeding: boolean;
  error: string | null;
  createFaq: (question: string, answer: string, order: number, audience: FaqAudience[]) => Promise<boolean>;
  updateFaq: (id: string, question: string, answer: string, order: number, audience: FaqAudience[]) => Promise<boolean>;
  deleteFaq: (id: string) => Promise<boolean>;
  seedDefaultFaqs: () => Promise<void>;
  refetch: () => void;
}

export const useAdminFaq = (): UseAdminFaqState => {
  const [faqs, setFaqs] = useState<FaqEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
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

  const createFaq = useCallback(async (question: string, answer: string, order: number, audience: FaqAudience[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    const result = await container.createFaqUseCase.execute(question, answer, order, audience);
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

  const updateFaq = useCallback(async (id: string, question: string, answer: string, order: number, audience: FaqAudience[]): Promise<boolean> => {
    setIsSaving(true);
    setError(null);
    const result = await container.updateFaqUseCase.execute(id, question, answer, order, audience);
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

  const seedDefaultFaqs = useCallback(async () => {
    setIsSeeding(true);
    setError(null);
    for (const item of FAQ_SEED_DATA) {
      await container.createFaqUseCase.execute(item.question, item.answer, item.order, item.audiences);
    }
    await fetchFaqs();
    setIsSeeding(false);
  }, [fetchFaqs]);

  return { faqs, isLoading, isSaving, isSeeding, error, createFaq, updateFaq, deleteFaq, seedDefaultFaqs, refetch: fetchFaqs };
};
