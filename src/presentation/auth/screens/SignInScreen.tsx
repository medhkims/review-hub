import React, { useEffect, useState } from 'react';
import { View, Pressable, ScrollView, Image, Platform } from 'react-native';
import { AppModal } from '@/presentation/shared/components/ui/AppModal';
import { useRouter, Redirect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Svg, { Path } from 'react-native-svg';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAuth } from '../hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useSavedAccountsStore, SavedAccount } from '../store/savedAccountsStore';

const GoogleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      fill="#3B82F6"
    />
  </Svg>
);

const AppleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24">
    <Path
      d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.48-1.23 3.93-1.14 1.31.08 2.53.69 3.29 1.85-3.54 1.68-2.6 6.54 1.14 8.04-.63 1.43-1.49 2.85-2.74 4.09l-.7.69zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      fill="#FFFFFF"
    />
  </Svg>
);

interface SocialButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  accessibilityLabel: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ onPress, children, accessibilityLabel }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </Pressable>
  );
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function SignInScreen() {
  useAnalyticsScreen(AnalyticsScreens.SIGN_IN);
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { signIn, signInWithGoogle, isLoading, isAuthenticated, error } = useAuth();
  const { accounts, isLoaded, load, remove } = useSavedAccountsStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<SavedAccount | null>(null);
  const [accountPassword, setAccountPassword] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<SavedAccount | null>(null);

  useEffect(() => {
    if (!isLoaded) load();
  }, [isLoaded, load]);

  // Must be after all hooks — early return violates Rules of Hooks
  if (isAuthenticated) {
    return <Redirect href="/(main)/(feed)" />;
  }

  const hasSavedAccounts = accounts.length > 0;

  const userAccounts = accounts.filter((a) => a.type === 'user');
  const businessAccounts = accounts.filter((a) => a.type === 'business');
  const moderatorAccounts = accounts.filter((a) => a.type === 'moderator');
  const adminAccounts = accounts.filter((a) => a.type === 'admin');

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) return;
    signIn(email.trim(), password);
  };

  const handleAccountSignIn = () => {
    if (!selectedAccount || !accountPassword.trim()) return;
    signIn(selectedAccount.email, accountPassword);
  };

  const closeModal = () => {
    setSelectedAccount(null);
    setAccountPassword('');
  };

  return (
    <ScreenLayout withKeyboardAvoid>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={{ paddingTop: 16, paddingBottom: 8, paddingHorizontal: 24 }}>
          <AppText style={{ fontSize: 32, fontWeight: '700', color: theme.text, lineHeight: 40 }}>
            {t('auth.signIn.title')}
          </AppText>
          <AppText style={{ fontSize: 16, color: theme.textSecondary, fontWeight: '400', lineHeight: 24, marginTop: 8 }}>
            {t('auth.signIn.subtitle')}
          </AppText>
        </View>

        {/* User Type Badge */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              alignSelf: 'flex-start',
              height: 32,
              alignItems: 'center',
              gap: 8,
              borderRadius: 9999,
              backgroundColor: 'rgba(30, 41, 59, 0.5)',
              borderWidth: 1,
              borderColor: 'rgba(168, 85, 247, 0.2)',
              paddingHorizontal: 16,
            }}
          >
            <MaterialCommunityIcons name="account" size={18} color={colors.neonPurple} />
            <AppText style={{ fontSize: 12, fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t('auth.signIn.userType')}
            </AppText>
          </View>
        </View>

        {/* Saved Accounts Section */}
        {hasSavedAccounts && (
          <View style={{ paddingHorizontal: 24, marginBottom: 8 }}>
            {/* Header row with Edit toggle */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <AppText
                style={{
                  flex: 1,
                  fontSize: 11,
                  fontWeight: '700',
                  color: theme.textMuted,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                }}
              >
                {t('auth.signIn.savedAccounts')}
              </AppText>
              <Pressable
                onPress={() => setIsEditing((v) => !v)}
                accessibilityRole="button"
                accessibilityLabel={isEditing ? t('accountSwitcher.doneEditing') : t('accountSwitcher.editAccounts')}
                hitSlop={8}
                style={{ minWidth: 44, minHeight: 44, justifyContent: 'center' }}
              >
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
                  {isEditing ? t('accountSwitcher.doneEditing') : t('accountSwitcher.editAccounts')}
                </AppText>
              </Pressable>
            </View>

            {/* Render one card per group */}
            {(
              [
                { label: t('accountSwitcher.userAccounts'),      list: userAccounts,      icon: 'account-outline'        as const, color: '#60A5FA' },
                { label: t('accountSwitcher.businessAccounts'),  list: businessAccounts,  icon: 'store-outline'          as const, color: '#34D399' },
                { label: t('accountSwitcher.moderatorAccounts'), list: moderatorAccounts, icon: 'shield-account-outline' as const, color: '#FBBF24' },
                { label: t('accountSwitcher.adminAccounts'),     list: adminAccounts,     icon: 'crown-outline'          as const, color: '#F87171' },
              ]
            )
              .filter(({ list }) => list.length > 0)
              .map(({ label, list, icon, color }) => (
                <View key={label} style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, marginLeft: 2 }}>
                    <MaterialCommunityIcons name={icon} size={15} color={color} />
                    <AppText
                      style={{
                        fontSize: 10,
                        fontWeight: '700',
                        color: colors.textSlate500,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </AppText>
                  </View>
                  <View
                    style={{
                      backgroundColor: theme.card,
                      borderRadius: 16,
                      borderWidth: 1,
                      borderColor: theme.border,
                      overflow: 'hidden',
                    }}
                  >
                    {list.map((account, index) => (
                      <React.Fragment key={account.id}>
                        {index > 0 && (
                          <View style={{ height: 1, backgroundColor: `${theme.border}`, opacity: 0.4, marginHorizontal: 16 }} />
                        )}
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          {isEditing && (
                            <Pressable
                              onPress={() => setAccountToRemove(account)}
                              accessibilityRole="button"
                              accessibilityLabel={`Remove ${account.displayName}`}
                              hitSlop={8}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#EF4444',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginLeft: 16,
                              }}
                            >
                              <MaterialCommunityIcons name="minus" size={14} color={colors.textWhite} />
                            </Pressable>
                          )}
                        <Pressable
                          onPress={() => {
                            if (isEditing) return;
                            const provider = account.provider ?? 'email';
                            if (provider === 'google') {
                              signInWithGoogle(account.email);
                            } else {
                              setSelectedAccount(account);
                              setAccountPassword('');
                            }
                          }}
                          accessibilityLabel={`Sign in as ${account.displayName}`}
                          accessibilityRole="button"
                          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 }}
                        >
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
                            {account.avatarUrl ? (
                              <Image
                                source={{ uri: account.avatarUrl }}
                                style={{ width: 44, height: 44, borderRadius: 22 }}
                                accessibilityLabel={account.displayName}
                              />
                            ) : (
                              <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                                {getInitials(account.displayName)}
                              </AppText>
                            )}
                          </View>
                          <View style={{ flex: 1 }}>
                            <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
                              {account.displayName}
                            </AppText>
                            <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                              {account.email}
                            </AppText>
                          </View>
                          {!isEditing && (account.provider === 'google' ? (
                            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center' }}>
                              <Svg width={18} height={18} viewBox="0 0 24 24">
                                <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                              </Svg>
                            </View>
                          ) : (
                            <MaterialCommunityIcons name="chevron-right" size={20} color={theme.textMuted} />
                          ))}
                        </Pressable>
                        </View>
                      </React.Fragment>
                    ))}
                  </View>
                </View>
              ))}

            {/* Use another account toggle */}
            <Pressable
              onPress={() => setShowEmailForm((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t('auth.signIn.useAnotherAccount')}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, alignSelf: 'center' }}
            >
              <MaterialCommunityIcons
                name={showEmailForm ? 'chevron-up' : 'account-plus-outline'}
                size={18}
                color={colors.neonPurple}
              />
              <AppText style={{ fontSize: 14, color: colors.neonPurple, fontWeight: '600' }}>
                {t('auth.signIn.useAnotherAccount')}
              </AppText>
            </Pressable>
          </View>
        )}

        {/* Social Login Section — always shown when no saved accounts, toggleable otherwise */}
        {(!hasSavedAccounts || showEmailForm) && (
          <>
            <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', gap: 16 }}>
              <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.textSecondary, textAlign: 'center' }}>
                {t('auth.signIn.socialPrompt')}
              </AppText>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24 }}>
                <SocialButton onPress={signInWithGoogle} accessibilityLabel={t('auth.signIn.socialPrompt')}>
                  <GoogleIcon />
                </SocialButton>
                <SocialButton onPress={() => {}} accessibilityLabel="Sign in with Facebook">
                  <FacebookIcon />
                </SocialButton>
                <SocialButton onPress={() => {}} accessibilityLabel="Sign in with Apple">
                  <AppleIcon />
                </SocialButton>
              </View>
            </View>

            {/* Divider */}
            <View style={{ paddingHorizontal: 24, paddingVertical: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                <View style={{ backgroundColor: theme.background, paddingHorizontal: 8 }}>
                  <AppText style={{ fontSize: 12, color: theme.textSecondary, textTransform: 'uppercase' }}>
                    {t('auth.signIn.orEmail')}
                  </AppText>
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
              </View>
            </View>

            {/* Error Message */}
            {error && (
              <View
                style={{
                  marginHorizontal: 24,
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 9999,
                  padding: 12,
                  paddingHorizontal: 20,
                  marginBottom: 8,
                }}
              >
                <AppText style={{ color: '#F87171', fontSize: 14 }}>{error}</AppText>
              </View>
            )}

            {/* Login Form */}
            <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
              <AppInput
                label={t('auth.signIn.email')}
                placeholder={t('auth.signIn.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                variant="pill"
                accessibilityLabel={t('auth.signIn.email')}
              />
              <AppInput
                label={t('auth.signIn.password')}
                placeholder={t('auth.signIn.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                textContentType="password"
                variant="pill"
                accessibilityLabel={t('auth.signIn.password')}
              />

              <View style={{ alignItems: 'flex-end', paddingHorizontal: 8, marginBottom: 16 }}>
                <Pressable
                  onPress={() => router.push('/(auth)/forgot-password')}
                  accessibilityRole="link"
                  accessibilityLabel={t('auth.signIn.forgotPassword')}
                >
                  <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
                    {t('auth.signIn.forgotPassword')}
                  </AppText>
                </Pressable>
              </View>

              <AppButton
                title={t('auth.signIn.button')}
                onPress={handleSignIn}
                isLoading={isLoading}
                disabled={!email.trim() || !password.trim()}
                size="lg"
                shape="pill"
                icon={<MaterialCommunityIcons name="arrow-right" size={20} color={colors.textWhite} />}
                style={{
                  shadowColor: colors.neonPurple,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  elevation: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signIn.button')}
              />
            </View>
          </>
        )}

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingVertical: 32, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText style={{ fontSize: 14, color: theme.textSecondary }}>
              {t('auth.signIn.noAccount')}{' '}
            </AppText>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.signIn.swipeToSignUp')}
            >
              <AppText style={{ fontSize: 14, color: colors.neonPurple, fontWeight: '700', marginLeft: 4 }}>
                {t('auth.signIn.swipeToSignUp')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Password Modal for saved account */}
      <AppModal
        visible={selectedAccount !== null}
        transparent
        animationType="fade"
        onDismiss={closeModal}
      >
          <View
            style={{
              width: 320,
              backgroundColor: theme.card,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 24,
            }}
          >
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
              <AppText style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center' }}>
                {t('accountSwitcher.passwordModalSubtitle')} {selectedAccount?.displayName}
              </AppText>
            </View>

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
              value={accountPassword}
              onChangeText={setAccountPassword}
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              variant="pill"
              accessibilityLabel={t('accountSwitcher.passwordPlaceholder')}
            />

            <AppButton
              title={t('accountSwitcher.signInButton')}
              onPress={handleAccountSignIn}
              isLoading={isLoading}
              disabled={!accountPassword.trim()}
              size="lg"
              shape="pill"
              style={{ marginTop: 4 }}
              accessibilityRole="button"
              accessibilityLabel={t('accountSwitcher.signInButton')}
            />
          </View>
      </AppModal>

      {/* Remove account confirmation modal */}
      <AppModal
        visible={accountToRemove !== null}
        transparent
        animationType="fade"
        onDismiss={() => setAccountToRemove(null)}
      >
          <View
            style={{
              width: 300,
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
            <AppText style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
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
                <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}>
                  {t('accountSwitcher.removeConfirmYes')}
                </AppText>
              </Pressable>
            </View>
          </View>
      </AppModal>
    </ScreenLayout>
  );
}
