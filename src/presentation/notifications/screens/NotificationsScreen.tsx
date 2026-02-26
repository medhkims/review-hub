import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────

type NotificationType = 'rating' | 'update' | 'subscription' | 'offer' | 'security' | 'stats';
type TabFilter = 'all' | 'unread';

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: string;
  isUnread: boolean;
  section: 'today' | 'earlier';
}

interface NotificationTypeConfig {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
}

// ── Notification type config ─────────────────────────────────────────────────

const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, NotificationTypeConfig> = {
  rating: {
    icon: 'star',
    color: colors.neonPurple,
    bgColor: 'rgba(168, 85, 247, 0.1)',
  },
  update: {
    icon: 'update',
    color: colors.blue,
    bgColor: 'rgba(59, 130, 246, 0.1)',
  },
  subscription: {
    icon: 'cash-multiple',
    color: colors.green,
    bgColor: 'rgba(34, 197, 94, 0.1)',
  },
  offer: {
    icon: 'tag',
    color: colors.neonPurple,
    bgColor: 'rgba(168, 85, 247, 0.1)',
  },
  security: {
    icon: 'shield-alert',
    color: colors.orange,
    bgColor: 'rgba(249, 115, 22, 0.1)',
  },
  stats: {
    icon: 'chart-line',
    color: colors.cyan,
    bgColor: 'rgba(6, 182, 212, 0.1)',
  },
};

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    type: 'rating',
    title: 'New 5-Star Rating',
    body: 'Coffee House Tunis just got a new glowing review from Sarah M.',
    timestamp: '2m ago',
    isUnread: true,
    section: 'today',
  },
  {
    id: '2',
    type: 'update',
    title: 'App Update Available',
    body: 'Version 2.4 is live! Check out the new interactive map features for Tunis.',
    timestamp: '1h ago',
    isUnread: true,
    section: 'today',
  },
  {
    id: '3',
    type: 'subscription',
    title: 'Subscription Renewed',
    body: 'Your monthly business pro plan has been successfully renewed.',
    timestamp: '3h ago',
    isUnread: true,
    section: 'today',
  },
  {
    id: '4',
    type: 'offer',
    title: 'Weekend Offer',
    body: "Don't miss out on the 50% discount at Sidi Bou Said Spa this weekend.",
    timestamp: '1d ago',
    isUnread: false,
    section: 'earlier',
  },
  {
    id: '5',
    type: 'security',
    title: 'Login Attempt',
    body: 'New login detected from Chrome on Windows. Was this you?',
    timestamp: '2d ago',
    isUnread: false,
    section: 'earlier',
  },
  {
    id: '6',
    type: 'stats',
    title: 'Weekly Stats',
    body: 'Your profile views went up by 24% this week. Great job!',
    timestamp: '3d ago',
    isUnread: false,
    section: 'earlier',
  },
];

// ── Pulse Dot ────────────────────────────────────────────────────────────────

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
      {/* Glow ring */}
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
      {/* Solid dot */}
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

// ── Notification Card ────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: NotificationItem;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification }) => {
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const isRead = !notification.isUnread;

  return (
    <Pressable
      style={{
        position: 'relative',
        backgroundColor: colors.cardDark,
        opacity: isRead ? 0.6 : 1,
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 12,
      }}
      accessibilityLabel={`${notification.title}, ${notification.timestamp}`}
      accessibilityRole="button"
    >
      {/* Unread indicator dot */}
      {notification.isUnread && <PulseDot color={colors.neonPurple} />}

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
        {/* Title row + timestamp */}
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
              color: isRead ? colors.textSlate200 : colors.textWhite,
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
            {notification.timestamp}
          </AppText>
        </View>

        {/* Body */}
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
};

// ── Notifications Screen ─────────────────────────────────────────────────────

