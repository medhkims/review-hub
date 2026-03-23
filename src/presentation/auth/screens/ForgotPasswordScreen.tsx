import React, { useState, useCallback } from 'react';
import { View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSend = useCallback(async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError(null);
    const result = await container.sendPasswordResetEmailUseCase.execute(email.trim());
    result.fold(
      (failure) => setError(failure.message),
      () => setSent(true),
    );
    setIsLoading(false);
  }, [email]);

  return (
    <ScreenLayout>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.neonPurple + '22',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            <MaterialCommunityIcons name="lock-reset" size={28} color={colors.neonPurple} />
          </View>

          <AppText style={{ fontSize: 26, fontWeight: '700', color: theme.text, marginBottom: 8 }}>
            {t('auth.forgotPasswordScreen.title')}
          </AppText>
          <AppText style={{ fontSize: 15, color: theme.textSecondary, lineHeight: 22 }}>
            {t('auth.forgotPasswordScreen.subtitle')}
          </AppText>
        </View>

        {sent ? (
          /* Success state */
          <View style={{ paddingHorizontal: 24, paddingTop: 32, alignItems: 'center' }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#10B98122',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <MaterialCommunityIcons name="email-check-outline" size={36} color="#10B981" />
            </View>
            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginBottom: 10, textAlign: 'center' }}>
              {t('auth.forgotPasswordScreen.successTitle')}
            </AppText>
            <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, paddingHorizontal: 8 }}>
              {t('auth.forgotPasswordScreen.successMessage', { email })}
            </AppText>

            <AppButton
              title={t('auth.forgotPasswordScreen.backToSignIn')}
              onPress={() => router.replace('/(auth)/sign-in')}
              size="lg"
              shape="pill"
              style={{ marginTop: 32, width: '100%' }}
              accessibilityLabel={t('auth.forgotPasswordScreen.backToSignIn')}
            />
          </View>
        ) : (
          /* Form state */
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            {error && (
              <View
                style={{
                  backgroundColor: '#F8717120',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#F87171" />
                <AppText style={{ color: '#F87171', fontSize: 14, flex: 1 }}>{error}</AppText>
              </View>
            )}

            <AppInput
              label={t('auth.forgotPasswordScreen.email')}
              placeholder={t('auth.forgotPasswordScreen.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              variant="pill"
              accessibilityLabel={t('auth.forgotPasswordScreen.email')}
            />

            <AppButton
              title={isLoading ? t('auth.forgotPasswordScreen.sending') : t('auth.forgotPasswordScreen.button')}
              onPress={handleSend}
              isLoading={isLoading}
              disabled={!email.trim()}
              size="lg"
              shape="pill"
              style={{ marginTop: 8 }}
              icon={<MaterialCommunityIcons name="send-outline" size={18} color={colors.textWhite} />}
              accessibilityLabel={t('auth.forgotPasswordScreen.button')}
            />

            <View style={{ alignItems: 'center', marginTop: 24 }}>
              <AppButton
                title={t('auth.forgotPasswordScreen.backToSignIn')}
                onPress={() => router.back()}
                variant="ghost"
                size="sm"
                accessibilityLabel={t('auth.forgotPasswordScreen.backToSignIn')}
              />
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
