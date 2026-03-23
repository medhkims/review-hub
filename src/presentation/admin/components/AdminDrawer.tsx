import React, { useEffect, useRef } from 'react';
import {
  View,
  Animated,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAdminDrawerStore } from '../store/adminDrawerStore';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useAdminBadges } from '../hooks/useAdminBadges';
import { useAdminBadgeStore } from '../store/adminBadgeStore';

const DRAWER_WIDTH = 280;

interface MenuItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  pathMatch: string;
}

// Items whose routes are route-group indexes (pathname resolves to '/')
// and need explicit activeKey tracking instead of pathname matching.
const INDEX_ROUTE_KEYS = new Set(['insight', 'chat']);

const MENU_ITEMS: MenuItem[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'view-dashboard-outline',
    route: '/(main)/(admin)/global-insights',
    pathMatch: '/global-insights',
  },
  {
    key: 'insight',
    label: 'Insight',
    icon: 'chart-line',
    route: '/(main)/(feed)',
    pathMatch: '/',
  },
  {
    key: 'verification',
    label: 'Verification',
    icon: 'shield-check-outline',
    route: '/(main)/(settings)/admin-verifications',
    pathMatch: '/admin-verifications',
  },
  {
    key: 'categories',
    label: 'Categories',
    icon: 'tag-multiple-outline',
    route: '/(main)/(feed)/categories',
    pathMatch: '/categories',
  },
  {
    key: 'media',
    label: 'Media Control',
    icon: 'image-multiple-outline',
    route: '/(main)/(settings)/media-control',
    pathMatch: '/media-control',
  },
  {
    key: 'chat',
    label: 'Chat',
    icon: 'chat-outline',
    route: '/(main)/(chat)',
    pathMatch: '/',
  },
  {
    key: 'tickets',
    label: 'Tickets',
    icon: 'ticket-outline',
    route: '/(main)/(admin)/tickets',
    pathMatch: '/tickets',
  },
  {
    key: 'boost',
    label: 'Sub & Boost',
    icon: 'rocket-launch-outline',
    route: '/(main)/(admin)/boost-management',
    pathMatch: '/boost-management',
  },
  {
    key: 'help',
    label: 'Help Center',
    icon: 'help-circle-outline',
    route: '/(main)/(settings)/help-center',
    pathMatch: '/help-center',
  },
  {
    key: 'info',
    label: 'Admin Info',
    icon: 'account-circle-outline',
    route: '/(main)/(settings)/admin-info',
    pathMatch: '/admin-info',
  },
];

export const AdminDrawer: React.FC = () => {
  const { isOpen, close, activeKey, setActiveKey } = useAdminDrawerStore();
  const { signOut } = useAuth();
  // useAdminBadges drives the fetch + 60s refresh; reads come from the store
  useAdminBadges();
  const { tickets, supportTickets, verification, chat } = useAdminBadgeStore();

  const badgeCount: Record<string, number> = {
    tickets: tickets + supportTickets,
    verification,
    chat,
  };
  const { top } = useSafeAreaInsets();
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, overlayOpacity, translateX]);

  const handleNavigate = (key: string, route: string) => {
    setActiveKey(key);
    close();
    setTimeout(() => {
      router.navigate(route as Parameters<typeof router.navigate>[0]);
    }, 300);
  };

  return (
    <>
      {/* Overlay */}
      <Animated.View
        pointerEvents={isOpen ? 'auto' : 'none'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          opacity: overlayOpacity,
          zIndex: 100,
        }}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={close}
          accessibilityLabel="Close menu"
          accessibilityRole="button"
        />
      </Animated.View>

      {/* Drawer Panel */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.cardDark,
          transform: [{ translateX }],
          zIndex: 101,
          borderRightWidth: 1,
          borderRightColor: colors.borderDark,
        }}
      >
        {/* Header */}
        <View
          style={{
            paddingTop: top + 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderDark,
            backgroundColor: `${colors.neonPurple}12`,
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: `${colors.neonPurple}20`,
              borderWidth: 2,
              borderColor: `${colors.neonPurple}50`,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons name="shield-crown" size={26} color={colors.neonPurple} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white }}>
                Administrator
              </AppText>
              <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
                Admin Panel
              </AppText>
            </View>
            {(tickets + supportTickets + verification + chat) > 0 && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(239,68,68,0.15)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                }}
              >
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#EF4444' }} />
                <AppText style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>
                  {tickets + supportTickets + verification + chat} pending
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ paddingVertical: 8 }}>
            {MENU_ITEMS.map((item) => {
              let active: boolean;
              if (INDEX_ROUTE_KEYS.has(item.key)) {
                // Index routes all resolve to '/' — use stored activeKey.
                // Fall back to 'insight' when no key is stored yet.
                active = (activeKey ?? 'insight') === item.key;
              } else {
                active = pathname.endsWith(item.pathMatch);
              }
              const count = badgeCount[item.key] ?? 0;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => handleNavigate(item.key, item.route)}
                  accessibilityRole="menuitem"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: active }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    marginHorizontal: 8,
                    borderRadius: 12,
                    backgroundColor: active
                      ? `${colors.neonPurple}22`
                      : pressed
                      ? `${colors.neonPurple}10`
                      : 'transparent',
                    borderWidth: active ? 1 : 0,
                    borderColor: active ? `${colors.neonPurple}50` : 'transparent',
                  })}
                >
                  {active && (
                    <View style={{
                      position: 'absolute',
                      left: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      backgroundColor: colors.neonPurple,
                    }} />
                  )}
                  <View
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      backgroundColor: active ? `${colors.neonPurple}30` : `${colors.neonPurple}15`,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={20}
                      color={active ? colors.neonPurple : colors.textSlate400}
                    />
                    {count > 0 && (
                      <View
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          minWidth: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: '#EF4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 3,
                        }}
                      >
                        <AppText style={{ fontSize: 9, color: '#FFFFFF', fontWeight: '700', lineHeight: 12 }}>
                          {count > 99 ? '99+' : String(count)}
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText style={{
                    fontSize: 14,
                    fontWeight: active ? '700' : '500',
                    color: active ? colors.white : colors.textSlate200,
                  }}>
                    {item.label}
                  </AppText>
                  {active && !count ? (
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <View style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.neonPurple,
                      }} />
                    </View>
                  ) : count > 0 ? (
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                      <View
                        style={{
                          minWidth: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: '#EF4444',
                          justifyContent: 'center',
                          alignItems: 'center',
                          paddingHorizontal: 4,
                        }}
                      >
                        <AppText style={{ fontSize: 10, color: '#FFFFFF', fontWeight: '700', lineHeight: 14 }}>
                          {count > 99 ? '99+' : String(count)}
                        </AppText>
                      </View>
                    </View>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Logout */}
        <Pressable
          onPress={() => { close(); signOut(); }}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: 14,
            borderTopWidth: 1,
            borderTopColor: colors.borderDark,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#EF4444" />
          <AppText style={{ fontSize: 14, color: '#EF4444', fontWeight: '600' }}>Log Out</AppText>
        </Pressable>

        {/* Close */}
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close menu"
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 20,
            paddingVertical: Platform.OS === 'ios' ? 20 : 16,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <MaterialCommunityIcons name="close" size={20} color={colors.textSlate400} />
          <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>Close</AppText>
        </Pressable>
      </Animated.View>
    </>
  );
};
