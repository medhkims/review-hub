import React, { useState, useCallback, useRef } from 'react';
import { View, ScrollView, Pressable, TextInput, ActivityIndicator, Image, Modal } from 'react-native';
import { useRouter, useFocusEffect, router as rootRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { OtpVerificationModal } from '@/presentation/shared/components/OtpVerificationModal';
import { VerificationSuccessModal } from '@/presentation/shared/components/VerificationSuccessModal';
import { useVerifyAccount } from '../hooks/useVerifyAccount';
import { CountryPickerModal, DEFAULT_COUNTRY } from '@/presentation/shared/components/CountryPickerModal';
import type { Country } from '@/presentation/shared/components/CountryPickerModal';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export default function VerifyAccountScreen() {
  useAnalyticsScreen(AnalyticsScreens.VERIFY_ACCOUNT);
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [idCardUri, setIdCardUri] = useState<string | null>(null);
  const [idCardMime, setIdCardMime] = useState<string>('image/jpeg');
  const idCardBase64Ref = useRef<string | null>(null);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(useCallback(() => {
    setIsScreenFocused(true);
    return () => setIsScreenFocused(false);
  }, []));

  const {
    step,
    isLoading,
    isValidatingId,
    isSendingOtp,
    isVerifyingOtp,
    error,
    pendingPhone,
    pendingFullName,
    rejectionReason,
    validateIdCard,
    sendOtp,
    verifyOtpAndSubmit,
    resendOtp,
    resetForm,
  } = useVerifyAccount();

  const handleSelectFile = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      crossPlatformAlert(t('common.error'), t('common.permissionDenied'));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
      base64: true,
    });
    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setIdCardUri(asset.uri);
      setIdCardMime(asset.mimeType ?? 'image/jpeg');
      idCardBase64Ref.current = asset.base64 ?? null;
    }
  }, [t]);

  const handleSubmit = useCallback(async () => {
    if (!fullName.trim()) {
      crossPlatformAlert(t('common.error'), t('verifyAccount.errorFullName'));
      return;
    }
    if (!phoneNumber.trim()) {
      crossPlatformAlert(t('common.error'), t('verifyAccount.errorPhone'));
      return;
    }
    if (!idCardUri) {
      crossPlatformAlert(t('common.error'), t('verifyAccount.errorIdCard'));
      return;
    }
    // Validate that the uploaded image is a Tunisian ID card
    const base64 = idCardBase64Ref.current;
    if (base64) {
      const isValid = await validateIdCard(base64);
      if (!isValid) return;
    }

    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.trim()}`;
    await sendOtp(fullPhone);
  }, [fullName, phoneNumber, idCardUri, validateIdCard, sendOtp, t]);

  const handleVerifyOtp = useCallback(
    async (code: string) => {
      if (!idCardUri) return;
      await verifyOtpAndSubmit(code, fullName.trim(), idCardUri, idCardMime);
    },
    [idCardUri, fullName, idCardMime, verifyOtpAndSubmit],
  );

  const handleGoHome = useCallback(() => {
    setIsScreenFocused(false);
    rootRouter.replace('/(main)/(feed)');
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setIsScreenFocused(false);
    router.back();
  }, [router]);

  const isFormValid = fullName.trim().length > 0 && phoneNumber.trim().length > 0 && !!idCardUri;
  const isBusy = isLoading || isValidatingId || isSendingOtp;

  // Loading state while checking existing verification
  if (step === 'loading') {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      </ScreenLayout>
    );
  }

  // Already verified by admin
  if (step === 'verified') {
    return (
      <ScreenLayout>
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={{ padding: 8, borderRadius: 9999, backgroundColor: 'rgba(30,41,59,0.3)' }}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
          </Pressable>
          <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
            {t('verifyAccount.title')}
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              backgroundColor: 'rgba(34,197,94,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            <MaterialCommunityIcons name="shield-check" size={48} color={colors.success} />
          </View>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 12 }}>
            {t('verifyAccount.alreadyVerifiedTitle')}
          </AppText>
          <AppText style={{ fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 32 }}>
            {t('verifyAccount.alreadyVerifiedSubtitle')}
          </AppText>
          <AppButton
            title={t('common.goHome')}
            size="lg"
            shape="pill"
            onPress={handleGoHome}
            accessibilityLabel={t('common.goHome')}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withKeyboardAvoid>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
          style={{ padding: 8, borderRadius: 9999, backgroundColor: 'rgba(30,41,59,0.3)' }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
          {t('verifyAccount.title')}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 32 }}>
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(168,85,247,0.15)',
            }}
          />
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: 'rgba(168,85,247,0.3)',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 20,
              elevation: 8,
              zIndex: 10,
            }}
          >
            <MaterialCommunityIcons name="shield-check" size={40} color={colors.neonPurple} />
          </View>
          <AppText
            style={{ fontSize: 24, fontWeight: '700', color: theme.text, marginTop: 20, textAlign: 'center', zIndex: 10 }}
          >
            {t('verifyAccount.title')}
          </AppText>
          <AppText
            style={{ fontSize: 14, color: theme.textSecondary, marginTop: 8, textAlign: 'center', zIndex: 10 }}
          >
            {t('verifyAccount.subtitle')}
          </AppText>
        </View>

        {/* Full Name */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
              {t('verifyAccount.fullName')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>{'*'}</AppText>
          </View>
          <View
            style={{
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('verifyAccount.fullNamePlaceholder')}
              placeholderTextColor={theme.textMuted}
              style={{ color: theme.text, fontSize: 16, paddingVertical: 14 }}
              accessibilityLabel={t('verifyAccount.fullName')}
            />
          </View>
        </View>

        {/* Phone Number */}
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
              {t('verifyAccount.phoneNumber')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>{'*'}</AppText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.card,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <Pressable
              onPress={() => setCountryPickerVisible(true)}
              accessibilityRole="button"
              accessibilityLabel={`${selectedCountry.name} ${selectedCountry.dialCode}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderRightWidth: 1,
                borderRightColor: theme.border,
                gap: 6,
              }}
            >
              <AppText style={{ fontSize: 20 }}>{selectedCountry.flag}</AppText>
              <AppText style={{ fontSize: 14, color: theme.text, fontWeight: '500' }}>
                {selectedCountry.dialCode}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={16} color={theme.textMuted} />
            </Pressable>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t('verifyAccount.phonePlaceholder')}
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
              style={{
                flex: 1,
                color: theme.text,
                fontSize: 16,
                paddingHorizontal: 14,
                paddingVertical: 14,
              }}
              accessibilityLabel={t('verifyAccount.phoneNumber')}
            />
          </View>
          <AppText style={{ fontSize: 13, color: theme.textMuted, marginTop: 8, marginLeft: 2 }}>
            {t('verifyAccount.phoneHelper')}
          </AppText>
        </View>

        {/* Upload ID Card */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
              {t('verifyAccount.uploadCin')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>{'*'}</AppText>
          </View>

          {idCardUri ? (
            <Pressable
              onPress={handleSelectFile}
              accessibilityRole="button"
              accessibilityLabel={t('verifyAccount.changeFile')}
              style={{ borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.neonPurple }}
            >
              <Image
                source={{ uri: idCardUri }}
                style={{ width: '100%', height: 180 }}
                resizeMode="cover"
                accessibilityLabel={t('verifyAccount.uploadCin')}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(0,0,0,0.55)',
                  paddingVertical: 8,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ fontSize: 13, color: colors.textWhite, fontWeight: '500' }}>
                  {t('verifyAccount.changeFile')}
                </AppText>
              </View>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleSelectFile}
              accessibilityRole="button"
              accessibilityLabel={t('verifyAccount.selectFile')}
              style={{
                borderWidth: 1.5,
                borderColor: 'rgba(168,85,247,0.4)',
                borderStyle: 'dashed',
                borderRadius: 12,
                paddingVertical: 32,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.card,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                <MaterialCommunityIcons name="card-account-details-outline" size={24} color={theme.textSecondary} />
              </View>
              <AppText style={{ fontSize: 14, color: colors.neonPurple, fontWeight: '500' }}>
                {t('verifyAccount.selectFile')}
              </AppText>
              <AppText style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
                {t('verifyAccount.idCardHint')}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* Submit */}
        <AppButton
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!isFormValid || isBusy}
          accessibilityRole="button"
          accessibilityLabel={t('verifyAccount.submit')}
          style={{
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 8,
          }}
        >
          {isBusy ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ActivityIndicator size="small" color={colors.textWhite} />
              <AppText style={{ color: colors.textWhite, fontSize: 14 }}>
                {isValidatingId ? t('verifyAccount.validatingId') : t('verifyAccount.submit')}
              </AppText>
            </View>
          ) : (
            t('verifyAccount.submit')
          )}
        </AppButton>

        {/* Error banner — below submit */}
        {error ? (
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: 12,
              marginTop: 12,
            }}
          >
            <AppText style={{ fontSize: 13, color: colors.error, textAlign: 'center' }}>
              {error === 'notIdCard' ? t('verifyAccount.errorNotIdCard') : error}
            </AppText>
          </View>
        ) : null}

        <View style={{ height: 96 }} />
      </ScrollView>

      {/* OTP Modal */}
      <OtpVerificationModal
        visible={step === 'otp'}
        onClose={() => resetForm()}
        onVerify={handleVerifyOtp}
        onResend={resendOtp}
        phoneNumber={pendingPhone ?? `${selectedCountry.dialCode}${phoneNumber.trim()}`}
      />

      {/* Pending / Success Modal */}
      <VerificationSuccessModal
        visible={step === 'success' && isScreenFocused}
        onClose={handleGoHome}
        phoneNumber={pendingPhone}
        fullName={pendingFullName}
        onGoHome={handleGoHome}
      />

      {/* Country Picker */}
      <CountryPickerModal
        visible={countryPickerVisible}
        selected={selectedCountry}
        onSelect={(country) => {
          setSelectedCountry(country);
          setCountryPickerVisible(false);
        }}
        onClose={() => setCountryPickerVisible(false)}
      />

      {/* Rejection Modal */}
      <Modal visible={step === 'rejected'} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 28,
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              alignItems: 'center',
            }}
          >
            {/* X close button */}
            <Pressable
              onPress={resetForm}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="close" size={18} color={theme.textSecondary} />
            </Pressable>

            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: 'rgba(239,68,68,0.12)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}
            >
              <MaterialCommunityIcons name="shield-off" size={36} color={colors.error} />
            </View>

            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 10 }}>
              {t('verifyAccount.rejectedTitle')}
            </AppText>

            {rejectionReason ? (
              <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                {rejectionReason}
              </AppText>
            ) : (
              <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
                {t('verifyAccount.rejectedSubtitle')}
              </AppText>
            )}

            <AppButton
              variant="primary"
              title={t('verifyAccount.makeNewSubmit')}
              size="lg"
              shape="pill"
              onPress={resetForm}
              accessibilityLabel={t('verifyAccount.makeNewSubmit')}
              style={{ width: '100%' }}
            />
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
