import React, { useCallback } from 'react';
import {
  View,
  FlatList,
  Pressable,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useAdminConversations } from '@/presentation/chat/hooks/useAdminConversations';
import { ConversationEntity } from '@/domain/chat/entities/conversationEntity';
import { colors } from '@/core/theme/colors';

// ---- Helpers ----------------------------------------------------------------

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ---- Conversation Card ------------------------------------------------------

interface ConversationCardProps {
  conversation: ConversationEntity;
  onPress: (conversationId: string) => void;
}

const ConversationCard = React.memo(({ conversation, onPress }: ConversationCardProps) => {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <Pressable
      onPress={() => onPress(conversation.id)}
      className="flex-row items-center px-5 py-3.5 active:bg-slate-800/50"
      accessibilityLabel={`Moderator conversation: ${conversation.lastMessage}`}
      accessibilityRole="button"
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center shrink-0"
        style={{ backgroundColor: colors.cardDark, borderWidth: 1, borderColor: colors.borderDark }}
      >
        <MaterialCommunityIcons name="shield-account" size={24} color="#22d3ee" />
      </View>

      <View className="flex-1 ml-3 min-w-0">
        <View className="flex-row items-center justify-between">
          <AppText
            className="font-semibold text-sm flex-1 mr-2"
            style={{
              color: hasUnread ? colors.textWhite : colors.textSlate200,
              fontSize: 15,
              fontWeight: hasUnread ? '700' : '600',
            }}
            numberOfLines={1}
          >
            {`Moderator ${conversation.id.slice(0, 6)}`}
          </AppText>
          <AppText
            className="text-xs shrink-0"
            style={{ color: hasUnread ? colors.neonPurple : colors.textSlate500, fontSize: 12 }}
          >
            {formatTimestamp(conversation.lastMessageAt)}
          </AppText>
        </View>

        <View className="flex-row items-center justify-between mt-0.5">
          <AppText
            className="text-sm flex-1 mr-2"
            style={{
              color: hasUnread ? colors.textSlate200 : colors.textSlate500,
              fontSize: 13,
              fontWeight: hasUnread ? '500' : '400',
            }}
            numberOfLines={1}
          >
            {conversation.lastMessage || 'No messages yet'}
          </AppText>

          {hasUnread && (
            <View
              className="rounded-full items-center justify-center shrink-0"
              style={{
                backgroundColor: colors.neonPurple,
                minWidth: 20,
                height: 20,
                paddingHorizontal: 6,
              }}
            >
              <AppText
                style={{ fontSize: 11, color: colors.textWhite, fontWeight: '700' }}
              >
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </AppText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
});

ConversationCard.displayName = 'ConversationCard';

// ---- Empty State ------------------------------------------------------------

const EmptyState = () => (
  <View className="flex-1 items-center justify-center px-8 py-16">
    <MaterialCommunityIcons name="shield-account-outline" size={64} color={colors.borderDark} />
    <AppText
      className="font-bold text-lg mt-4 text-center"
      style={{ color: colors.textWhite, fontSize: 18, fontWeight: '700' }}
    >
      No moderator conversations
    </AppText>
    <AppText
      className="text-sm mt-2 text-center leading-relaxed"
      style={{ color: colors.textSlate400, fontSize: 14 }}
    >
      Moderator conversations will appear here
    </AppText>
  </View>
);

// ---- AdminModeratorChatScreen -----------------------------------------------

export default function AdminModeratorChatScreen() {
  const router = useRouter();
  const { conversations, isLoading, error, refresh } = useAdminConversations('moderator');

  const handleConversationPress = useCallback(
    (conversationId: string) => {
      router.push(`/(main)/(chat)/${conversationId}`);
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ConversationEntity>) => (
      <ConversationCard conversation={item} onPress={handleConversationPress} />
    ),
    [handleConversationPress],
  );

  const keyExtractor = useCallback((item: ConversationEntity) => item.id, []);

  const renderSeparator = useCallback(
    () => (
      <View
        style={{
          height: 1,
          backgroundColor: colors.borderDark,
          marginLeft: 72,
          opacity: 0.3,
        }}
      />
    ),
    [],
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          className="p-1 rounded-full mr-3"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textWhite} />
        </Pressable>

        <View
          className="w-9 h-9 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: colors.cardDark, borderWidth: 1, borderColor: '#22d3ee' }}
        >
          <MaterialCommunityIcons name="shield-account" size={18} color="#22d3ee" />
        </View>

        <AppText
          style={{
            flex: 1,
            color: colors.textWhite,
            fontSize: 17,
            fontWeight: '700',
          }}
        >
          Moderator Chats
        </AppText>
      </View>

      {isLoading && conversations.length === 0 ? (
        <LoadingIndicator />
      ) : error && conversations.length === 0 ? (
        <ErrorView message={error} onRetry={refresh} />
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ItemSeparatorComponent={renderSeparator}
          ListEmptyComponent={<EmptyState />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            conversations.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refresh}
              tintColor={colors.neonPurple}
              colors={[colors.neonPurple]}
            />
          }
        />
      )}
    </ScreenLayout>
  );
}
