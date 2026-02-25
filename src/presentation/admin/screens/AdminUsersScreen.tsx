import React, { useCallback, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserRole, USER_ROLES } from '@/domain/profile/entities/userRole';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// Mock data until backend is wired
const MOCK_USERS: UserItem[] = [
  { id: '1', name: 'Ahmed Ben Ali', email: 'ahmed@example.com', role: 'simple_user' },
  { id: '2', name: 'Fatma Trabelsi', email: 'fatma@example.com', role: 'simple_user' },
  { id: '3', name: 'Mohamed Souissi', email: 'mohamed@example.com', role: 'business_owner' },
  { id: '4', name: 'Salma Gharbi', email: 'salma@example.com', role: 'moderator' },
  { id: '5', name: 'Youssef Hamdi', email: 'youssef@example.com', role: 'simple_user' },
];

const ROLE_COLORS: Record<UserRole, string> = {
  admin: '#EF4444',
  moderator: '#F59E0B',
  simple_user: '#22C55E',
  business_owner: '#3B82F6',
};

export default function AdminUsersScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADMIN_USERS);
  const { t } = useTranslation();
  const [users] = useState<UserItem[]>(MOCK_USERS);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangeRole = useCallback((user: UserItem) => {
    const roleOptions = USER_ROLES.filter((r) => r !== user.role);
    Alert.alert(
      t('admin.users.changeRole'),
      `${user.name}`,
      [
        ...roleOptions.map((role) => ({
          text: t(`roles.${role}`),
          onPress: () => {
            // TODO: Call updateUserRole Cloud Function
            Alert.alert(t('admin.users.roleUpdated'));
          },
        })),
        { text: t('common.cancel'), style: 'cancel' as const },
      ],
    );
  }, [t]);

  const renderUser = useCallback(({ item }: { item: UserItem }) => (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 14,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.textSlate800,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      {/* Avatar placeholder */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${ROLE_COLORS[item.role]}20`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12,
        }}
      >
        <AppText style={{ fontSize: 16, fontWeight: '700', color: ROLE_COLORS[item.role] }}>
          {item.name.charAt(0)}
        </AppText>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.white }}>
          {item.name}
        </AppText>
        <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
          {item.email}
        </AppText>
        <View
          style={{
            backgroundColor: `${ROLE_COLORS[item.role]}20`,
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            alignSelf: 'flex-start',
            marginTop: 6,
          }}
        >
          <AppText style={{ fontSize: 11, fontWeight: '600', color: ROLE_COLORS[item.role] }}>
            {t(`roles.${item.role}`)}
          </AppText>
        </View>
      </View>

      {/* Action */}
      <Pressable
        onPress={() => handleChangeRole(item)}
        style={{ padding: 8 }}
        accessibilityRole="button"
        accessibilityLabel={`${t('admin.users.changeRole')} ${item.name}`}
      >
        <MaterialCommunityIcons name="account-edit" size={22} color={colors.textSlate400} />
      </Pressable>
    </View>
  ), [handleChangeRole, t]);

  const keyExtractor = useCallback((item: UserItem) => item.id, []);

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
        <AppText style={{ fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 }}>
          {t('admin.users.title')}
        </AppText>
      </View>

      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1000); }}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      />
    </ScreenLayout>
  );
}
