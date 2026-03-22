import { useState, useEffect, useCallback } from 'react';
import { FaqEntity } from '@/domain/faq/entities/faqEntity';
import { container } from '@/core/di/container';

interface UseFaqState {
  faqs: FaqEntity[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useFaq = (): UseFaqState => {
  const [faqs, setFaqs] = useState<FaqEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await container.getFaqsUseCase.execute();
    result.fold(
      (failure) => setError(failure.message),
      (data) => setFaqs(data),
    );
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  return { faqs, isLoading, error, refetch: fetchFaqs };
};
