import React, { useEffect, useState } from 'react';
import { View, ScrollView, Pressable, Modal, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useSavedAccountsStore, SavedAccount } from '@/presentation/auth/store/savedAccountsStore';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { useAuth } from '@/presentation/auth/hooks/useAuth';

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

interface AccountRowProps {
  item: SavedAccount;
  isActive: boolean;
  isEditing: boolean;
  onPress: () => void;
  onRemove: () => void;
}

const ROW_STYLE = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  paddingVertical: 14,
  paddingHorizontal: 16,
  gap: 14,
};

const AccountRowContent: React.FC<AccountRowProps> = ({ item, isActive, isEditing, onRemove }) => {
  const theme = useTheme();
  return (
    <>
      {isEditing && !isActive ? (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item.displayName}`}
          hitSlop={8}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: '#EF4444',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="minus" size={16} color={colors.white} />
        </Pressable>
      ) : (
        <MaterialCommunityIcons
          name={item.type === 'user' ? 'account' : 'domain'}
          size={20}
          color={theme.textMuted}
        />
      )}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: theme.border,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {item.avatarUrl ? (
          <Image
            source={{ uri: item.avatarUrl }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            accessibilityLabel={item.displayName}
          />
        ) : (
          <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
            {getInitials(item.displayName)}
          </AppText>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
          {item.displayName}
        </AppText>
        <AppText style={{ fontSize: 13, color: theme.textMuted, marginTop: 2 }}>
          {item.email}
        </AppText>
      </View>
      {!isEditing && (
        isActive ? (
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
            <MaterialCommunityIcons name="check" size={14} color={colors.white} />
          </View>
        ) : (
          <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textMuted} />
        )
      )}
      {isEditing && isActive && (
        <AppText style={{ fontSize: 12, color: theme.textMuted }}>active</AppText>
      )}
    </>
  );
};

const AccountRow: React.FC<AccountRowProps> = (props) => {
  if (props.isEditing) {
    return (
      <View style={ROW_STYLE}>
        <AccountRowContent {...props} />
      </View>
    );
  }
  return (
    <Pressable
      onPress={props.onPress}
      accessibilityLabel={`Switch to ${props.item.displayName}`}
      accessibilityRole="button"
      style={ROW_STYLE}
    >
      <AccountRowContent {...props} />
    </Pressable>
  );
};

export default function AccountSwitcherScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts, isLoaded, load, save, remove } = useSavedAccountsStore();
  const currentUser = useAuthStore((s) => s.user);
  const role = useRoleStore((s) => s.role);
  const { signIn, signInWithGoogle, isLoading, error } = useAuth();

  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [password, setPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<SavedAccount | null>(null);

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  // Auto-save current user if not already persisted (e.g. signed in before this feature existed)
  useEffect(() => {
    if (!isLoaded || !currentUser) return;
    const currentType = role === 'business_owner' ? 'business' : role === 'moderator' ? 'moderator' : role === 'admin' ? 'admin' : 'user';
    const existing = accounts.find((a) => a.id === currentUser.id);
    if (!existing || existing.type !== currentType) {
      save({
        id: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.displayName,
        avatarUrl: currentUser.avatarUrl,
        type: currentType,
        provider: currentUser.provider,
      });
    }
  }, [isLoaded, currentUser, accounts, role, save]);

  const userAccounts = accounts.filter((a) => a.type === 'user');
  const businessAccounts = accounts.filter((a) => a.type === 'business');
  const moderatorAccounts = accounts.filter((a) => a.type === 'moderator');
  const adminAccounts = accounts.filter((a) => a.type === 'admin');

  const handleAccountPress = (account: SavedAccount) => {
    if (account.id === currentUser?.id) return;
    const provider = account.provider ?? 'email';
    if (provider === 'google') {
      signInWithGoogle(account.email);
    } else {
      setSelectedAccount(account);
      setPassword('');
    }
  };

  const handlePasswordSignIn = () => {
    if (!selectedAccount || !password.trim()) return;
    signIn(selectedAccount.email, password);
  };

  const closeModal = () => {
    setSelectedAccount(null);
    setPassword('');
  };

  // Non-active accounts count (can be removed)
  const removableCount = accounts.filter((a) => a.id !== currentUser?.id).length;

  const SECTION_ICONS: Record<string, { icon: React.ComponentProps<typeof MaterialCommunityIcons>['name']; color: string }> = {
    [t('accountSwitcher.userAccounts')]:      { icon: 'account-outline',         color: '#60A5FA' },
    [t('accountSwitcher.businessAccounts')]:  { icon: 'store-outline',            color: '#34D399' },
    [t('accountSwitcher.moderatorAccounts')]: { icon: 'shield-account-outline',   color: '#FBBF24' },
    [t('accountSwitcher.adminAccounts')]:     { icon: 'crown-outline',            color: '#F87171' },
  };

  const renderSection = (title: string, list: SavedAccount[]) => {
    if (list.length === 0) return null;
    const meta = SECTION_ICONS[title];
    return (
      <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
        <SectionHeader title={title} icon={meta?.icon} iconColor={meta?.color} />
        <Card>
          {list.map((account, index) => (
            <React.Fragment key={account.id}>
              {index > 0 && (
                <View
                  style={{
                    height: 1,
                    backgroundColor: theme.border,
                    marginHorizontal: 16,
                  }}
                />
              )}
              <AccountRow
                item={account}
                isActive={account.id === currentUser?.id}
                isEditing={isEditing}
                onPress={() => handleAccountPress(account)}
                onRemove={() => setAccountToRemove(account)}
              />
            </React.Fragment>
          ))}
        </Card>
      </View>
    );
  };

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
          <AppText style={{ fontSize: 24, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            {t('accountSwitcher.title')}
          </AppText>
          <AppText style={{ fontSize: 14, color: theme.textMuted }}>
            {t('accountSwitcher.subtitle')}
          </AppText>
        </View>

        {/* Accounts */}
        {isLoaded && accounts.length === 0 ? (
          <View style={{ paddingHorizontal: 20, alignItems: 'center', paddingVertical: 16 }}>
            <AppText style={{ color: theme.textMuted, fontSize: 14 }}>
              {t('accountSwitcher.noSavedAccounts')}
            </AppText>
          </View>
        ) : (
          <>
            {/* Edit toggle — only show if there are removable accounts */}
            {removableCount > 0 && (
              <View style={{ paddingHorizontal: 20, alignItems: 'flex-end', marginBottom: 8 }}>
                <Pressable
                  onPress={() => setIsEditing((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={isEditing ? t('accountSwitcher.doneEditing') : t('accountSwitcher.editAccounts')}
                  hitSlop={8}
                  style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
                >
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
                    {isEditing ? t('accountSwitcher.doneEditing') : t('accountSwitcher.editAccounts')}
                  </AppText>
                </Pressable>
              </View>
            )}

            {/* Hint shown during edit mode */}
            {isEditing && (
              <View
                style={{
                  marginHorizontal: 20,
                  marginBottom: 16,
                  backgroundColor: 'rgba(168,85,247,0.08)',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: `${colors.neonPurple}30`,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <AppText style={{ fontSize: 12, color: theme.textMuted, textAlign: 'center' }}>
                  {t('accountSwitcher.removeAccountNote')}
                </AppText>
              </View>
            )}

            {renderSection(t('accountSwitcher.userAccounts'), userAccounts)}
            {renderSection(t('accountSwitcher.businessAccounts'), businessAccounts)}
            {renderSection(t('accountSwitcher.moderatorAccounts'), moderatorAccounts)}
            {renderSection(t('accountSwitcher.adminAccounts'), adminAccounts)}
          </>
        )}

        {/* Sign in with other account */}
        <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
          <Pressable
            onPress={() => router.push('/(auth)/sign-in')}
            accessibilityLabel={t('accountSwitcher.signInOtherAccount')}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: theme.border,
              borderStyle: 'dashed',
            }}
          >
            <MaterialCommunityIcons name="login" size={22} color={theme.textMuted} />
            <AppText style={{ fontSize: 15, fontWeight: '500', color: theme.textMuted }}>
              {t('accountSwitcher.signInOtherAccount')}
            </AppText>
          </Pressable>
        </View>

        {/* Sign up with new account */}
        <View style={{ paddingHorizontal: 20 }}>
          <Pressable
            onPress={() => router.push('/(auth)/sign-up')}
            accessibilityLabel={t('accountSwitcher.signUpNewAccount')}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingVertical: 16,
              borderRadius: 16,
              borderWidth: 1.5,
              borderColor: `${colors.neonPurple}40`,
              borderStyle: 'dashed',
            }}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={22} color={colors.neonPurple} />
            <AppText style={{ fontSize: 15, fontWeight: '500', color: colors.neonPurple }}>
              {t('accountSwitcher.signUpNewAccount')}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Password Modal */}
      <Modal
        visible={selectedAccount !== null}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          onPress={closeModal}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Pressable
            onPress={() => {}}
            accessibilityRole="none"
            style={{
              width: '85%',
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 24,
            }}
          >
            {/* Account info */}
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <View
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  overflow: 'hidden',
                }}
              >
                {selectedAccount?.avatarUrl ? (
                  <Image
                    source={{ uri: selectedAccount.avatarUrl }}
                    style={{ width: 64, height: 64, borderRadius: 32 }}
                    accessibilityLabel={selectedAccount.displayName}
                  />
                ) : (
                  <AppText style={{ fontSize: 22, fontWeight: '700', color: theme.text }}>
                    {selectedAccount ? getInitials(selectedAccount.displayName) : ''}
                  </AppText>
                )}
              </View>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
                {t('accountSwitcher.passwordModalTitle')}
              </AppText>
              <AppText style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
                {t('accountSwitcher.passwordModalSubtitle')} {selectedAccount?.displayName}
              </AppText>
            </View>

            {/* Error */}
            {error && (
              <View
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  padding: 10,
                  marginBottom: 12,
                }}
              >
                <AppText style={{ color: '#F87171', fontSize: 13, textAlign: 'center' }}>{error}</AppText>
              </View>
            )}

            <AppInput
              placeholder={t('accountSwitcher.passwordPlaceholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              variant="pill"
              accessibilityLabel={t('accountSwitcher.passwordPlaceholder')}
            />

            <AppButton
              title={t('accountSwitcher.signInButton')}
              onPress={handlePasswordSignIn}
              isLoading={isLoading}
              disabled={!password.trim()}
              size="lg"
              shape="pill"
              style={{ marginTop: 4 }}
              accessibilityRole="button"
              accessibilityLabel={t('accountSwitcher.signInButton')}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Remove account confirmation modal */}
      <Modal
        visible={accountToRemove !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountToRemove(null)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => setAccountToRemove(null)}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Pressable
            onPress={() => {}}
            accessibilityRole="none"
            style={{
              width: '80%',
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 24,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                backgroundColor: 'rgba(239,68,68,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <MaterialCommunityIcons name="account-remove-outline" size={28} color="#EF4444" />
            </View>
            <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
              {t('accountSwitcher.removeConfirmTitle')}
            </AppText>
            <AppText style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              {t('accountSwitcher.removeConfirmMessage')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
              <Pressable
                onPress={() => setAccountToRemove(null)}
                accessibilityRole="button"
                accessibilityLabel={t('accountSwitcher.removeConfirmNo')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>
                  {t('accountSwitcher.removeConfirmNo')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (accountToRemove) remove(accountToRemove.id);
                  setAccountToRemove(null);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('accountSwitcher.removeConfirmYes')}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
                }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }}>
                  {t('accountSwitcher.removeConfirmYes')}
                </AppText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}
