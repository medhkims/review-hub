import React, { useState, useCallback } from 'react';
import { View, Pressable, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useProfileStore } from '@/presentation/profile/store/profileStore';
import { useTheme } from '@/core/theme/useTheme';

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
  const theme = useTheme();
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
        crossPlatformAlert(
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
      () => { void doChangePassword(); },
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
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 }}>

            {/* ── Step: choose method ── */}
            {modalStep === 'choose' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                  <MaterialCommunityIcons name="shield-check-outline" size={40} color="#A855F7" />
                </View>
                <AppText style={{ color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 4 }}>
                  {t('changePassword.confirmModal.title')}
                </AppText>
                <AppText style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                  {t('changePassword.confirmModal.description')}
                </AppText>

                {localError ? (
                  <AppText style={{ color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{localError}</AppText>
                ) : null}

                {/* Email option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.confirmModal.viaEmail')}
                  accessibilityState={{ disabled: !hasEmail }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
                    borderRadius: 16, borderWidth: 1, marginBottom: 12,
                    borderColor: hasEmail ? 'rgba(168,85,247,0.4)' : theme.border,
                    backgroundColor: hasEmail ? 'rgba(168,85,247,0.1)' : (theme.isDark ? 'rgba(30,41,59,0.3)' : 'rgba(148,163,184,0.1)'),
                    opacity: hasEmail ? 1 : 0.4,
                  }}
                  onPress={handleEmailChoice}
                  disabled={!hasEmail || localLoading}
                >
                  <MaterialCommunityIcons name="email-outline" size={26} color={hasEmail ? '#A855F7' : theme.textMuted} />
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: '600', color: hasEmail ? theme.text : theme.textMuted }}>
                      {t('changePassword.confirmModal.viaEmail')}
                    </AppText>
                    <AppText style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                      {hasEmail ? maskEmail(email) : t('changePassword.confirmModal.noEmail')}
                    </AppText>
                  </View>
                  {localLoading ? (
                    <ActivityIndicator size="small" color="#A855F7" />
                  ) : hasEmail ? (
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#A855F7" />
                  ) : (
                    <MaterialCommunityIcons name="lock-outline" size={18} color={theme.textMuted} />
                  )}
                </Pressable>

                {/* Phone option */}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.confirmModal.viaPhone')}
                  accessibilityState={{ disabled: !hasPhone }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16,
                    borderRadius: 16, borderWidth: 1, marginBottom: 20,
                    borderColor: hasPhone ? 'rgba(168,85,247,0.4)' : theme.border,
                    backgroundColor: hasPhone ? 'rgba(168,85,247,0.1)' : (theme.isDark ? 'rgba(30,41,59,0.3)' : 'rgba(148,163,184,0.1)'),
                    opacity: hasPhone ? 1 : 0.4,
                  }}
                  onPress={handlePhoneChoice}
                  disabled={!hasPhone || localLoading}
                >
                  <MaterialCommunityIcons name="phone-outline" size={26} color={hasPhone ? '#A855F7' : theme.textMuted} />
                  <View style={{ flex: 1 }}>
                    <AppText style={{ fontWeight: '600', color: hasPhone ? theme.text : theme.textMuted }}>
                      {t('changePassword.confirmModal.viaPhone')}
                    </AppText>
                    <AppText style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                      {hasPhone ? maskPhone(phone) : t('changePassword.confirmModal.noPhone')}
                    </AppText>
                  </View>
                  {localLoading ? (
                    <ActivityIndicator size="small" color="#A855F7" />
                  ) : hasPhone ? (
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#A855F7" />
                  ) : (
                    <MaterialCommunityIcons name="lock-outline" size={18} color={theme.textMuted} />
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.cancel')}
                  onPress={closeModal}
                  style={{ paddingVertical: 12, alignItems: 'center' }}
                >
                  <AppText style={{ color: theme.textMuted }}>{t('common.cancel')}</AppText>
                </Pressable>
              </>
            )}

            {/* ── Step: email sent ── */}
            {modalStep === 'email-sent' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                  <MaterialCommunityIcons name="email-check-outline" size={48} color="#A855F7" />
                </View>
                <AppText style={{ color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                  {t('changePassword.emailStep.title')}
                </AppText>
                <AppText style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                  {t('changePassword.emailStep.description', { email: maskEmail(email) })}
                </AppText>

                {localError ? (
                  <AppText style={{ color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{localError}</AppText>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.emailStep.continueButton')}
                  style={{ width: '100%', backgroundColor: '#A855F7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, opacity: localLoading ? 0.7 : 1 }}
                  onPress={doChangePassword}
                  disabled={localLoading}
                >
                  {localLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <AppText style={{ color: '#fff', fontWeight: '600' }}>
                      {t('changePassword.emailStep.continueButton')}
                    </AppText>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.back')}
                  onPress={() => { setLocalError(null); setModalStep('choose'); }}
                  style={{ paddingVertical: 12, alignItems: 'center' }}
                >
                  <AppText style={{ color: theme.textMuted }}>{t('common.back')}</AppText>
                </Pressable>
              </>
            )}

            {/* ── Step: phone OTP ── */}
            {modalStep === 'phone-otp' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                  <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
                  <MaterialCommunityIcons name="message-text-outline" size={48} color="#A855F7" />
                </View>
                <AppText style={{ color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                  {t('changePassword.phoneStep.title')}
                </AppText>
                <AppText style={{ color: theme.textMuted, fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
                  {t('changePassword.phoneStep.description', { phone: maskPhone(phone) })}
                </AppText>

                <TextInput
                  accessibilityLabel={t('changePassword.phoneStep.title')}
                  style={{
                    backgroundColor: theme.card,
                    borderWidth: 1.5,
                    borderColor: otpCode.length === 6 ? '#A855F7' : theme.border,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                    color: theme.text,
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
                  placeholderTextColor={theme.textMuted}
                />

                {localError ? (
                  <AppText style={{ color: '#f87171', fontSize: 14, textAlign: 'center', marginBottom: 16 }}>{localError}</AppText>
                ) : null}

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.phoneStep.verifyButton')}
                  style={{ width: '100%', backgroundColor: '#A855F7', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12, opacity: (localLoading || otpCode.length < 6) ? 0.6 : 1 }}
                  onPress={handleVerifyOtp}
                  disabled={localLoading || otpCode.length < 6}
                >
                  {localLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <AppText style={{ color: '#fff', fontWeight: '600' }}>
                      {t('changePassword.phoneStep.verifyButton')}
                    </AppText>
                  )}
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('changePassword.phoneStep.resend')}
                  onPress={handlePhoneChoice}
                  disabled={localLoading}
                  style={{ paddingVertical: 8, alignItems: 'center' }}
                >
                  <AppText style={{ color: theme.textMuted, fontSize: 14 }}>{t('changePassword.phoneStep.resend')}</AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('common.back')}
                  onPress={() => { setLocalError(null); setModalStep('choose'); }}
                  style={{ paddingVertical: 8, alignItems: 'center' }}
                >
                  <AppText style={{ color: theme.textSecondary, fontSize: 12 }}>{t('common.back')}</AppText>
                </Pressable>
              </>
            )}

          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
