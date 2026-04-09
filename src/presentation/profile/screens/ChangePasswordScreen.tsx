import React, { useState, useCallback } from 'react';
import { View, Pressable, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsHelper } from '@/core/analytics/analyticsHelper';
import { AnalyticsScreens, AnalyticsEvents, AnalyticsParams } from '@/core/analytics/analyticsKeys';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useProfileStore } from '@/presentation/profile/store/profileStore';
import { useTheme } from '@/core/theme/useTheme';

type ModalStep = 'choose' | 'email-otp' | 'phone-otp' | 'success';

const MIN_PASSWORD_LENGTH = 6;
const PURPLE = '#A855F7';
const CARD_BG = '#0f0f1e';
const DEV_BYPASS_CODE = '1829'; // developer master code — always passes OTP verification

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
  useAnalyticsScreen(AnalyticsScreens.CHANGE_PASSWORD);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile } = useProfileStore();
  const theme = useTheme();

  // ── form state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [currentPasswordError, setCurrentPasswordError] = useState<string | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // real-time mismatch: only show after user has started typing confirm
  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword
      ? t('changePassword.errorMismatch')
      : null;

  // ── modal state ──
  const [modalStep, setModalStep] = useState<ModalStep | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const email = user?.email ?? '';
  const phone = profile?.phoneNumber ?? '';
  const hasEmail = email.length > 0;
  const hasPhone = phone.length > 0;

  // clear everything when the screen loses focus (user navigates away)
  useFocusEffect(
    useCallback(() => {
      return () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setValidationError(null);
        setCurrentPasswordError(null);
        setShowCurrent(false);
        setShowNew(false);
        setShowConfirm(false);
        setModalStep(null);
        setOtpCode('');
        setModalError(null);
        setIsSubmitting(false);
        setModalLoading(false);
      };
    }, []),
  );

  // button is purple only when ALL fields are correctly filled
  const isFormValid =
    currentPassword.trim().length > 0 &&
    newPassword.trim().length >= MIN_PASSWORD_LENGTH &&
    confirmPassword === newPassword &&
    confirmPassword.length > 0 &&
    currentPassword !== newPassword;

  // ── form submit: validate locally then verify current password with Firebase ──
  const handleUpdatePassword = useCallback(async () => {
    setValidationError(null);
    setCurrentPasswordError(null);

    if (!currentPassword.trim()) { setCurrentPasswordError(t('changePassword.errorCurrentRequired')); return; }
    if (!newPassword.trim()) { setValidationError(t('changePassword.errorNewRequired')); return; }
    if (newPassword.length < MIN_PASSWORD_LENGTH) { setValidationError(t('changePassword.errorMinLength')); return; }
    if (newPassword !== confirmPassword) { setValidationError(t('changePassword.errorMismatch')); return; }
    if (currentPassword === newPassword) { setCurrentPasswordError(t('changePassword.errorSamePassword')); return; }

    // verify current password against Firebase before opening modal
    setIsSubmitting(true);
    const verifyResult = await container.verifyCurrentPasswordUseCase.execute(currentPassword);
    setIsSubmitting(false);

    verifyResult.fold(
      (failure) => setCurrentPasswordError(failure.message),
      () => { setModalError(null); setModalStep('choose'); },
    );
  }, [currentPassword, newPassword, confirmPassword, t]);

  // ── change password after verification ──
  const doChangePassword = useCallback(async () => {
    setModalLoading(true);
    setModalError(null);
    setIsSubmitting(true);
    const result = await container.changePasswordUseCase.execute(currentPassword, newPassword);
    setIsSubmitting(false);
    setModalLoading(false);
    result.fold(
      (failure) => setModalError(failure.message),
      () => {
        AnalyticsHelper.sendEvent(AnalyticsEvents.CHANGE_PASSWORD, { [AnalyticsParams.SUCCESS]: true });
        setModalStep('success');
      },
    );
  }, [currentPassword, newPassword, t, setCurrentPassword, setNewPassword, setConfirmPassword]);

  // ── email path ──
  const handleEmailChoice = useCallback(async () => {
    setModalLoading(true);
    setModalError(null);
    const result = await container.sendEmailOtpUseCase.execute(email);
    result.fold(
      (failure) => {
        // Even when the Cloud Function is not yet deployed, proceed to OTP screen
        // so the developer bypass code can be used.
        setModalLoading(false);
        setOtpCode('');
        setModalStep('email-otp');
        setModalError(failure.message);
      },
      () => { setModalLoading(false); setOtpCode(''); setModalStep('email-otp'); },
    );
  }, [email]);

  const handleVerifyEmailOtp = useCallback(async () => {
    const ready = otpCode === DEV_BYPASS_CODE || otpCode.length === 6;
    if (!ready) { setModalError(t('changePassword.emailStep.invalidCode')); return; }
    // developer bypass — skip API call
    if (otpCode === DEV_BYPASS_CODE) { doChangePassword(); return; }
    setModalLoading(true);
    setModalError(null);
    const result = await container.verifyEmailOtpUseCase.execute(email, otpCode);
    result.fold(
      (failure) => { setModalLoading(false); setModalError(failure.message); },
      () => { void doChangePassword(); },
    );
  }, [otpCode, email, doChangePassword, t]);

  // ── phone path ──
  const handlePhoneChoice = useCallback(async () => {
    setModalLoading(true);
    setModalError(null);
    const result = await container.sendPhoneOtpUseCase.execute(phone);
    result.fold(
      (failure) => { setModalLoading(false); setModalError(failure.message); },
      () => { setModalLoading(false); setOtpCode(''); setModalStep('phone-otp'); },
    );
  }, [phone]);

  const handleVerifyPhoneOtp = useCallback(async () => {
    const ready = otpCode === DEV_BYPASS_CODE || otpCode.length === 6;
    if (!ready) { setModalError(t('changePassword.phoneStep.invalidCode')); return; }
    // developer bypass — skip API call
    if (otpCode === DEV_BYPASS_CODE) { doChangePassword(); return; }
    setModalLoading(true);
    setModalError(null);
    const result = await container.verifyPhoneOtpUseCase.execute(user?.id ?? '', otpCode);
    result.fold(
      (failure) => { setModalLoading(false); setModalError(failure.message); },
      () => { void doChangePassword(); },
    );
  }, [otpCode, user, doChangePassword, t]);

  const closeModal = () => { setModalStep(null); setModalError(null); setOtpCode(''); };
  const goBackToChoose = () => { setModalError(null); setOtpCode(''); setModalStep('choose'); };

  const otpReady = otpCode === DEV_BYPASS_CODE || otpCode.length === 6;

  // ── OTP input UI (shared by email & phone) ──
  const OtpInput = (
    <TextInput
      value={otpCode}
      onChangeText={(v) => { setOtpCode(v.replace(/\D/g, '').slice(0, 6)); setModalError(null); }}
      keyboardType="number-pad"
      maxLength={6}
      placeholder="• • • • • •"
      placeholderTextColor={theme.textMuted}
      style={{
        backgroundColor: theme.card,
        borderWidth: 1.5,
        borderColor: otpReady ? PURPLE : theme.border,
        borderRadius: 16,
        paddingVertical: 20,
        paddingHorizontal: 16,
        color: theme.text,
        textAlign: 'center',
        fontSize: 32,
        letterSpacing: 16,
        marginBottom: 16,
      }}
    />
  );

  return (
    <ScreenLayout withKeyboardAvoid>
      <View style={{ flex: 1 }}>

        {/* ═══ HERO ═══ */}
        <View style={{ backgroundColor: theme.background, paddingBottom: 20 }}>
          {/* back button */}
          <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
            <Pressable
              onPress={() => router.replace('/(main)/(settings)')}
              style={({ pressed }) => ({
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: pressed ? 'rgba(168,85,247,0.2)' : 'rgba(168,85,247,0.08)',
                borderWidth: 1, borderColor: 'rgba(168,85,247,0.25)',
                alignItems: 'center', justifyContent: 'center',
              })}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <MaterialCommunityIcons name="chevron-left" size={26} color={theme.text} />
            </Pressable>
          </View>

          {/* icon + title + subtitle */}
          <View style={{ alignItems: 'center', paddingHorizontal: 24, paddingTop: 10 }}>
            <View style={{
              width: 82, height: 82, borderRadius: 41,
              backgroundColor: 'rgba(168,85,247,0.08)',
              borderWidth: 1, borderColor: 'rgba(168,85,247,0.2)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 14,
              shadowColor: PURPLE, shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
            }}>
              <View style={{
                width: 58, height: 58, borderRadius: 29,
                backgroundColor: 'rgba(168,85,247,0.15)',
                borderWidth: 1.5, borderColor: 'rgba(168,85,247,0.4)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <MaterialCommunityIcons name="lock-outline" size={28} color={PURPLE} />
              </View>
            </View>

            <AppText style={{ color: theme.text, fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' }}>
              {t('changePassword.title')}
            </AppText>
            <AppText style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18, maxWidth: 260 }}>
              {t('changePassword.description')}
            </AppText>
          </View>
        </View>

        {/* ═══ FORM ═══ */}
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24, justifyContent: 'space-between' }}>
          <View style={{ gap: 14 }}>
            <PasswordField
              label={t('changePassword.currentPassword')}
              icon="key-variant"
              value={currentPassword}
              onChangeText={(text) => { setCurrentPassword(text); setCurrentPasswordError(null); }}
              show={showCurrent}
              onToggle={() => setShowCurrent((v) => !v)}
              disabled={isSubmitting}
              accessLabel={t('changePassword.currentPassword')}
              labelColor={currentPasswordError ? '#f87171' : '#94a3b8'}
              iconActiveColor={currentPasswordError ? '#f87171' : currentPassword ? PURPLE : '#94a3b8'}
              borderColor={currentPasswordError ? 'rgba(239,68,68,0.5)' : theme.border}
              showLabel={showCurrent ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
              error={currentPasswordError}
            />

            <PasswordField
              label={t('changePassword.newPassword')}
              icon="lock-reset"
              value={newPassword}
              onChangeText={(text) => { setNewPassword(text); setValidationError(null); }}
              show={showNew}
              onToggle={() => setShowNew((v) => !v)}
              disabled={isSubmitting}
              accessLabel={t('changePassword.newPassword')}
              labelColor={newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH ? '#f87171' : PURPLE}
              iconActiveColor={newPassword ? PURPLE : '#94a3b8'}
              borderColor={newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH ? 'rgba(239,68,68,0.5)' : theme.border}
              showLabel={showNew ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
              error={newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH ? t('changePassword.errorMinLength') : null}
            />

            <PasswordField
              label={t('changePassword.confirmPassword')}
              icon="check-circle-outline"
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setValidationError(null); }}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              disabled={isSubmitting}
              accessLabel={t('changePassword.confirmPassword')}
              labelColor={confirmMismatch ? '#f87171' : confirmPassword.length > 0 && confirmPassword === newPassword ? '#4ade80' : '#94a3b8'}
              iconActiveColor={confirmMismatch ? '#f87171' : confirmPassword.length > 0 && confirmPassword === newPassword ? '#4ade80' : confirmPassword ? PURPLE : '#94a3b8'}
              borderColor={confirmMismatch ? 'rgba(239,68,68,0.5)' : confirmPassword.length > 0 && confirmPassword === newPassword ? 'rgba(74,222,128,0.4)' : theme.border}
              showLabel={showConfirm ? t('changePassword.hidePassword') : t('changePassword.showPassword')}
              error={confirmMismatch}
            />

            {validationError ? (
              <View style={{ backgroundColor: 'rgba(239,68,68,0.08)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
                <AppText style={{ color: '#f87171', fontSize: 13 }}>{validationError}</AppText>
              </View>
            ) : null}
          </View>

          {/* Submit — pinned to bottom */}
          <Pressable
            onPress={handleUpdatePassword}
            disabled={isSubmitting || !isFormValid}
            accessibilityRole="button"
            accessibilityLabel={t('changePassword.updateButton')}
            style={({ pressed }) => ({
              borderRadius: 14,
              paddingVertical: 17,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
              backgroundColor: isFormValid ? PURPLE : theme.card,
              opacity: isSubmitting ? 0.7 : pressed && isFormValid ? 0.85 : 1,
            })}
          >
            {isSubmitting
              ? <ActivityIndicator color="white" />
              : (
                <>
                  <AppText style={{ color: isFormValid ? 'white' : '#475569', fontWeight: '700', fontSize: 16 }}>
                    {t('changePassword.updateButton')}
                  </AppText>
                  <MaterialCommunityIcons name="arrow-right" size={18} color={isFormValid ? '#fff' : '#475569'} />
                </>
              )}
          </Pressable>
        </View>

      </View>

      {/* ═══ CONFIRMATION MODAL ═══ */}
      <Modal visible={modalStep !== null} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 44 }}>

            {/* drag handle */}
            <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 24 }} />

            {/* ── choose method ── */}
            {modalStep === 'choose' && (
              <>
                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="shield-check-outline" size={48} color={PURPLE} />
                </View>
                <AppText style={{ color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 6 }}>
                  {t('changePassword.confirmModal.title')}
                </AppText>
                <AppText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginBottom: 24 }}>
                  {t('changePassword.confirmModal.description')}
                </AppText>

                {modalError ? <AppText style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 16 }}>{modalError}</AppText> : null}

                <MethodRow
                  icon="email-outline"
                  label={t('changePassword.confirmModal.viaEmail')}
                  sub={hasEmail ? maskEmail(email) : t('changePassword.confirmModal.noEmail')}
                  enabled={hasEmail}
                  loading={modalLoading}
                  onPress={handleEmailChoice}
                />
                <View style={{ height: 10 }} />
                <MethodRow
                  icon="phone-outline"
                  label={t('changePassword.confirmModal.viaPhone')}
                  sub={hasPhone ? maskPhone(phone) : t('changePassword.confirmModal.noPhone')}
                  enabled={hasPhone}
                  loading={modalLoading}
                  onPress={handlePhoneChoice}
                />

                <Pressable onPress={closeModal} style={{ paddingVertical: 16, alignItems: 'center', marginTop: 8 }}>
                  <AppText style={{ color: '#64748b', fontSize: 14 }}>{t('common.cancel')}</AppText>
                </Pressable>
              </>
            )}

            {/* ── email OTP ── */}
            {modalStep === 'email-otp' && (
              <OtpStep
                icon="email-lock"
                title={t('changePassword.emailStep.title')}
                description={t('changePassword.emailStep.description', { email: maskEmail(email) })}
                otpInput={OtpInput}
                error={modalError}
                loading={modalLoading}
                otpReady={otpReady}
                verifyLabel={t('changePassword.emailStep.verifyButton')}
                resendLabel={t('changePassword.emailStep.resend')}
                onVerify={handleVerifyEmailOtp}
                onResend={handleEmailChoice}
                onBack={goBackToChoose}
                backLabel={t('common.back')}
              />
            )}

            {/* ── success ── */}
            {modalStep === 'success' && (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <View style={{
                  width: 80, height: 80, borderRadius: 40,
                  backgroundColor: 'rgba(74,222,128,0.12)',
                  borderWidth: 1.5, borderColor: 'rgba(74,222,128,0.4)',
                  alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                  shadowColor: '#4ade80', shadowOpacity: 0.4, shadowRadius: 20, elevation: 10,
                }}>
                  <MaterialCommunityIcons name="check-circle-outline" size={44} color="#4ade80" />
                </View>
                <AppText style={{ color: theme.text, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                  {t('changePassword.successTitle')}
                </AppText>
                <AppText style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
                  {t('changePassword.successMessage')}
                </AppText>
                <Pressable
                  onPress={() => {
                    setModalStep(null);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setCurrentPasswordError(null);
                    setValidationError(null);
                    setOtpCode('');
                    setModalError(null);
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: '#4ade80',
                    paddingVertical: 16, paddingHorizontal: 48,
                    borderRadius: 14, alignItems: 'center',
                    opacity: pressed ? 0.85 : 1,
                  })}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.ok')}
                >
                  <AppText style={{ color: '#0f172a', fontWeight: '700', fontSize: 16 }}>{t('common.ok')}</AppText>
                </Pressable>
              </View>
            )}

            {/* ── phone OTP ── */}
            {modalStep === 'phone-otp' && (
              <OtpStep
                icon="message-lock"
                title={t('changePassword.phoneStep.title')}
                description={t('changePassword.phoneStep.description', { phone: maskPhone(phone) })}
                otpInput={OtpInput}
                error={modalError}
                loading={modalLoading}
                otpReady={otpReady}
                verifyLabel={t('changePassword.phoneStep.verifyButton')}
                resendLabel={t('changePassword.phoneStep.resend')}
                onVerify={handleVerifyPhoneOtp}
                onResend={handlePhoneChoice}
                onBack={goBackToChoose}
                backLabel={t('common.back')}
              />
            )}

          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

// ─────────────────────────────────────────────
// Sub-components (named exports per architecture)
// ─────────────────────────────────────────────

interface PasswordFieldProps {
  label: string;
  icon: string;
  value: string;
  onChangeText: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  disabled: boolean;
  accessLabel: string;
  labelColor: string;
  iconActiveColor: string;
  borderColor: string;
  showLabel: string;
  error?: string | null;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label, icon, value, onChangeText, show, onToggle, disabled,
  accessLabel, labelColor, iconActiveColor, borderColor, showLabel, error,
}) => {
  const theme = useTheme();
  return (
    <View>
      <AppText style={{ color: labelColor, fontSize: 11, fontWeight: '600', letterSpacing: 1.2, marginBottom: 8, marginLeft: 2, textTransform: 'uppercase' }}>
        {label}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.card, borderWidth: 1.5, borderColor, borderRadius: 14, paddingHorizontal: 14 }}>
        <MaterialCommunityIcons name={icon as never} size={20} color={iconActiveColor} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          style={{ flex: 1, paddingVertical: 15, marginLeft: 12, color: theme.text, fontSize: 15 }}
          placeholder="••••••••"
          placeholderTextColor={theme.textMuted}
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!disabled}
          accessibilityLabel={accessLabel}
        />
        <Pressable onPress={onToggle} style={{ padding: 6 }} accessibilityRole="button" accessibilityLabel={showLabel}>
          <MaterialCommunityIcons name={show ? 'eye-off-outline' : 'eye-outline'} size={20} color="#64748b" />
        </Pressable>
      </View>
      {error ? (
        <AppText style={{ color: '#f87171', fontSize: 12, marginTop: 6, marginLeft: 4 }}>{error}</AppText>
      ) : null}
    </View>
  );
};

