import React from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { colors } from '@/core/theme/colors';

export default function NotificationsScreen() {
  return (
    <ScreenLayout>
      <View className="px-6 pt-4 pb-2" style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <AppText
          className="text-2xl font-bold text-white"
          style={{ fontSize: 24, fontWeight: '700', color: colors.white }}
        >
          Notifications
        </AppText>
      </View>
      <View className="flex-1 items-center justify-center" style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <MaterialCommunityIcons name="bell-outline" size={64} color={colors.textSlate500} />
        <AppText
          className="text-slate-500 mt-4 text-base"
          style={{ color: colors.textSlate500, marginTop: 16, fontSize: 16 }}
        >
          No notifications yet
        </AppText>
      </View>
    </ScreenLayout>
  );
}
