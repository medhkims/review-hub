import React from 'react';
import { View, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { Card } from '@/presentation/shared/components/ui/Card';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { SettingRow } from '@/presentation/shared/components/ui/SettingRow';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useSettings } from '@/presentation/settings/hooks/useSettings';

export default function ProfileScreen() {
  const router = useRouter();

  // Auth hook
  const { user, isLoading: authLoading, signOut } = useAuth();

  // Settings hook
  const { settings, isLoading: settingsLoading, toggleNotifications, toggleDarkMode } = useSettings();

  const handleEditProfile = () => {
    router.push('/(main)/(profile)/edit');
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Show loading spinner while data is loading
  if (authLoading || settingsLoading) {
    return (
      <ScreenLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#A855F7" />
        </View>
      </ScreenLayout>
    );
  }

  // Fallback user data if not authenticated
  const displayUser = user || {
    displayName: 'Guest User',
    email: 'guest@reviewhub.app',
    avatarUrl: null,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <ScreenLayout withKeyboardAvoid={false}>
      {/* Header */}
      <View className="px-6 pt-3 pb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="p-1 rounded-full bg-slate-800/30 active:bg-slate-800/50"
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </Pressable>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center pt-2 pb-6">
          <Avatar
            imageUrl={displayUser.avatarUrl}
            size="xl"
            withGlow={true}
            onEditPress={handleEditProfile}
            initials={getInitials(displayUser.displayName)}
          />
          <View className="mt-6 items-center">
            <AppText className="text-2xl font-bold tracking-tight text-white">
              {displayUser.displayName}
            </AppText>
            <AppText className="text-slate-400 text-sm mt-1">
              {displayUser.email}
            </AppText>
          </View>
        </View>

        {/* Profile Section */}
        <View className="mt-4">
          <SectionHeader title="Profile" />
          <Card>
            <SettingRow
              iconName="account"
              iconColor="blue"
              label="Personal Info"
              onPress={() => router.push('/(main)/(profile)/personal-info')}
            />
            <SettingRow
              iconName="heart"
              iconColor="pink"
              label="Wishlist"
              onPress={() => router.push('/(main)/(profile)/wishlist')}
            />
            <SettingRow
              iconName="shield-check"
              iconColor="green"
              label="Verify account"
              onPress={() => console.log('Verify Account')}
            />
            <SettingRow
              iconName="lock-reset"
              iconColor="orange"
              label="Reset Password"
              onPress={() => console.log('Reset Password')}
              isLast
            />
          </Card>
        </View>

        {/* Settings Section */}
        <View className="mt-10">
          <SectionHeader title="Settings" />
          <Card>
            <SettingRow
              iconName="bell"
              iconColor="indigo"
              label="Notifications"
              rightElement="toggle"
              toggleValue={settings?.notificationsEnabled ?? true}
              onToggle={toggleNotifications}
            />
            <SettingRow
              iconName="weather-night"
              iconColor="purple"
              label="Dark Mode"
              rightElement="toggle"
              toggleValue={settings?.theme === 'dark'}
              onToggle={(enabled) => toggleDarkMode(enabled)}
            />
            <SettingRow
              iconName="translate"
              iconColor="emerald"
              label="Language"
              value="English"
              onPress={() => {}}
              isLast
            />
          </Card>
        </View>

        {/* Support Section */}
        <View className="mt-10 mb-6">
          <SectionHeader title="Support" />
          <Card>
            <SettingRow
              iconName="help-circle"
              iconColor="yellow"
              label="Help Center"
              rightElement="external"
              onPress={() => console.log('Help Center')}
            />
            <SettingRow
              iconName="shield-account"
              iconColor="cyan"
              label="Privacy Policy"
              rightElement="external"
              onPress={() => console.log('Privacy Policy')}
            />
            <SettingRow
              iconName="logout"
              iconColor="red"
              label="Log out"
              variant="danger"
              onPress={handleLogout}
              isLast
            />
          </Card>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-24" />
      </ScrollView>
    </ScreenLayout>
  );
}
