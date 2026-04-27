import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { container } from '@/core/di/container';

export const useConversations = () => {
  useAnalyticsScreen(AnalyticsScreens.CONVERSATIONS);

  const { conversations, isLoading, error, setConversations, setLoading, setError } =
    useChatStore();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await container.getConversationsUseCase.execute();

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (fetchedConversations) => {
        setConversations(fetchedConversations);
        setLoading(false);
      },
    );
  }, [setLoading, setError, setConversations]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    refresh: loadConversations,
  };
};
