import React, { useState, useCallback } from 'react';
import { View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function VerifyAccountScreen() {
  useAnalyticsScreen(AnalyticsScreens.VERIFY_ACCOUNT);
  const { t } = useTranslation();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleSelectFile = useCallback(() => {
    Alert.alert(t('common.comingSoon'), 'File picker will be implemented soon.');
  }, [t]);

  const handleSubmit = useCallback(() => {
    Alert.alert(t('common.comingSoon'), 'Verification submission will be implemented soon.');
  }, [t]);

  const isFormValid = fullName.trim().length > 0 && phoneNumber.trim().length > 0;

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
          style={{
            padding: 8,
            borderRadius: 9999,
            backgroundColor: 'rgba(30, 41, 59, 0.3)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textWhite} />
        </Pressable>
        <AppText
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {t('verifyAccount.title')}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero Section */}
        <View style={{ alignItems: 'center', paddingTop: 16, paddingBottom: 32 }}>
          {/* Neon glow background */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              width: 160,
              height: 160,
              borderRadius: 80,
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
            }}
          />
          {/* Shield icon container */}
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: 'rgba(168, 85, 247, 0.3)',
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
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.textWhite,
              marginTop: 20,
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {t('verifyAccount.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.textSlate400,
              marginTop: 8,
              textAlign: 'center',
              zIndex: 10,
            }}
          >
            {t('verifyAccount.subtitle')}
          </AppText>
        </View>

        {/* Full Name Field */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate100 }}>
              {t('verifyAccount.fullName')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>
              {'*'}
            </AppText>
          </View>
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              borderRadius: 12,
              paddingHorizontal: 16,
            }}
          >
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('verifyAccount.fullNamePlaceholder')}
              placeholderTextColor={colors.textSlate500}
              style={{ color: colors.textWhite, fontSize: 16, paddingVertical: 14 }}
              accessibilityLabel={t('verifyAccount.fullName')}
            />
          </View>
        </View>

        {/* Phone Number Field */}
        <View style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate100 }}>
              {t('verifyAccount.phoneNumber')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>
              {'*'}
            </AppText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Country code picker */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Select country code"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 14,
                paddingVertical: 14,
                borderRightWidth: 1,
                borderRightColor: colors.borderDark,
                gap: 6,
              }}
            >
              <AppText style={{ fontSize: 18 }}>{'🇹🇳'}</AppText>
              <AppText style={{ fontSize: 14, color: colors.textSlate200, fontWeight: '500' }}>
                {'+216'}
              </AppText>
              <MaterialCommunityIcons name="chevron-down" size={16} color={colors.textSlate400} />
            </Pressable>
            {/* Phone input */}
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder={t('verifyAccount.phonePlaceholder')}
              placeholderTextColor={colors.textSlate500}
              keyboardType="phone-pad"
              style={{
                flex: 1,
                color: colors.textWhite,
                fontSize: 16,
                paddingHorizontal: 14,
                paddingVertical: 14,
              }}
              accessibilityLabel={t('verifyAccount.phoneNumber')}
            />
          </View>
          <AppText
            style={{ fontSize: 13, color: colors.textSlate500, marginTop: 8, marginLeft: 2 }}
          >
            {t('verifyAccount.phoneHelper')}
          </AppText>
        </View>

        {/* Upload CIN Field */}
        <View style={{ marginTop: 16, marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate100 }}>
              {t('verifyAccount.uploadCin')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.error, marginLeft: 4 }}>
              {'*'}
            </AppText>
          </View>
          <Pressable
            onPress={handleSelectFile}
            accessibilityRole="button"
            accessibilityLabel={t('verifyAccount.selectFile')}
            style={{
              borderWidth: 1.5,
              borderColor: 'rgba(168, 85, 247, 0.4)',
              borderStyle: 'dashed',
              borderRadius: 12,
              paddingVertical: 32,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(30, 41, 59, 0.4)',
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.cardDark,
                borderWidth: 1,
                borderColor: colors.borderDark,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons name="image-outline" size={24} color={colors.textSlate400} />
            </View>
            <AppText style={{ fontSize: 14, color: colors.neonPurple, fontWeight: '500' }}>
              {selectedFile ?? t('verifyAccount.selectFile')}
            </AppText>
          </Pressable>
        </View>

        {/* Submit Button */}
        <AppButton
          variant="primary"
          size="lg"
          onPress={handleSubmit}
          disabled={!isFormValid}
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
          {t('verifyAccount.submit')}
        </AppButton>

        {/* Bottom spacing */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </ScreenLayout>
  );
}
