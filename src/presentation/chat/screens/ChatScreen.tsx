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
  return (
    <View
      className={`mb-2 px-4 ${isOwnMessage ? 'items-end' : 'items-start'}`}
    >
      {!isOwnMessage && (
        <AppText
          className="text-xs mb-1 ml-1"
          style={{ color: colors.textSlate500, fontSize: 11 }}
        >
          {message.senderId.slice(0, 8)}
        </AppText>
      )}

      <View
        className="rounded-2xl px-4 py-2.5 max-w-[80%]"
        style={{
          backgroundColor: isOwnMessage ? colors.neonPurple : colors.cardDark,
          borderBottomRightRadius: isOwnMessage ? 4 : 16,
          borderBottomLeftRadius: isOwnMessage ? 16 : 4,
          opacity: message.isPending ? 0.6 : 1,
        }}
      >
        <AppText
          className="text-sm"
          style={{
            color: isOwnMessage ? colors.textWhite : colors.textSlate100,
            fontSize: 15,
          }}
        >
          {message.text}
        </AppText>
      </View>

      <View className={`flex-row items-center mt-0.5 ${isOwnMessage ? 'mr-1' : 'ml-1'}`}>
        <AppText
          className="text-xs"
          style={{ color: colors.textSlate500, fontSize: 10 }}
        >
          {formatMessageTime(message.createdAt)}
        </AppText>
        {message.isPending && (
          <AppText
            className="text-xs ml-1"
            style={{ color: colors.textSlate500, fontSize: 10 }}
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
      style={{ borderTopColor: colors.borderDark, backgroundColor: colors.midnight }}
    >
      <View
        className="flex-1 flex-row items-end rounded-2xl px-4 min-h-[44px]"
        style={{
          backgroundColor: colors.cardDark,
          borderWidth: 1,
          borderColor: colors.borderDark,
        }}
      >
        <TextInput
          ref={inputRef}
          value={text}
          onChangeText={setText}
          placeholder="Type a message..."
          placeholderTextColor={colors.textSlate500}
          multiline
          maxLength={2000}
          className="flex-1 py-2.5"
          style={{
            color: colors.textWhite,
            fontSize: 15,
            maxHeight: 100,
          }}
          accessibilityLabel="Message input"
        />
      </View>

      <Pressable
        onPress={handleSend}
        disabled={!text.trim()}
        className="ml-2 w-11 h-11 rounded-full items-center justify-center"
        style={{
          backgroundColor: text.trim() ? colors.neonPurple : colors.cardDark,
          opacity: text.trim() ? 1 : 0.5,
        }}
        accessibilityLabel="Send message"
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name="send"
          size={20}
          color={text.trim() ? colors.textWhite : colors.textSlate500}
        />
      </Pressable>
    </View>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

// ---- Empty Messages State ---------------------------------------------------

const EmptyMessages = () => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <MaterialCommunityIcons name="message-text-outline" size={48} color={colors.borderDark} />
      <AppText
        className="font-semibold mt-3 text-center"
        style={{ color: colors.textSlate400, fontSize: 15 }}
      >
        No messages yet
      </AppText>
      <AppText
        className="text-sm mt-1 text-center"
        style={{ color: colors.textSlate500, fontSize: 13 }}
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
          style={{ borderBottomColor: colors.borderDark }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textWhite} />
          </Pressable>
          <AppText
            className="font-semibold flex-1"
            style={{ color: colors.textWhite, fontSize: 17, fontWeight: '600' }}
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
          style={{ borderBottomColor: colors.borderDark }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textWhite} />
          </Pressable>
          <AppText
            className="font-semibold flex-1"
            style={{ color: colors.textWhite, fontSize: 17, fontWeight: '600' }}
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
          style={{ borderBottomColor: colors.borderDark }}
        >
          <Pressable
            onPress={() => router.back()}
            className="p-1 rounded-full mr-2"
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textWhite} />
          </Pressable>

          <View
            className="w-9 h-9 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: colors.cardDark, borderWidth: 1, borderColor: colors.borderDark }}
          >
            <MaterialCommunityIcons name="account" size={18} color={colors.textSlate400} />
          </View>

          <AppText
            className="font-semibold flex-1"
            style={{ color: colors.textWhite, fontSize: 17, fontWeight: '600' }}
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
            inverted
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: 'column-reverse',
              paddingVertical: 12,
            }}
          />
        )}

        {/* Input */}
        <MessageInputBar onSend={handleSend} />
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
};

export default ChatScreen;
