import React, { useCallback, useState, useEffect } from 'react';
import { View, FlatList, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { USER_ROLES } from '@/domain/profile/entities/userRole';
import { container } from '@/core/di/container';
import { AdminMenuButton } from '../components/AdminMenuButton';
import type { UserItem } from '@/data/admin/datasources/adminInsightsRemoteDataSource';

const ROLE_COLORS: Record<string, string> = {
  admin: '#EF4444',
  moderator: '#F59E0B',
  simple_user: '#22C55E',
  business_owner: '#3B82F6',
};

export default function AdminUsersScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_USERS);
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      setUsers(await container.adminInsightsDataSource.fetchUsers());
    } catch { /* silently fail */ }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleChangeRole = useCallback((user: UserItem) => {
    const roleOptions = USER_ROLES.filter((r) => r !== user.role);
    crossPlatformAlert(
      t('admin.users.changeRole'),
      `${user.name}`,
      [
        ...roleOptions.map((role) => ({
          text: t(`roles.${role}`),
          onPress: () => {
            // TODO: Call updateUserRole Cloud Function
            crossPlatformAlert(t('admin.users.roleUpdated'));
          },
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ],
    );
  }, [t]);

  const renderUser = useCallback(({ item }: { item: UserItem }) => {
    const roleColor = ROLE_COLORS[item.role] ?? ROLE_COLORS.simple_user;
    return (
      <View
        style={{
          backgroundColor: colors.cardDark, borderRadius: 14, padding: 16, marginBottom: 10,
          borderWidth: 1, borderColor: colors.textSlate800, flexDirection: 'row', alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 44, height: 44, borderRadius: 22, backgroundColor: `${roleColor}20`,
            justifyContent: 'center', alignItems: 'center', marginRight: 12,
          }}
        >
          <AppText style={{ fontSize: 16, fontWeight: '700', color: roleColor }}>
            {item.name.charAt(0)}
          </AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.white }}>{item.name}</AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>{item.email}</AppText>
          <View style={{ backgroundColor: `${roleColor}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 6 }}>
            <AppText style={{ fontSize: 11, fontWeight: '600', color: roleColor }}>{t(`roles.${item.role}`)}</AppText>
          </View>
        </View>
        <Pressable onPress={() => handleChangeRole(item)} style={{ padding: 8 }} accessibilityRole="button" accessibilityLabel={`${t('admin.users.changeRole')} ${item.name}`}>
          <MaterialCommunityIcons name="account-edit" size={22} color={colors.textSlate400} />
        </Pressable>
      </View>
    );
  }, [handleChangeRole, t]);

  const keyExtractor = useCallback((item: UserItem) => item.id, []);

  return (
    <ScreenLayout>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <AdminMenuButton />
        <AppText style={{ fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 }}>
          {t('admin.users.title')}
        </AppText>
      </View>

      {isLoading && users.length === 0 ? (
        <ActivityIndicator size="large" color={colors.neonPurple} style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUser}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={loadUsers}
              tintColor={colors.neonPurple}
              colors={[colors.neonPurple]}
            />
          }
        />
      )}
    </ScreenLayout>
  );
}