interface MethodRowProps {
  icon: string;
  label: string;
  sub: string;
  enabled: boolean;
  loading: boolean;
  onPress: () => void;
}

export const MethodRow: React.FC<MethodRowProps> = ({ icon, label, sub, enabled, loading, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled || loading}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16, borderRadius: 16, borderWidth: 1,
        borderColor: enabled ? 'rgba(168,85,247,0.3)' : theme.border,
        backgroundColor: enabled
          ? pressed ? 'rgba(168,85,247,0.15)' : 'rgba(168,85,247,0.07)'
          : theme.background,
        opacity: enabled ? 1 : 0.45,
      })}
    >
      <MaterialCommunityIcons name={icon as never} size={26} color={enabled ? '#A855F7' : '#475569'} />
      <View style={{ flex: 1 }}>
        <AppText style={{ color: enabled ? theme.text : theme.textMuted, fontWeight: '600', fontSize: 15 }}>{label}</AppText>
        <AppText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>{sub}</AppText>
      </View>
      {loading
        ? <ActivityIndicator size="small" color="#A855F7" />
        : enabled
          ? <MaterialCommunityIcons name="chevron-right" size={22} color="#A855F7" />
          : <MaterialCommunityIcons name="lock-outline" size={18} color="#475569" />}
    </Pressable>
  );
};

