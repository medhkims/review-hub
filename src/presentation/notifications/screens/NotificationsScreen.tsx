import React, { useCallback, useEffect, useRef } from 'react';
import { View, FlatList, Pressable, Animated, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationEntity, NotificationType } from '@/domain/notifications/entities/notificationEntity';
import { colors } from '@/core/theme/colors';

// -- Helpers ------------------------------------------------------------------

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

// -- Type config --------------------------------------------------------------

interface NotificationTypeConfig {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
}

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  review: {
    icon: 'star',
    color: colors.neonPurple,
    bgColor: 'rgba(168, 85, 247, 0.1)',
  },
  like: {
    icon: 'heart',
    color: colors.pink,
    bgColor: 'rgba(236, 72, 153, 0.1)',
  },
  follow: {
    icon: 'account-plus',
    color: colors.blue,
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  system: {
    icon: 'shield-alert',
    color: colors.orange,
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  promotion: {
    icon: 'tag',
    color: colors.green,
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
};

// -- Pulse Dot ----------------------------------------------------------------

interface PulseDotProps {
  color: string;
}

const PulseDot: React.FC<PulseDotProps> = ({ color }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View
      style={{
        position: 'absolute',
        top: 18,
        right: 16,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Animated.View
        style={{
          position: 'absolute',
          width: 16,
          height: 16,
          borderRadius: 8,
          backgroundColor: color,
          opacity: pulseAnim,
          transform: [
            {
              scale: pulseAnim.interpolate({
                inputRange: [0.4, 1],
                outputRange: [1.4, 1],
              }),
            },
          ],
        }}
      />
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: color,
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 4,
          elevation: 4,
        }}
      />
    </View>
  );
};

// -- Notification Row ---------------------------------------------------------

interface NotificationRowProps {
  notification: NotificationEntity;
  onPress: (notification: NotificationEntity) => void;
}

const NotificationRow: React.FC<NotificationRowProps> = React.memo(
  ({ notification, onPress }) => {
    const config =
      NOTIFICATION_TYPE_CONFIG[notification.type] ?? NOTIFICATION_TYPE_CONFIG.system;
    const isUnread = !notification.isRead;

    const handlePress = useCallback(() => {
      onPress(notification);
    }, [notification, onPress]);

    return (
      <Pressable
        onPress={handlePress}
        style={{
          position: 'relative',
          backgroundColor: isUnread ? colors.cardDark : colors.cardDark,
          opacity: isUnread ? 1 : 0.6,
          padding: 16,
          borderRadius: 24,
          flexDirection: 'row',
          alignItems: 'flex-start',
          gap: 14,
          marginBottom: 12,
          borderLeftWidth: isUnread ? 3 : 0,
          borderLeftColor: isUnread ? colors.neonPurple : 'transparent',
        }}
        accessibilityLabel={`${notification.title}, ${getRelativeTime(notification.createdAt)}`}
        accessibilityRole="button"
      >
        {isUnread && <PulseDot color={colors.neonPurple} />}

        {/* Icon circle */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: config.bgColor,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <MaterialCommunityIcons
            name={config.icon}
            size={24}
            color={config.color}
          />
        </View>

        {/* Content */}
        <View style={{ flex: 1, paddingRight: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 4,
            }}
          >
            <AppText
              style={{
                fontSize: 15,
                fontWeight: '700',
                color: isUnread ? colors.textWhite : colors.textSlate200,
                flex: 1,
                lineHeight: 20,
              }}
              numberOfLines={1}
            >
              {notification.title}
            </AppText>
            <AppText
              style={{
                fontSize: 12,
                color: colors.textSlate400,
                marginLeft: 8,
                flexShrink: 0,
              }}
            >
              {getRelativeTime(notification.createdAt)}
            </AppText>
          </View>

          <AppText
            style={{
              fontSize: 13,
              color: colors.textSlate400,
              lineHeight: 20,
            }}
          >
            {notification.body}
          </AppText>
        </View>
      </Pressable>
    );
  },
);

NotificationRow.displayName = 'NotificationRow';

// -- Empty State --------------------------------------------------------------

const EmptyState: React.FC = () => (
  <View
    style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    }}
  >
    <MaterialCommunityIcons
      name="bell-off-outline"
      size={64}
      color={colors.textSlate500}
    />
    <AppText
      style={{
        color: colors.textSlate500,
        marginTop: 16,
        fontSize: 16,
      }}
    >
      No notifications yet
    </AppText>
  </View>
);

// -- Screen -------------------------------------------------------------------

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications();

  const handleNotificationPress = useCallback(
    (notification: NotificationEntity) => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
      // Navigate to reference if applicable
      if (notification.referenceId && notification.referenceType === 'business') {
        router.push(`/(main)/(feed)/business/${notification.referenceId}`);
      }
    },
    [markAsRead, router],
  );

  const keyExtractor = useCallback(
    (item: NotificationEntity) => item.id,
    [],
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationEntity }) => (
      <NotificationRow
        notification={item}
        onPress={handleNotificationPress}
      />
    ),
    [handleNotificationPress],
  );

  if (isLoading && notifications.length === 0) {
    return (
      <ScreenLayout>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <ScreenLayout>
        <ErrorView message={error} onRetry={refresh} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 4,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={colors.textWhite}
          />
        </Pressable>

        <AppText
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.textWhite,
            letterSpacing: -0.3,
          }}
        >
          Notifications
        </AppText>

        {unreadCount > 0 ? (
          <Pressable
            onPress={markAllAsRead}
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
            }}
            accessibilityLabel="Mark all as read"
            accessibilityRole="button"
          >
            <AppText
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: colors.neonPurple,
              }}
            >
              Mark all read
            </AppText>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 16,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={EmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      />
    </ScreenLayout>
  );
}
