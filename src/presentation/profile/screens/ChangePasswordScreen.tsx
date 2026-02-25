import React, { useState } from 'react';
import { View, ScrollView, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsScreens, AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';
import { container } from '@/core/di/container';

const MIN_PASSWORD_LENGTH = 6;

export default function ChangePasswordScreen() {
  useAnalyticsScreen(AnalyticsScreens.CHANGE_PASSWORD);
  const { t } = useTranslation();
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const clearError = () => {
    if (validationError) setValidationError(null);
  };

  const handleUpdatePassword = async () => {
    setValidationError(null);

    if (!currentPassword.trim()) {
      setValidationError(t('changePassword.errorCurrentRequired'));
      return;
    }

    if (!newPassword.trim()) {
      setValidationError(t('changePassword.errorNewRequired'));
      return;
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setValidationError(t('changePassword.errorMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('changePassword.errorMismatch'));
      return;
    }

    if (currentPassword === newPassword) {
      setValidationError(t('changePassword.errorSamePassword'));
      return;
    }

    setIsSubmitting(true);

    const result = await container.changePasswordUseCase.execute(
      currentPassword,
      newPassword
    );

    setIsSubmitting(false);

    result.fold(
      (failure) => {
        setValidationError(failure.message);
      },
      () => {
        AnalyticsHelper.sendEvent(AnalyticsEvents.CHANGE_PASSWORD, {
          [AnalyticsParams.SUCCESS]: true,
        });
        router.replace('/(main)/(profile)/confirm-password-email');
      }
    );
  };

  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= MIN_PASSWORD_LENGTH &&
    confirmPassword.trim().length > 0;

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
          {t('changePassword.title')}
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

          {/* Lock Icon */}
          <View className="w-20 h-20 bg-card-dark border border-slate-700/30 rounded-full items-center justify-center shadow-neon-glow mb-6 z-10">
            <MaterialCommunityIcons name="lock-outline" size={36} color="#A855F7" />
          </View>

          <AppText className="text-slate-400 text-sm text-center leading-relaxed max-w-[280px] z-10">
            {t('changePassword.description')}
          </AppText>
        </View>

        {/* Form Section */}
        <View className="space-y-6">
          {/* Current Password */}
          <View>
            <AppText className="text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider">
              {t('changePassword.currentPassword')}
            </AppText>
            <View className="flex-row items-center w-full bg-card-dark border border-slate-700/50 rounded-xl px-4">
              <MaterialCommunityIcons
                name="key-variant"
                size={20}
                color={currentPassword ? '#A855F7' : '#94A3B8'}
              />
              <TextInput
                value={currentPassword}
                onChangeText={(text) => {
                  setCurrentPassword(text);
                  clearError();
                }}
                className="flex-1 py-3.5 ml-3 text-slate-200 text-[15px]"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel={t('changePassword.currentPassword')}
              />
              <Pressable
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                accessibilityLabel={showCurrentPassword ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={showCurrentPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>
          </View>

          {/* New Password */}
          <View>
            <AppText className="text-xs font-medium text-neon-purple mb-2 ml-1 uppercase tracking-wider">
              {t('changePassword.newPassword')}
            </AppText>
            <View className="flex-row items-center w-full bg-card-dark border border-slate-700/50 rounded-xl px-4">
              <MaterialCommunityIcons
                name="lock-reset"
                size={20}
                color={newPassword ? '#A855F7' : '#94A3B8'}
              />
              <TextInput
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  clearError();
                }}
                className="flex-1 py-3.5 ml-3 text-slate-200 text-[15px]"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel={t('changePassword.newPassword')}
              />
              <Pressable
                onPress={() => setShowNewPassword(!showNewPassword)}
                accessibilityLabel={showNewPassword ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>
          </View>

          {/* Confirm New Password */}
          <View>
            <AppText className="text-xs font-medium text-slate-400 mb-2 ml-1 uppercase tracking-wider">
              {t('changePassword.confirmPassword')}
            </AppText>
            <View className="flex-row items-center w-full bg-card-dark border border-slate-700/50 rounded-xl px-4">
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color={confirmPassword ? '#A855F7' : '#94A3B8'}
              />
              <TextInput
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  clearError();
                }}
                className="flex-1 py-3.5 ml-3 text-slate-200 text-[15px]"
                placeholder="••••••••"
                placeholderTextColor="#475569"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                accessibilityLabel={t('changePassword.confirmPassword')}
              />
              <Pressable
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                accessibilityLabel={showConfirmPassword ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#94A3B8"
                />
              </Pressable>
            </View>
          </View>

          {/* Validation Error */}
          {validationError && (
            <View className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AppText className="text-red-400 text-sm">{validationError}</AppText>
            </View>
          )}
        </View>

        {/* Update Button */}
        <View className="mt-12">
          <AppButton
            variant="primary"
            size="large"
            onPress={handleUpdatePassword}
            isLoading={isSubmitting}
            disabled={isSubmitting || !isFormValid}
            className="shadow-lg shadow-purple-500/40"
            accessibilityLabel={t('changePassword.updateButton')}
            accessibilityRole="button"
          >
            <View className="flex-row items-center gap-2">
              <AppText className="text-white font-semibold text-lg">
                {t('changePassword.updateButton')}
              </AppText>
              {!isSubmitting && (
                <MaterialCommunityIcons name="arrow-right" size={18} color="#FFFFFF" />
              )}
            </View>
          </AppButton>
        </View>

        {/* Bottom spacing for tab bar */}
        <View className="h-24" />
      </ScrollView>
    </ScreenLayout>
  );
}
