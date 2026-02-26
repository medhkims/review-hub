// TODO: Use container.getConversationsUseCase when wired in DI container

import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { ChatRemoteDataSourceImpl } from '@/data/chat/datasources/chatRemoteDataSource';
import { ChatLocalDataSourceImpl } from '@/data/chat/datasources/chatLocalDataSource';
import { ChatRepositoryImpl } from '@/data/chat/repositories/chatRepositoryImpl';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
import { GetConversationsUseCase } from '@/domain/chat/usecases/getConversationsUseCase';

const remote = new ChatRemoteDataSourceImpl();
const local = new ChatLocalDataSourceImpl();
const network = new NetworkInfoImpl();
const repo = new ChatRepositoryImpl(remote, local, network);
const getConversationsUseCase = new GetConversationsUseCase(repo);

export const useConversations = () => {
  useAnalyticsScreen(AnalyticsScreens.CONVERSATIONS);

  const { conversations, isLoading, error, setConversations, setLoading, setError } =
    useChatStore();

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getConversationsUseCase.execute();

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
