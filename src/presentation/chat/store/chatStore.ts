import { create } from 'zustand';
import { ConversationEntity } from '@/domain/chat/entities/conversationEntity';
import { MessageEntity } from '@/domain/chat/entities/messageEntity';

interface ChatState {
  conversations: ConversationEntity[];
  messages: MessageEntity[];
  isLoading: boolean;
  error: string | null;
  setConversations: (conversations: ConversationEntity[]) => void;
  setMessages: (messages: MessageEntity[]) => void;
  addMessage: (message: MessageEntity) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  conversations: [],
  messages: [],
  isLoading: false,
  error: null,
  setConversations: (conversations) => set({ conversations, error: null }),
  setMessages: (messages) => set({ messages, error: null }),
  addMessage: (message) =>
    set((state) => ({
      messages: state.messages.some((m) => m.id === message.id)
        ? state.messages.map((m) => (m.id === message.id ? message : m))
        : [...state.messages, message],
    })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ conversations: [], messages: [], isLoading: false, error: null }),
}));
