import React from 'react';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme';
import { useRoleNavigation } from '@/presentation/shared/hooks/useRoleNavigation';

const ALL_TAB_ROUTES = [
  '(feed)',
  '(notifications)',
  '(reviews)',
  '(admin)',
  'settings',
  '(chat)',
  '(profile)',
  'change-password',
];

export default function MainLayout() {
  const { t } = useTranslation();
  const { tabs, isRoleLoaded } = useRoleNavigation();

  if (!isRoleLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.midnight,
        }}
      >
        <ActivityIndicator size="large" color={colors.neonPurple} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.neonPurple,
        tabBarInactiveTintColor: colors.textSlate500,
        tabBarStyle: {
          backgroundColor: colors.midnight,
          borderTopColor: colors.textSlate800,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 85 : 65,
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
                tabBarIcon: ({ color, size, focused }) => (
                  <MaterialCommunityIcons
                    name={(focused ? tabConfig.iconFocused : tabConfig.icon) as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={size}
                    color={color}
                  />
                ),
              }}
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
  );
}
