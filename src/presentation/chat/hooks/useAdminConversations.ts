import { useCallback, useEffect, useState } from 'react';
import { ConversationEntity, ConversationType } from '@/domain/chat/entities/conversationEntity';
import { ChatRemoteDataSourceImpl } from '@/data/chat/datasources/chatRemoteDataSource';
import { ChatLocalDataSourceImpl } from '@/data/chat/datasources/chatLocalDataSource';
import { ChatRepositoryImpl } from '@/data/chat/repositories/chatRepositoryImpl';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
import { GetConversationsByTypeUseCase } from '@/domain/chat/usecases/getConversationsByTypeUseCase';

const remote = new ChatRemoteDataSourceImpl();
const local = new ChatLocalDataSourceImpl();
const network = new NetworkInfoImpl();
const repo = new ChatRepositoryImpl(remote, local, network);
const getConversationsByTypeUseCase = new GetConversationsByTypeUseCase(repo);

export const useAdminConversations = (type: ConversationType) => {
  const [conversations, setConversations] = useState<ConversationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const result = await getConversationsByTypeUseCase.execute(type);

    result.fold(
      (failure) => {
        setError(failure.message);
        setIsLoading(false);
      },
      (fetched) => {
        setConversations(fetched);
        setIsLoading(false);
      },
    );
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  return { conversations, isLoading, error, refresh: load };
};