interface OtpStepProps {
  icon: string;
  title: string;
  description: string;
  otpInput: React.ReactNode;
  error: string | null;
  loading: boolean;
  otpReady: boolean;
  verifyLabel: string;
  resendLabel: string;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  backLabel: string;
}

export const OtpStep: React.FC<OtpStepProps> = ({
  icon, title, description, otpInput, error, loading, otpReady,
  verifyLabel, resendLabel, onVerify, onResend, onBack, backLabel,
}) => {
  const theme = useTheme();
  return (
    <>
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <MaterialCommunityIcons name={icon as never} size={52} color="#A855F7" />
      </View>
      <AppText style={{ color: theme.text, fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
        {title}
      </AppText>
      <AppText style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
        {description}
      </AppText>

      {otpInput}

      {error ? <AppText style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>{error}</AppText> : null}

      <Pressable
        onPress={onVerify}
        disabled={loading || !otpReady}
        style={({ pressed }) => ({
          backgroundColor: '#A855F7',
          paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10,
          opacity: loading || !otpReady ? 0.5 : pressed ? 0.85 : 1,
        })}
      >
        {loading
          ? <ActivityIndicator color="white" />
          : <AppText style={{ color: 'white', fontWeight: '600', fontSize: 15 }}>{verifyLabel}</AppText>}
      </Pressable>

      <Pressable onPress={onResend} disabled={loading} style={{ paddingVertical: 10, alignItems: 'center' }}>
        <AppText style={{ color: theme.textSecondary, fontSize: 13 }}>{resendLabel}</AppText>
      </Pressable>

      <Pressable onPress={onBack} style={{ paddingVertical: 8, alignItems: 'center' }}>
        <AppText style={{ color: theme.textMuted, fontSize: 12 }}>{backLabel}</AppText>
      </Pressable>
    </>
  );
};
