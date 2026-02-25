import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
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

const SocialButton: React.FC<SocialButtonProps> = ({ onPress, children, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.cardDark,
      borderWidth: 1,
      borderColor: colors.borderDark,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </Pressable>
);

export default function SignInScreen() {
  useAnalyticsScreen(AnalyticsScreens.SIGN_IN);
  const router = useRouter();
  const { t } = useTranslation();
  const { signIn, signInWithGoogle, isLoading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    if (!email.trim() || !password.trim()) return;
    signIn(email.trim(), password);
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
          <AppText
            style={{
              fontSize: 32,
              fontWeight: '700',
              color: colors.textWhite,
              lineHeight: 40,
            }}
          >
            {t('auth.signIn.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 16,
              color: colors.textSlate400,
              fontWeight: '400',
              lineHeight: 24,
              marginTop: 8,
            }}
          >
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
            <AppText
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: colors.textSlate200,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              {t('auth.signIn.userType')}
            </AppText>
          </View>
        </View>

        {/* Social Login Section */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', gap: 16 }}>
          <AppText
            style={{
              fontSize: 14,
              fontWeight: '500',
              color: colors.textSlate400,
              textAlign: 'center',
            }}
          >
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
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(51, 65, 85, 0.5)' }} />
            <View style={{ backgroundColor: colors.midnight, paddingHorizontal: 8 }}>
              <AppText
                style={{
                  fontSize: 12,
                  color: colors.textSlate400,
                  textTransform: 'uppercase',
                }}
              >
                {t('auth.signIn.orEmail')}
              </AppText>
            </View>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(51, 65, 85, 0.5)' }} />
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
            <AppText style={{ color: '#F87171', fontSize: 14 }}>
              {error}
            </AppText>
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

          {/* Forgot Password */}
          <View style={{ alignItems: 'flex-end', paddingHorizontal: 8, marginBottom: 16 }}>
            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.signIn.forgotPassword')}
            >
              <AppText
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: colors.neonPurple,
                }}
              >
                {t('auth.signIn.forgotPassword')}
              </AppText>
            </Pressable>
          </View>

          {/* Login Button */}
          <AppButton
            title={t('auth.signIn.button')}
            onPress={handleSignIn}
            isLoading={isLoading}
            disabled={!email.trim() || !password.trim()}
            size="lg"
            shape="pill"
            icon={
              <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textWhite} />
            }
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

        {/* Footer */}
        <View style={{ marginTop: 'auto', paddingVertical: 32, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
              {t('auth.signIn.noAccount')}{' '}
            </AppText>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.signIn.swipeToSignUp')}
            >
              <AppText
                style={{
                  fontSize: 14,
                  color: colors.neonPurple,
                  fontWeight: '700',
                  marginLeft: 4,
                }}
              >
                {t('auth.signIn.swipeToSignUp')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
