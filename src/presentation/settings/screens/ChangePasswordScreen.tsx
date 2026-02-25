import React, { useState, useCallback } from 'react';
import { View, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const changePasswordUseCase = container.changePasswordUseCase;
  const { isLoading, setLoading, setError, error } = useAuthStore();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChangePassword = useCallback(async () => {
    setValidationError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError(t('auth.fillAllFields'));
      return;
    }

    if (newPassword.length < 6) {
      setValidationError(t('auth.passwordMinLength'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setValidationError(t('auth.passwordsDoNotMatch'));
      return;
    }

    setLoading(true);
    const result = await changePasswordUseCase.execute(currentPassword, newPassword);
    
    result.fold(
      (failure) => {
        setError(failure.message);
        setLoading(false);
      },
      () => {
        setLoading(false);
        Alert.alert(
          t('common.success'),
          t('auth.passwordChangedSuccess'),
          [{ text: 'OK', onPress: () => router.back() }]
        );
      }
    );
  }, [currentPassword, newPassword, confirmPassword, changePasswordUseCase, setLoading, setError, t, router]);

  const displayError = validationError || error;

  return (
    <ScreenLayout>
      <View className="flex-1 px-6 w-full max-w-md mx-auto">
        <View className="flex flex-col items-center justify-center py-10">
          <View className="relative flex items-center justify-center">
            <View className="absolute inset-0 bg-neon-purple opacity-30 blur-2xl rounded-full scale-150 transform translate-y-2" />
            <View className="relative bg-card-dark border border-neon-purple/20 p-5 rounded-full shadow-lg neon-glow">
              <MaterialCommunityIcons name="lock" size={40} color="#A855F7" />
            </View>
          </View>
          <AppText className="mt-6 text-slate-400 text-sm text-center max-w-[280px]">
            {t('auth.createStrongPassword')}
          </AppText>
        </View>

        <View className="space-y-5 mt-2">
          <AppInput
            label={t('auth.currentPassword')}
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <AppInput
            label={t('auth.newPassword')}
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <AppInput
            label={t('auth.confirmNewPassword')}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {displayError && (
            <AppText className="text-red-400 text-sm text-center px-2">
              {displayError}
            </AppText>
          )}
        </View>

        <View className="mt-auto pb-6 pt-10">
          <Pressable
            className={`w-full bg-neon-purple py-4 rounded-xl shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleChangePassword}
            disabled={isLoading}
          >
            <AppText className="text-white font-semibold">
              {isLoading ? t('common.loading') : t('auth.updatePassword')}
            </AppText>
            {!isLoading && (
              <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
            )}
          </Pressable>
        </View>
      </View>
    </ScreenLayout>
  );
}