export default function NotificationsScreen() {
  useAnalyticsScreen(AnalyticsScreens.NOTIFICATIONS);
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  const filteredNotifications =
    activeTab === 'unread'
      ? MOCK_NOTIFICATIONS.filter((n) => n.isUnread)
      : MOCK_NOTIFICATIONS;

  const todayNotifications = filteredNotifications.filter((n) => n.section === 'today');
  const earlierNotifications = filteredNotifications.filter((n) => n.section === 'earlier');

  return (
    <ScreenLayout>
      {/* ── Header ──────────────────────────────────────────────── */}
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
          accessibilityLabel={t('common.goBack', { defaultValue: 'Go back' })}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textWhite} />
        </Pressable>

        <AppText
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: colors.textWhite,
            letterSpacing: -0.3,
          }}
        >
          {t('notifications.title', { defaultValue: 'Notifications' })}
        </AppText>

        <Pressable
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={t('notifications.moreOptions', { defaultValue: 'More options' })}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="dots-horizontal" size={24} color={colors.textWhite} />
        </Pressable>
      </View>

      {/* ── Segmented Control ───────────────────────────────────── */}
      <View
        style={{
          marginHorizontal: 24,
          marginTop: 16,
          marginBottom: 8,
          padding: 4,
          backgroundColor: colors.cardDark,
          borderRadius: 9999,
          flexDirection: 'row',
        }}
      >
        <Pressable
          onPress={() => setActiveTab('all')}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'all' ? colors.neonPurple : 'transparent',
            ...(activeTab === 'all'
              ? {
                  shadowColor: colors.neonPurple,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }
              : {}),
          }}
          accessibilityLabel={t('notifications.all', { defaultValue: 'All' })}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'all' }}
        >
          <AppText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'all' ? colors.textWhite : colors.textSlate400,
            }}
          >
            {t('notifications.all', { defaultValue: 'All' })}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('unread')}
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activeTab === 'unread' ? colors.neonPurple : 'transparent',
            ...(activeTab === 'unread'
              ? {
                  shadowColor: colors.neonPurple,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 10,
                  elevation: 6,
                }
              : {}),
          }}
          accessibilityLabel={t('notifications.unread', { defaultValue: 'Unread' })}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'unread' }}
        >
          <AppText
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: activeTab === 'unread' ? colors.textWhite : colors.textSlate400,
            }}
          >
            {t('notifications.unread', { defaultValue: 'Unread' })}
          </AppText>
        </Pressable>
      </View>

      {/* ── Notification List ───────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TODAY section ──────────────────────────────────────── */}
        {todayNotifications.length > 0 && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginBottom: 12,
              }}
            >
              <AppText
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textSlate400,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                {t('notifications.today', { defaultValue: 'Today' })}
              </AppText>
              <Pressable
                accessibilityLabel={t('notifications.markAllAsRead', { defaultValue: 'Mark all as read' })}
                accessibilityRole="button"
              >
                <AppText
                  style={{
                    fontSize: 12,
                    fontWeight: '500',
                    color: colors.neonPurple,
                  }}
                >
                  {t('notifications.markAllAsRead', { defaultValue: 'Mark all as read' })}
                </AppText>
              </Pressable>
            </View>

            {todayNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </>
        )}

        {/* ── EARLIER section ───────────────────────────────────── */}
        {earlierNotifications.length > 0 && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                marginTop: 12,
                marginBottom: 12,
              }}
            >
              <AppText
                style={{
                  fontSize: 12,
                  fontWeight: '600',
                  color: colors.textSlate400,
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                }}
              >
                {t('notifications.earlier', { defaultValue: 'Earlier' })}
              </AppText>
            </View>

            {earlierNotifications.map((notification) => (
              <NotificationCard key={notification.id} notification={notification} />
            ))}
          </>
        )}

        {/* ── Empty state ───────────────────────────────────────── */}
        {filteredNotifications.length === 0 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 64,
            }}
          >
            <MaterialCommunityIcons name="bell-off-outline" size={64} color={colors.textSlate500} />
            <AppText
              style={{
                color: colors.textSlate500,
                marginTop: 16,
                fontSize: 16,
              }}
            >
              {t('notifications.empty', { defaultValue: 'No notifications yet' })}
            </AppText>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
