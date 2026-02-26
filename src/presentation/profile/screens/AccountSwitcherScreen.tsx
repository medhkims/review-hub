import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Card } from '@/presentation/shared/components/ui/Card';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { colors } from '@/core/theme/colors';

interface AccountItem {
  id: string;
  name: string;
  subtitle: string;
  type: 'user' | 'business';
  avatarInitials: string;
}

const USER_ACCOUNTS: AccountItem[] = [
  { id: '1', name: 'Jane Cooper', subtitle: 'jane.cooper@example.com', type: 'user', avatarInitials: 'JC' },
  { id: '2', name: "Jane's Alt", subtitle: 'jane.private@gmail.com', type: 'user', avatarInitials: 'JA' },
];

const BUSINESS_ACCOUNTS: AccountItem[] = [
  { id: '3', name: 'Acme Corp', subtitle: 'Enterprise', type: 'business', avatarInitials: 'AC' },
  { id: '4', name: 'Studio Design', subtitle: 'Freelance', type: 'business', avatarInitials: 'SD' },
];

const AccountRow: React.FC<{
  item: AccountItem;
  isActive: boolean;
  onPress: () => void;
}> = ({ item, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={`Switch to ${item.name}`}
    accessibilityRole="button"
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      gap: 14,
    }}
  >
    <MaterialCommunityIcons
      name={item.type === 'user' ? 'account' : 'domain'}
      size={20}
      color={colors.textSlate500}
    />
    <View
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.borderDark,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.textWhite }}>{item.avatarInitials}</AppText>
    </View>
    <View style={{ flex: 1 }}>
      <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textWhite }}>{item.name}</AppText>
      <AppText style={{ fontSize: 13, color: colors.textSlate400, marginTop: 2 }}>{item.subtitle}</AppText>
    </View>
    {isActive ? (
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.neonPurple,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="check" size={14} color={colors.textWhite} />
      </View>
    ) : (
      <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSlate500} />
    )}
  </Pressable>
);

export default function AccountSwitcherScreen() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState('1');

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 32 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: 'rgba(168,85,247,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <MaterialCommunityIcons name="account-switch" size={36} color={colors.neonPurple} />
          </View>
          <AppText style={{ fontSize: 24, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}>
            Select Account
          </AppText>
          <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
            Manage your personal and business profiles
          </AppText>
        </View>

        {/* User Accounts */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="USER ACCOUNTS" />
          <Card>
            {USER_ACCOUNTS.map((account, index) => (
              <React.Fragment key={account.id}>
                {index > 0 && <View style={{ height: 1, backgroundColor: `${colors.borderDark}30`, marginHorizontal: 16 }} />}
                <AccountRow item={account} isActive={activeId === account.id} onPress={() => setActiveId(account.id)} />
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Business Accounts */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <SectionHeader title="BUSINESS ACCOUNTS" />
          <Card>
            {BUSINESS_ACCOUNTS.map((account, index) => (
              <React.Fragment key={account.id}>
                {index > 0 && <View style={{ height: 1, backgroundColor: `${colors.borderDark}30`, marginHorizontal: 16 }} />}
                <AccountRow item={account} isActive={activeId === account.id} onPress={() => setActiveId(account.id)} />
              </React.Fragment>
            ))}
          </Card>
        </View>

        {/* Add another account */}
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => {/* TODO: Navigate to add account */}}
            accessibilityLabel="Add another account"
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: colors.borderDark,
              borderStyle: 'dashed',
            }}
          >
            <MaterialCommunityIcons name="plus-circle-outline" size={22} color={colors.textSlate400} />
            <AppText style={{ fontSize: 15, fontWeight: '500', color: colors.textSlate400 }}>
              Add another account
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
