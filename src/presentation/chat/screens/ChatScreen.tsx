import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  TextInput,
  ListRenderItemInfo,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useChatMessages } from '../hooks/useChatMessages';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { MessageEntity } from '@/domain/chat/entities/messageEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

// ---- Helpers ----------------------------------------------------------------

const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ---- Message Bubble ---------------------------------------------------------

interface MessageBubbleProps {
  message: MessageEntity;
  isOwnMessage: boolean;
}

const MessageBubble = React.memo(({ message, isOwnMessage }: MessageBubbleProps) => {
  const theme = useTheme();
  return (
    <View
      className={`mb-2 px-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      {!isOwnMessage && (
        <AppText
          className="text-xs mb-1 ml-1"
          style={{ color: theme.textMuted, fontSize: 11 }}
        >
          {message.senderId.slice(0, 8)}
        </AppText>
      )}

      <View
        className="rounded-2xl px-4 py-2.5 max-w-[80%]"
        style={{
          backgroundColor: isOwnMessage ? colors.neonPurple : theme.card,
          borderBottomRightRadius: isOwnMessage ? 4 : 16,
          borderBottomLeftRadius: isOwnMessage ? 16 : 4,
          opacity: message.isPending ? 0.6 : 1,
        }}
      >
        <AppText
          className="text-sm"
          style={{
            color: isOwnMessage ? '#FFFFFF' : theme.text,
            fontSize: 15,
          }}
        >
          {message.text}
        </AppText>
      </View>

      <View className={`flex-row items-center mt-0.5 ${isOwnMessage ? 'mr-1' : 'ml-1'}`}>
        <AppText
          className="text-xs"
          style={{ color: theme.textMuted, fontSize: 10 }}
        >
          {formatMessageTime(message.createdAt)}
        </AppText>
        {message.isPending && (
          <AppText
            className="text-xs ml-1"
            style={{ color: theme.textMuted, fontSize: 10 }}
          >
            Sending...
          </AppText>
        )}
      </View>
    </View>
  );
});

MessageBubble.displayName = 'MessageBubble';

// ---- Message Input ----------------------------------------------------------

interface MessageInputBarProps {
  onSend: (text: string) => void;
}

const MessageInputBar = React.memo(({ onSend }: MessageInputBarProps) => {
  const theme = useTheme();
  const [text, setText] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  }, [text, onSend]);

  return (
    <View
      className="flex-row items-end px-4 py-3 border-t"
      style={{ borderTopColor: theme.border, backgroundColor: theme.background }}
    >
      <View
        className="flex-1 flex-row items-end rounded-2xl px-4 min-h-[44px]"
        style={{
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
        }}
      >
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={2000}
          className="flex-1 py-2.5"
          style={{
            color: theme.text,
            fontSize: 15,
            maxHeight: 100,
          }}
          accessibilityLabel="Message input"
          onSubmitEditing={Platform.OS === 'web' ? handleSend : undefined}
          blurOnSubmit={Platform.OS === 'web'}
          returnKeyType="send"
        />
      </View>

      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        className="ml-2 w-11 h-11 rounded-full items-center justify-center"
        style={{
          backgroundColor: text.trim() ? colors.neonPurple : theme.card,
          opacity: text.trim() ? 1 : 0.5,
        }}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="send"
          size={20}
          color={text.trim() ? '#FFFFFF' : theme.textMuted}
        />
      </Pressable>
    </View>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

// ---- Empty Messages State ---------------------------------------------------

const EmptyMessages = () => {
  const theme = useTheme();
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MaterialCommunityIcons name="message-text-outline" size={48} color={theme.border} />
      <AppText
        className="font-semibold mt-3 text-center"
        style={{ color: theme.textSecondary, fontSize: 15 }}
      >
        No messages yet
      </AppText>
      <AppText
        className="text-sm mt-1 text-center"
        style={{ color: theme.textMuted, fontSize: 13 }}
      >
        Send a message to start the conversation
      </AppText>
    </View>
  );
};

// ---- ChatScreen -------------------------------------------------------------

interface ChatScreenProps {
  conversationId: string;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ conversationId }) => {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthStore();
  const { messages, isLoading, error, sendMessage } = useChatMessages(conversationId);
  const flatListRef = useRef<FlatList<MessageEntity>>(null);

  const currentUserId = user?.id;

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MessageEntity>) => (
      <MessageBubble
        message={item}
        isOwnMessage={item.senderId === currentUserId}
      />
    ),
    [currentUserId],
  );

  const keyExtractor = useCallback(
    (item: MessageEntity) => item.id,
    [],
  );

  const handleSend = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage],
  );

  if (isLoading && messages.length === 0) {
    return (
      <ScreenLayout>
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
          </Pressable>
          <AppText
            className="font-semibold flex-1"
            style={{ color: theme.text, fontSize: 17, fontWeight: '600' }}
            numberOfLines={1}
          >
            Chat
          </AppText>
        </View>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error && messages.length === 0) {
    return (
      <ScreenLayout>
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
          </Pressable>
          <AppText
            className="font-semibold flex-1"
            style={{ color: theme.text, fontSize: 17, fontWeight: '600' }}
            numberOfLines={1}
          >
            Chat
          </AppText>
        </View>
        <ErrorView message={error} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      <KeyboardAvoidingView
        className="flex-1"
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View
          className="flex-row items-center px-4 py-3 border-b"
          style={{ borderBottomColor: theme.border }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
          </Pressable>

          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
          >
            <MaterialCommunityIcons name="account" size={18} color={theme.textSecondary} />
          </View>

          <AppText
            className="font-semibold flex-1"
            style={{ color: theme.text, fontSize: 17, fontWeight: '600' }}
            numberOfLines={1}
          >
            Chat {conversationId.slice(0, 6)}
          </AppText>
        </View>

        {/* Messages */}
        {messages.length === 0 ? (
          <EmptyMessages />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            inverted={Platform.OS !== 'web'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              ...(Platform.OS === 'web'
                ? { flexDirection: 'column-reverse' as const }
                : { flexDirection: 'column-reverse' as const }),
              paddingVertical: 12,
            }}
            {...(Platform.OS === 'web' ? { style: { transform: [{ scaleY: -1 }] } } : {})}
          />
        )}

        {/* Input */}
        <MessageInputBar onSend={handleSend} />
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

export default ChatScreen;
