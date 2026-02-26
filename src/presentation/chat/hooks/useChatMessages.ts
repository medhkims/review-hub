// TODO: Use container use cases when wired in DI container

import { useCallback, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { ChatRemoteDataSourceImpl } from '@/data/chat/datasources/chatRemoteDataSource';
import { ChatLocalDataSourceImpl } from '@/data/chat/datasources/chatLocalDataSource';
import { ChatRepositoryImpl } from '@/data/chat/repositories/chatRepositoryImpl';
import { NetworkInfoImpl } from '@/core/network/networkInfo';
import { GetMessagesUseCase } from '@/domain/chat/usecases/getMessagesUseCase';
import { SendMessageUseCase } from '@/domain/chat/usecases/sendMessageUseCase';
import { useAuthStore } from '@/presentation/auth/store/authStore';

const remote = new ChatRemoteDataSourceImpl();
const local = new ChatLocalDataSourceImpl();
const network = new NetworkInfoImpl();
const repo = new ChatRepositoryImpl(remote, local, network);
const getMessagesUseCase = new GetMessagesUseCase(repo);
const sendMessageUseCase = new SendMessageUseCase(repo);

export const useChatMessages = (conversationId: string) => {
  const { messages, isLoading, error, setMessages, addMessage, setLoading, setError } =
    useChatStore();
  const { user } = useAuthStore();

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await getMessagesUseCase.execute(conversationId);

    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      (fetchedMessages) => {
        setMessages(fetchedMessages);
        setLoading(false);
      },
    );
  }, [conversationId, setLoading, setError, setMessages]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user?.id) return;

      // Optimistic message with pending state
      const optimisticId = `pending_${Date.now()}`;
      const optimisticMessage = {
        id: optimisticId,
        conversationId,
        senderId: user.id,
        text,
        createdAt: new Date(),
        isPending: true,
      };

      addMessage(optimisticMessage);

      const result = await sendMessageUseCase.execute(conversationId, text);

      result.fold(
        (failure) => {
          // Remove the optimistic message on failure using store state directly
          useChatStore.setState((state) => ({
            messages: state.messages.filter((m) => m.id !== optimisticId),
          }));
          setError(failure.message);
        },
        (sentMessage) => {
          // Replace the optimistic message with the real one
          useChatStore.setState((state) => ({
            messages: state.messages
              .filter((m) => m.id !== optimisticId)
              .concat([{ ...sentMessage, isPending: false }]),
          }));
        },
      );
    },
    [conversationId, user?.id, addMessage, setError],
  );

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
};
