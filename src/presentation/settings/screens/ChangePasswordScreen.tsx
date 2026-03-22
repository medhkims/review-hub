import React, { useState, useCallback } from 'react';
import { View, Pressable, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useProfileStore } from '@/presentation/profile/store/profileStore';

type ModalStep = 'choose' | 'email-sent' | 'phone-otp';

function maskEmail(email: string): string {
  const atIdx = email.indexOf('@');
  if (atIdx <= 0) return email;
  const local = email.slice(0, atIdx);
  const domain = email.slice(atIdx);
  const visible = local.length <= 2 ? local[0] + '**' : local[0] + '***' + local[local.length - 1];
  return visible + domain;
}

function maskPhone(phone: string): string {
  if (phone.length <= 4) return '****';
  return phone.slice(0, -4).replace(/\d/g, '*') + phone.slice(-4);
}

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoading, setLoading, setError, error } = useAuthStore();
  const { profile } = useProfileStore();

  const changePasswordUseCase = container.changePasswordUseCase;
  const sendPhoneOtpUseCase = container.sendPhoneOtpUseCase;
  const verifyPhoneOtpUseCase = container.verifyPhoneOtpUseCase;
  const sendPasswordChangeEmailVerificationUseCase = container.sendPasswordChangeEmailVerificationUseCase;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const email = user?.email ?? '';
  const phone = profile?.phoneNumber ?? '';
  const hasEmail = email.length > 0;
  const hasPhone = phone.length > 0;

  const handleFormSubmit = useCallback(() => {
    setValidationError(null);
    setError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError(t('auth.fillAllFields'));
      return;
    }
    if (newPassword.length < 6) {
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

    setLocalError(null);
    setModalStep('choose');
  }, [currentPassword, newPassword, confirmPassword, t, setError]);

  const doChangePassword = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    const result = await changePasswordUseCase.execute(currentPassword, newPassword);
    result.fold(
      (failure) => {
        setLocalLoading(false);
        setLocalError(failure.message);
      },
      () => {
        setLocalLoading(false);
        setModalStep(null);
        Alert.alert(
          t('changePassword.successTitle'),
          t('changePassword.successMessage'),
          [{ text: t('common.ok'), onPress: () => router.back() }],
        );
      },
    );
  }, [currentPassword, newPassword, changePasswordUseCase, t, router]);

  const handleEmailChoice = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    const result = await sendPasswordChangeEmailVerificationUseCase.execute();
    result.fold(
      (failure) => {
        setLocalLoading(false);
        setLocalError(failure.message);
      },
      () => {
        setLocalLoading(false);
        setModalStep('email-sent');
      },
    );
  }, [sendPasswordChangeEmailVerificationUseCase]);

  const handlePhoneChoice = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);
    const result = await sendPhoneOtpUseCase.execute(phone);
    result.fold(
      (failure) => {
        setLocalLoading(false);
        setLocalError(failure.message);
      },
      () => {
        setLocalLoading(false);
        setOtpCode('');
        setModalStep('phone-otp');
      },
    );
  }, [phone, sendPhoneOtpUseCase]);

  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length < 6) {
      setLocalError(t('changePassword.phoneStep.invalidCode'));
      return;
    }
    setLocalLoading(true);
    setLocalError(null);
    const result = await verifyPhoneOtpUseCase.execute(user?.id ?? '', otpCode);
    result.fold(
      (failure) => {
        setLocalLoading(false);
        setLocalError(failure.message);
      },
      () => doChangePassword(),
    );
  }, [otpCode, user, verifyPhoneOtpUseCase, doChangePassword, t]);

  const closeModal = useCallback(() => {
    setModalStep(null);
    setLocalError(null);
    setOtpCode('');
  }, []);

  const displayError = validationError || error;

  return (
    <ScreenLayout>
      <View className="flex-1 px-6 w-full max-w-md mx-auto">
        {/* Icon header */}
        <View className="flex flex-col items-center justify-center py-10">
          <View className="relative flex items-center justify-center">
            <View className="absolute inset-0 bg-neon-purple opacity-30 blur-2xl rounded-full scale-150 transform translate-y-2" />
            <View className="relative bg-card-dark border border-neon-purple/20 p-5 rounded-full shadow-lg neon-glow">
              <MaterialCommunityIcons name="lock" size={40} color="#A855F7" />
            </View>
          </View>
          <AppText className="mt-6 text-slate-400 text-sm text-center max-w-[280px]">
            {t('changePassword.description')}
          </AppText>
        </View>

        {/* Form fields */}
        <View className="space-y-5 mt-2">
          <AppInput
            label={t('changePassword.currentPassword')}
            placeholder="••••••••"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <AppInput
            label={t('changePassword.newPassword')}
            placeholder="••••••••"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <AppInput
            label={t('changePassword.confirmPassword')}
            placeholder="••••••••"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          {displayError ? (
            <AppText className="text-red-400 text-sm text-center px-2">{displayError}</AppText>
          ) : null}
        </View>

        {/* Submit button */}
        <View className="mt-auto pb-6 pt-10">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('changePassword.updateButton')}
            className={`w-full bg-neon-purple py-4 rounded-xl shadow-lg shadow-purple-900/20 flex-row items-center justify-center gap-2 ${isLoading ? 'opacity-70' : ''}`}
            onPress={handleFormSubmit}
            disabled={isLoading}
          >
            <AppText className="text-white font-semibold">{t('changePassword.updateButton')}</AppText>
            <MaterialCommunityIcons name="arrow-right" size={18} color="white" />
          </Pressable>
        </View>
      </View>

      {/* ─── Confirmation Modal ─── */}
      <Modal
        visible={modalStep !== null}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-[#12122a] rounded-t-3xl px-6 pt-6 pb-10">

            {/* ── Step: choose method ── */}
            {modalStep === 'choose' && (
              <>
                <View className="items-center mb-5">
                  <View className="w-10 h-1 bg-slate-600 rounded-full mb-5" />
                  <MaterialCommunityIcons name="shield-check-outline" size={40} color="#A855F7" />
                </View>
                <AppText className="text-white text-lg font-bold text-center mb-1">
                  {t('changePassword.confirmModal.title')}
                </AppText>
                <AppText className="text-slate-400 text-sm text-center mb-6">
                  {t('changePassword.confirmModal.description')}
                </AppText>

                {localError ? (
                  <AppText className="text-red-400 text-sm text-center mb-4">{localError}</AppText>
                ) : null}

                {/* Email option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.confirmModal.viaEmail')}
                  accessibilityState={{ disabled: !hasEmail }}
                  className={`flex-row items-center gap-3 p-4 rounded-2xl border mb-3 ${
                    hasEmail
                      ? 'border-neon-purple/40 bg-neon-purple/10 active:opacity-80'
                      : 'border-slate-700 bg-slate-800/30 opacity-40'
                  }`}
                  onPress={handleEmailChoice}
                  disabled={!hasEmail || localLoading}
                >
                  <MaterialCommunityIcons
                    name="email-outline"
                    size={26}
                    color={hasEmail ? '#A855F7' : '#475569'}
                  />
                  <View className="flex-1">
                    <AppText className={`font-semibold ${hasEmail ? 'text-white' : 'text-slate-500'}`}>
                      {t('changePassword.confirmModal.viaEmail')}
                    </AppText>
                    <AppText className="text-slate-400 text-xs mt-0.5">
                      {hasEmail ? maskEmail(email) : t('changePassword.confirmModal.noEmail')}
                    </AppText>
                  </View>
                  {localLoading ? (
                    <ActivityIndicator size="small" color="#A855F7" />
                  ) : hasEmail ? (
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#A855F7" />
                  ) : (
                    <MaterialCommunityIcons name="lock-outline" size={18} color="#475569" />
                  )}
                </Pressable>

                {/* Phone option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.confirmModal.viaPhone')}
                  accessibilityState={{ disabled: !hasPhone }}
                  className={`flex-row items-center gap-3 p-4 rounded-2xl border mb-5 ${
                    hasPhone
                      ? 'border-neon-purple/40 bg-neon-purple/10 active:opacity-80'
                      : 'border-slate-700 bg-slate-800/30 opacity-40'
                  }`}
                  onPress={handlePhoneChoice}
                  disabled={!hasPhone || localLoading}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={26}
                    color={hasPhone ? '#A855F7' : '#475569'}
                  />
                  <View className="flex-1">
                    <AppText className={`font-semibold ${hasPhone ? 'text-white' : 'text-slate-500'}`}>
                      {t('changePassword.confirmModal.viaPhone')}
                    </AppText>
                    <AppText className="text-slate-400 text-xs mt-0.5">
                      {hasPhone ? maskPhone(phone) : t('changePassword.confirmModal.noPhone')}
                    </AppText>
                  </View>
                  {localLoading ? (
                    <ActivityIndicator size="small" color="#A855F7" />
                  ) : hasPhone ? (
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#A855F7" />
                  ) : (
                    <MaterialCommunityIcons name="lock-outline" size={18} color="#475569" />
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                  onPress={closeModal}
                  className="py-3 items-center"
                >
                  <AppText className="text-slate-400">{t('common.cancel')}</AppText>
                </Pressable>
              </>
            )}

            {/* ── Step: email sent ── */}
            {modalStep === 'email-sent' && (
              <>
                <View className="items-center mb-5">
                  <View className="w-10 h-1 bg-slate-600 rounded-full mb-5" />
                  <MaterialCommunityIcons name="email-check-outline" size={48} color="#A855F7" />
                </View>
                <AppText className="text-white text-lg font-bold text-center mb-2">
                  {t('changePassword.emailStep.title')}
                </AppText>
                <AppText className="text-slate-400 text-sm text-center mb-6 leading-5">
                  {t('changePassword.emailStep.description', { email: maskEmail(email) })}
                </AppText>

                {localError ? (
                  <AppText className="text-red-400 text-sm text-center mb-4">{localError}</AppText>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.emailStep.continueButton')}
                  className={`w-full bg-neon-purple py-4 rounded-xl items-center justify-center mb-3 ${localLoading ? 'opacity-70' : ''}`}
                  onPress={doChangePassword}
                  disabled={localLoading}
                >
                  {localLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <AppText className="text-white font-semibold">
                      {t('changePassword.emailStep.continueButton')}
                    </AppText>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.back')}
                  onPress={() => { setLocalError(null); setModalStep('choose'); }}
                  className="py-3 items-center"
                >
                  <AppText className="text-slate-400">{t('common.back')}</AppText>
                </Pressable>
              </>
            )}

            {/* ── Step: phone OTP ── */}
            {modalStep === 'phone-otp' && (
              <>
                <View className="items-center mb-4">
                  <View className="w-10 h-1 bg-slate-600 rounded-full mb-5" />
                  <MaterialCommunityIcons name="message-text-outline" size={48} color="#A855F7" />
                </View>
                <AppText className="text-white text-lg font-bold text-center mb-2">
                  {t('changePassword.phoneStep.title')}
                </AppText>
                <AppText className="text-slate-400 text-sm text-center mb-6">
                  {t('changePassword.phoneStep.description', { phone: maskPhone(phone) })}
                </AppText>

                <TextInput
                  accessibilityLabel={t('changePassword.phoneStep.title')}
                  style={{
                    backgroundColor: 'rgba(30,30,60,0.8)',
                    borderWidth: 1,
                    borderColor: otpCode.length === 6 ? '#A855F7' : '#334155',
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 28,
                    letterSpacing: 12,
                    marginBottom: 16,
                  }}
                  value={otpCode}
                  onChangeText={(v) => setOtpCode(v.replace(/\D/g, '').slice(0, 6))}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholder="------"
                  placeholderTextColor="#334155"
                />

                {localError ? (
                  <AppText className="text-red-400 text-sm text-center mb-4">{localError}</AppText>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.phoneStep.verifyButton')}
                  className={`w-full bg-neon-purple py-4 rounded-xl items-center justify-center mb-3 ${
                    localLoading || otpCode.length < 6 ? 'opacity-60' : ''
                  }`}
                  onPress={handleVerifyOtp}
                  disabled={localLoading || otpCode.length < 6}
                >
                  {localLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <AppText className="text-white font-semibold">
                      {t('changePassword.phoneStep.verifyButton')}
                    </AppText>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.phoneStep.resend')}
                  onPress={handlePhoneChoice}
                  disabled={localLoading}
                  className="py-2 items-center"
                >
                  <AppText className="text-slate-400 text-sm">{t('changePassword.phoneStep.resend')}</AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.back')}
                  onPress={() => { setLocalError(null); setModalStep('choose'); }}
                  className="py-2 items-center"
                >
                  <AppText className="text-slate-500 text-xs">{t('common.back')}</AppText>
                </Pressable>
              </>
            )}

          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
