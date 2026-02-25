import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddEmailForPasswordScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADD_EMAIL_FOR_PASSWORD);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { updateEmail } = useProfile(user?.id);

  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSendConfirmation = async () => {
    if (!user) return;

    setValidationError(null);

    if (!email.trim()) {
      setValidationError(t('addEmailForPassword.errorEmpty'));
      return;
    }

    if (!EMAIL_REGEX.test(email.trim())) {
      setValidationError(t('addEmailForPassword.errorInvalidEmail'));
      return;
    }

    setIsSending(true);
    await updateEmail(user.id, email.trim());
    setIsSending(false);

    Alert.alert(
      t('personalInfo.success'),
      t('addEmailForPassword.success'),
      [{ text: t('common.ok'), onPress: () => router.back() }]
    );
  };

  return (
    <ScreenLayout withKeyboardAvoid={true}>
      {/* Header */}
      <View className="px-6 pt-3 pb-4 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="p-2 rounded-full bg-slate-800/30 active:bg-slate-800/50"
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#FFFFFF" />
        </Pressable>
        <AppText className="text-base font-semibold text-white/90">
          {t('addEmailForPassword.title')}
        </AppText>
        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View className="items-center pt-6 pb-10 relative">
          {/* Neon glow background */}
          <View className="absolute top-1/2 w-56 h-56 rounded-full bg-purple-500/15 blur-[80px]" />

          {/* Mail Icon */}
          <View className="w-20 h-20 bg-card-dark border border-slate-700/30 rounded-full items-center justify-center shadow-neon-glow mb-6 z-10">
            <MaterialCommunityIcons name="email-outline" size={36} color="#A855F7" />
          </View>

          <AppText className="text-2xl font-bold text-white text-center mb-3 z-10">
            {t('addEmailForPassword.heading')}
          </AppText>
          <AppText className="text-slate-400 text-sm text-center leading-relaxed max-w-[300px] z-10">
            {t('addEmailForPassword.description')}
          </AppText>
        </View>

        {/* Form Section */}
        <View className="space-y-6">
          {/* Email Input */}
          <View>
            <AppText className="text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider">
              {t('addEmailForPassword.emailLabel')}
            </AppText>
            <View className="flex-row items-center w-full bg-card-dark border border-slate-700/50 rounded-xl px-4">
              <MaterialCommunityIcons
                name="at"
                size={20}
                color={email ? '#A855F7' : '#94A3B8'}
              />
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationError) setValidationError(null);
                }}
                className="flex-1 py-3.5 ml-3 text-slate-200 text-[15px]"
                placeholder={t('addEmailForPassword.emailPlaceholder')}
                placeholderTextColor="#475569"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSending}
                accessibilityLabel={t('addEmailForPassword.emailLabel')}
              />
            </View>
          </View>

          {/* Validation Error */}
          {validationError && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AppText className="text-red-400 text-sm">{validationError}</AppText>
            </View>
          )}
        </View>

        {/* Send Button */}
        <View className="mt-12">
          <AppButton
            variant="primary"
            size="large"
            onPress={handleSendConfirmation}
            isLoading={isSending}
            disabled={isSending || !email.trim()}
            className="shadow-lg shadow-purple-500/40"
            accessibilityLabel={t('addEmailForPassword.sendConfirmation')}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-2">
              <AppText className="text-white font-semibold text-lg">
                {isSending ? t('addEmailForPassword.sending') : t('addEmailForPassword.sendConfirmation')}
              </AppText>
              {!isSending && (
                <MaterialCommunityIcons name="send" size={18} color="#FFFFFF" />
              )}
            </View>
          </AppButton>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>
    </ScreenLayout>
  );
}
