import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { COUNTRIES, Country, findCountryByDialCode } from '@/core/utils/countries';

type Step = 'phone' | 'country' | 'otp';

const DEV_BYPASS_CODE = '1829';

interface PhoneVerificationModalProps {
  visible: boolean;
  businessId: string;
  initialPhone: string | null;
  onVerified: () => void;
  onDismiss: () => void;
}

function parsePhone(p: string | null): { country: Country; number: string } {
  const defaultCountry = findCountryByDialCode('+216') ?? COUNTRIES[0];
  if (!p) return { country: defaultCountry, number: '' };
  const full = p.startsWith('+') ? p : `+216${p}`;
  for (const len of [4, 3, 2, 1]) {
    const prefix = full.slice(0, len + 1);
    const found = findCountryByDialCode(prefix);
    if (found) {
      return { country: found, number: full.slice(prefix.length).trim() };
    }
  }
  return { country: defaultCountry, number: full };
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function PhoneVerificationModal({
  visible,
  businessId,
  initialPhone,
  onVerified,
  onDismiss,
}: PhoneVerificationModalProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [step, setStep] = useState<Step>('phone');
  const [selectedCountry, setSelectedCountry] = useState<Country>(() => parsePhone(initialPhone).country);
  const [phoneNumber, setPhoneNumber] = useState(() => parsePhone(initialPhone).number);
  const [pickerSearch, setPickerSearch] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      const parsed = parsePhone(initialPhone);
      setSelectedCountry(parsed.country);
      setPhoneNumber(parsed.number);
      setStep('phone');
      setOtp(['', '', '', '', '', '']);
      setError(null);
      setCountdown(0);
      setPickerSearch('');
    }
  }, [visible, initialPhone]);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = useCallback(() => {
    setCountdown(60);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleSendCode = useCallback(() => {
    const digits = phoneNumber.trim().replace(/\D/g, '');
    if (digits.length < 6) {
      setError(t('phoneVerification.phoneMinLength'));
      return;
    }
    setError(null);
    setStep('otp');
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, [phoneNumber, t, startCountdown]);

  const handleOtpChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError(null);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  }, [otp]);

  const handleOtpKeyPress = useCallback((key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleVerify = useCallback(async () => {
    const code = otp.join('');
    if (code !== DEV_BYPASS_CODE && code.length < 6) {
      setError(t('phoneVerification.otpIncomplete'));
      return;
    }
    setIsVerifying(true);
    setError(null);
    const result = await container.updateBusinessUseCase.execute(businessId, {
      'contact.phone_verified': true,
    });
    result.fold(
      (failure) => { setError(failure.message); setIsVerifying(false); },
      () => { setIsVerifying(false); onVerified(); },
    );
  }, [otp, businessId, t, onVerified]);

  const handleResend = useCallback(() => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    setError(null);
    startCountdown();
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, [countdown, startCountdown]);

  const filteredCountries = pickerSearch.trim()
    ? COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        c.dialCode.includes(pickerSearch),
      )
    : COUNTRIES;

  const renderCountryItem = useCallback(({ item }: { item: Country }) => (
    <Pressable
      onPress={() => {
        setSelectedCountry(item);
        setPickerSearch('');
        setStep('phone');
        setError(null);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${item.name} ${item.dialCode}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 20,
        backgroundColor:
          item.code === selectedCountry.code
            ? 'rgba(168,85,247,0.1)'
            : pressed
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
      })}
    >
      <AppText style={{ fontSize: 24 }}>{item.flag}</AppText>
      <AppText style={{ flex: 1, fontSize: 15, color: theme.text }}>{item.name}</AppText>
      <AppText style={{ fontSize: 14, color: theme.textSecondary }}>{item.dialCode}</AppText>
      {item.code === selectedCountry.code && (
        <MaterialCommunityIcons name="check" size={16} color={colors.neonPurple} />
      )}
    </Pressable>
  ), [selectedCountry.code, theme]);

  // Sheet height: tall for country picker, auto for other steps
  const isCountryStep = step === 'country';
  const sheetStyle = isCountryStep
    ? {
        height: SCREEN_HEIGHT * 0.78,
        backgroundColor: theme.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingTop: 16,
      }
    : {
        backgroundColor: theme.card,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: 1,
        borderTopColor: theme.border,
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 28,
        paddingTop: 20,
      };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (step === 'country') { setStep('phone'); setPickerSearch(''); }
      }}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} />

        {/* Sheet */}
        <View style={sheetStyle}>
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: theme.border,
              alignSelf: 'center',
              marginBottom: isCountryStep ? 16 : 24,
            }}
          />

          {/* ── Country picker step ── */}
          {step === 'country' && (
            <>
              {/* Header row */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  marginBottom: 14,
                  gap: 10,
                }}
              >
                <Pressable
                  onPress={() => { setStep('phone'); setPickerSearch(''); }}
                  accessibilityRole="button"
                  accessibilityLabel="Back"
                  style={{ padding: 4 }}
                >
                  <MaterialCommunityIcons name="arrow-left" size={22} color={theme.textSecondary} />
                </Pressable>
                <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text, flex: 1 }}>
                  {t('phoneVerification.selectCountry')}
                </AppText>
              </View>

              {/* Search bar */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginHorizontal: 16,
                  marginBottom: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  paddingHorizontal: 12,
                  gap: 8,
                }}
              >
                <MaterialCommunityIcons name="magnify" size={18} color={theme.textSecondary} />
                <TextInput
                  value={pickerSearch}
                  onChangeText={setPickerSearch}
                  placeholder={t('phoneVerification.searchCountry')}
                  placeholderTextColor={theme.textMuted}
                  autoFocus
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    fontSize: 15,
                    color: theme.text,
                  }}
                />
                {!!pickerSearch && (
                  <Pressable
                    onPress={() => setPickerSearch('')}
                    accessibilityRole="button"
                    accessibilityLabel="Clear search"
                  >
                    <MaterialCommunityIcons name="close-circle" size={16} color={theme.textSecondary} />
                  </Pressable>
                )}
              </View>

              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                renderItem={renderCountryItem}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}
              />
            </>
          )}

          {/* ── Phone & OTP steps ── */}
          {step !== 'country' && (
            <>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 8 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(168,85,247,0.12)',
                    borderWidth: 1,
                    borderColor: 'rgba(168,85,247,0.3)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons
                    name={step === 'phone' ? 'phone-outline' : 'message-text-outline'}
                    size={24}
                    color={colors.neonPurple}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>
                    {step === 'phone' ? t('phoneVerification.title') : t('phoneVerification.otpTitle')}
                  </AppText>
                  <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>
                    {step === 'phone'
                      ? t('phoneVerification.subtitle')
                      : t('phoneVerification.otpSubtitle', {
                          phone: `${selectedCountry.dialCode} ${phoneNumber}`,
                        })}
                  </AppText>
                </View>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
              >
                {/* ── Phone step ── */}
                {step === 'phone' && (
                  <View style={{ marginTop: 24, gap: 16 }}>
                    {/* Info banner */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        gap: 10,
                        backgroundColor: 'rgba(168,85,247,0.08)',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: 'rgba(168,85,247,0.2)',
                        padding: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="information-outline"
                        size={16}
                        color={colors.neonPurple}
                        style={{ marginTop: 1 }}
                      />
                      <AppText style={{ flex: 1, fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
                        {t('phoneVerification.info')}
                      </AppText>
                    </View>

                    {/* Phone input */}
                    <View
                      style={{
                        flexDirection: 'row',
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: theme.border,
                        backgroundColor: theme.background,
                        overflow: 'hidden',
                      }}
                    >
                      {/* Country selector button */}
                      <Pressable
                        onPress={() => { setStep('country'); }}
                        accessibilityRole="button"
                        accessibilityLabel={t('phoneVerification.selectCountry')}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingHorizontal: 12,
                          paddingVertical: 14,
                          gap: 6,
                          borderRightWidth: 1,
                          borderRightColor: theme.border,
                          backgroundColor: pressed ? 'rgba(255,255,255,0.04)' : 'transparent',
                        })}
                      >
                        <AppText style={{ fontSize: 22 }}>{selectedCountry.flag}</AppText>
                        <AppText style={{ fontSize: 15, color: theme.text, fontWeight: '600' }}>
                          {selectedCountry.dialCode}
                        </AppText>
                        <MaterialCommunityIcons name="chevron-down" size={16} color={theme.textSecondary} />
                      </Pressable>

                      {/* Number input */}
                      <TextInput
                        value={phoneNumber}
                        onChangeText={(text) => { setPhoneNumber(text); setError(null); }}
                        placeholder="XX XXX XXX"
                        placeholderTextColor={theme.textMuted}
                        keyboardType="phone-pad"
                        accessibilityLabel={t('phoneVerification.phoneLabel')}
                        style={{
                          flex: 1,
                          paddingHorizontal: 14,
                          paddingVertical: 14,
                          fontSize: 16,
                          color: theme.text,
                        }}
                      />
                    </View>

                    {/* Error */}
                    {!!error && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: 'rgba(239,68,68,0.3)',
                          padding: 10,
                        }}
                      >
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F87171" />
                        <AppText style={{ flex: 1, fontSize: 13, color: '#F87171' }}>{error}</AppText>
                      </View>
                    )}

                    <AppButton
                      title={t('phoneVerification.sendCode')}
                      onPress={handleSendCode}
                      size="lg"
                      style={{ borderRadius: 14 }}
                      accessibilityLabel={t('phoneVerification.sendCode')}
                      accessibilityRole="button"
                    />
                  </View>
                )}

                {/* ── OTP step ── */}
                {step === 'otp' && (
                  <View style={{ marginTop: 24, gap: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                      {otp.map((digit, index) => (
                        <TextInput
                          key={index}
                          ref={(ref) => { inputRefs.current[index] = ref; }}
                          value={digit}
                          onChangeText={(text) => handleOtpChange(text, index)}
                          onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                          keyboardType="number-pad"
                          maxLength={1}
                          selectTextOnFocus
                          accessibilityLabel={`OTP digit ${index + 1}`}
                          style={{
                            flex: 1,
                            height: 56,
                            borderRadius: 14,
                            borderWidth: 1.5,
                            borderColor: digit ? colors.neonPurple : theme.border,
                            backgroundColor: digit ? 'rgba(168,85,247,0.08)' : theme.background,
                            fontSize: 22,
                            fontWeight: '700',
                            color: theme.text,
                            textAlign: 'center',
                          }}
                        />
                      ))}
                    </View>

                    {!!error && (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 8,
                          backgroundColor: 'rgba(239,68,68,0.1)',
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: 'rgba(239,68,68,0.3)',
                          padding: 10,
                        }}
                      >
                        <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#F87171" />
                        <AppText style={{ flex: 1, fontSize: 13, color: '#F87171' }}>{error}</AppText>
                      </View>
                    )}

                    <AppButton
                      title={isVerifying ? t('phoneVerification.verifying') : t('phoneVerification.verify')}
                      onPress={handleVerify}
                      isLoading={isVerifying}
                      disabled={isVerifying || (otp.join('').length < 6 && otp.join('') !== DEV_BYPASS_CODE)}
                      size="lg"
                      style={{ borderRadius: 14 }}
                      accessibilityLabel={t('phoneVerification.verify')}
                      accessibilityRole="button"
                    />

                    <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                      <AppText style={{ fontSize: 13, color: theme.textMuted }}>
                        {t('phoneVerification.didntReceive')}
                      </AppText>
                      <Pressable
                        onPress={handleResend}
                        disabled={countdown > 0}
                        accessibilityRole="button"
                        accessibilityLabel={t('phoneVerification.resend')}
                      >
                        {countdown > 0 ? (
                          <AppText style={{ fontSize: 13, color: theme.textMuted }}>
                            {t('phoneVerification.resendIn', { seconds: countdown })}
                          </AppText>
                        ) : (
                          <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '700' }}>
                            {t('phoneVerification.resend')}
                          </AppText>
                        )}
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(null); }}
                      accessibilityRole="button"
                      accessibilityLabel={t('phoneVerification.changePhone')}
                      style={{ alignItems: 'center', paddingVertical: 4 }}
                    >
                      <AppText style={{ fontSize: 13, color: theme.textMuted }}>
                        {t('phoneVerification.changePhone')}
                      </AppText>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
