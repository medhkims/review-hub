import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import { colors } from '@/core/theme';
import { useTheme } from '@/core/theme/useTheme';
import { useRoleNavigation } from '@/presentation/shared/hooks/useRoleNavigation';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { AdminDrawer } from '@/presentation/admin/components/AdminDrawer';
import { useNotificationStore } from '@/presentation/notifications/store/notificationStore';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { auth } from '@/core/firebase/firebaseConfig';
import { container } from '@/core/di/container';

const ALL_TAB_ROUTES = [
  '(feed)',
  '(notifications)',
  '(insights)',
  '(reviews)',
  '(admin)',
  '(settings)',
  '(chat)',
  '(profile)',
];

export default function MainLayout() {
  const { t } = useTranslation();
  const { tabs, isRoleLoaded } = useRoleNavigation();
  const { role } = useRoleStore();
  const { unreadCount, setNotifications } = useNotificationStore();
  const { bottom } = useSafeAreaInsets();
  const theme = useTheme();

  // Once the role is loaded, auth is guaranteed ready — fetch notifications for the badge
  useEffect(() => {
    if (!isRoleLoaded) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    container.getNotificationsUseCase.execute(userId).then((result) => {
      result.fold(() => {}, (notifications) => setNotifications(notifications));
    });
  }, [isRoleLoaded, setNotifications]);

  if (!isRoleLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.neonPurple} />
      </View>
    );
  }

  const isAdmin = role === 'admin';

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.neonPurple,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: isAdmin
          ? { display: 'none' }
          : {
              backgroundColor: theme.card,
              borderTopColor: theme.border,
              borderTopWidth: 1,
              paddingBottom: Platform.OS === 'ios' ? 24 : 8 + bottom,
              paddingTop: 8,
              height: Platform.OS === 'ios' ? 85 : 65 + bottom,
            },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      {ALL_TAB_ROUTES.map((route) => {
        const tabConfig = tabs.find((tab) => tab.name === route);

        if (tabConfig) {
          return (
            <Tabs.Screen
              key={route}
              name={route}
              options={{
                title: t(tabConfig.title),
                tabBarLabel: t(tabConfig.title),
                tabBarIcon: ({ color, size, focused }) => {
                  const isNotifications = tabConfig.name === '(notifications)';
                  const showBadge = isNotifications && unreadCount > 0;
                  return (
                    <View style={{ width: size + 8, height: size + 8, alignItems: 'center', justifyContent: 'center' }}>
                      <MaterialCommunityIcons
                        name={(focused ? tabConfig.iconFocused : tabConfig.icon) as keyof typeof MaterialCommunityIcons.glyphMap}
                        size={size}
                        color={color}
                      />
                      {showBadge && (
                        <View
                          style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            backgroundColor: '#EF4444',
                            alignItems: 'center',
                            justifyContent: 'center',
                            paddingHorizontal: 3,
                            borderWidth: 1.5,
                            borderColor: theme.card,
                          }}
                        >
                          {unreadCount <= 99 && (
                            <AppText style={{ fontSize: 9, fontWeight: '700', color: '#fff', lineHeight: 12 }}>
                              {unreadCount}
                            </AppText>
                          )}
                        </View>
                      )}
                    </View>
                  );
                },
              }}
              listeners={({ navigation }) => ({
                tabPress: () => {
                  const state = navigation.getState();
                  const tabRoute = state.routes.find((r: { name: string; state?: { key?: string } | null }) => r.name === route);
                  if (tabRoute?.state?.key) {
                    navigation.dispatch({
                      ...StackActions.popToTop(),
                      target: tabRoute.state.key,
                    });
                  }
                },
              })}
            />
          );
        }

        return (
          <Tabs.Screen
            key={route}
            name={route}
            options={{ href: null }}
          />
        );
      })}
    </Tabs>
    {isAdmin && <AdminDrawer />}
    </View>
  );
}
