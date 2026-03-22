import React, { useCallback, useState } from 'react';
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
import { AdminMenuButton } from '@/presentation/admin/components/AdminMenuButton';
import { useConversations } from '../hooks/useConversations';
import { useAdminConversations } from '../hooks/useAdminConversations';
import { ConversationEntity, ConversationType } from '@/domain/chat/entities/conversationEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useRoleStore } from '@/presentation/auth/store/roleStore';

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

const ConversationCard = React.memo(
  ({ conversation, onPress }: ConversationCardProps) => {
    const theme = useTheme();
    const hasUnread = conversation.unreadCount > 0;

    return (
      <Pressable
        onPress={() => onPress(conversation.id)}
        className="flex-row items-center px-5 py-3.5 active:bg-slate-800/50"
        accessibilityLabel={`Conversation with last message: ${conversation.lastMessage}`}
        accessibilityRole="button"
      >
        <View
          className="w-12 h-12 rounded-full items-center justify-center shrink-0"
          style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }}
        >
          <MaterialCommunityIcons name="account" size={24} color={theme.textSecondary} />
        </View>

        <View className="flex-1 ml-3 min-w-0">
          <View className="flex-row items-center justify-between">
            <AppText
              className="font-semibold text-sm flex-1 mr-2"
              style={{
                color: hasUnread ? theme.text : theme.textSecondary,
                fontSize: 15,
                fontWeight: hasUnread ? '700' : '600',
              }}
              numberOfLines={1}
            >
              {conversation.participantIds.length > 0
                ? `Chat ${conversation.id.slice(0, 6)}`
                : 'Unknown'}
            </AppText>
            <AppText
              className="text-xs shrink-0"
              style={{ color: hasUnread ? colors.neonPurple : theme.textMuted, fontSize: 12 }}
            >
              {formatTimestamp(conversation.lastMessageAt)}
            </AppText>
          </View>

          <View className="flex-row items-center justify-between mt-0.5">
            <AppText
              className="text-sm flex-1 mr-2"
              style={{
                color: hasUnread ? theme.textSecondary : theme.textMuted,
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
                  style={{ fontSize: 11, color: '#FFFFFF', fontWeight: '700' }}
                >
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </AppText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    );
  },
);

ConversationCard.displayName = 'ConversationCard';

// ---- Empty State ------------------------------------------------------------

const EmptyState = () => {
  const theme = useTheme();
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <MaterialCommunityIcons name="chat-outline" size={64} color={theme.border} />
      <AppText
        className="font-bold text-lg mt-4 text-center"
        style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}
      >
        No conversations yet
      </AppText>
      <AppText
        className="text-sm mt-2 text-center leading-relaxed"
        style={{ color: theme.textSecondary, fontSize: 14 }}
      >
        Start a conversation to connect with others
      </AppText>
    </View>
  );
};

// ---- Admin Tab Switcher -----------------------------------------------------

interface AdminTabsProps {
  active: ConversationType;
  onChange: (tab: ConversationType) => void;
}

const AdminTabs = ({ active, onChange }: AdminTabsProps) => {
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        marginHorizontal: 16,
        marginBottom: 12,
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: theme.card,
      }}
    >
      <Pressable
        onPress={() => onChange('business')}
        style={{
          flex: 1,
          paddingVertical: 10,
          alignItems: 'center',
          backgroundColor: active === 'business' ? colors.neonPurple : 'transparent',
          borderRadius: 10,
        }}
        accessibilityLabel="Business conversations"
        accessibilityRole="tab"
      >
        <AppText
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: active === 'business' ? '#FFFFFF' : theme.textSecondary,
          }}
        >
          Business
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => onChange('moderator')}
        style={{
          flex: 1,
          paddingVertical: 10,
          alignItems: 'center',
          backgroundColor: active === 'moderator' ? colors.neonPurple : 'transparent',
          borderRadius: 10,
        }}
        accessibilityLabel="Moderator conversations"
        accessibilityRole="tab"
      >
        <AppText
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: active === 'moderator' ? '#FFFFFF' : theme.textSecondary,
          }}
        >
          Moderator
        </AppText>
      </Pressable>
    </View>
  );
};

// ---- Admin Conversation List (tabbed) ---------------------------------------

interface AdminConversationListProps {
  type: ConversationType;
  onPress: (id: string) => void;
}

const AdminConversationList = ({ type, onPress }: AdminConversationListProps) => {
  const theme = useTheme();
  const { conversations, isLoading, error, refresh } = useAdminConversations(type);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ConversationEntity>) => (
      <ConversationCard conversation={item} onPress={onPress} />
    ),
    [onPress],
  );

  const keyExtractor = useCallback((item: ConversationEntity) => item.id, []);

  const renderSeparator = useCallback(
    () => (
      <View
        style={{
          height: 1,
          backgroundColor: theme.border,
          marginLeft: 72,
          opacity: 0.3,
        }}
      />
    ),
    [theme.border],
  );

  if (isLoading && conversations.length === 0) return <LoadingIndicator />;
  if (error && conversations.length === 0) return <ErrorView message={error} onRetry={refresh} />;

  return (
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
  );
};

// ---- ConversationsScreen ----------------------------------------------------

export default function ConversationsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { conversations, isLoading, error, refresh } = useConversations();
  const role = useRoleStore((s) => s.role);
  const isAdmin = role === 'admin';
  const [activeTab, setActiveTab] = useState<ConversationType>('business');

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
          backgroundColor: theme.border,
          marginLeft: 72,
          opacity: 0.3,
        }}
      />
    ),
    [theme.border],
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
          gap: 12,
        }}
      >
        {isAdmin && <AdminMenuButton />}
        <AppText
          style={{
            flex: 1,
            color: theme.text,
            fontSize: 17,
            fontWeight: '700',
            textAlign: isAdmin ? 'left' : 'center',
          }}
        >
          Messages
        </AppText>
      </View>

      {/* Admin tab switcher */}
      {isAdmin && <AdminTabs active={activeTab} onChange={setActiveTab} />}

      {/* Admin tabbed list */}
      {isAdmin ? (
        <AdminConversationList type={activeTab} onPress={handleConversationPress} />
      ) : isLoading && conversations.length === 0 ? (
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
