import React, { useCallback, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

const CARD_STYLE = {
  backgroundColor: colors.cardDark,
  borderWidth: 1,
  borderColor: colors.borderDark,
  borderRadius: 16,
  padding: 20,
};

interface UploadBoxProps {
  label: string;
}

const UploadBox: React.FC<UploadBoxProps> = ({ label }) => (
  <Pressable
    style={({ pressed }) => ({
      flex: 1,
      borderStyle: 'dashed' as const,
      borderWidth: 1.5,
      borderColor: colors.borderDark,
      borderRadius: 12,
      paddingVertical: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      opacity: pressed ? 0.7 : 1,
    })}
    accessibilityLabel={label}
    accessibilityRole="button"
  >
    <MaterialCommunityIcons name="image-outline" size={28} color={colors.textSlate500} />
    <AppText style={{ color: colors.textSlate500, fontSize: 13, marginTop: 8 }}>
      {label}
    </AppText>
  </Pressable>
);

export default function AddBusinessScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADD_BUSINESS);
  const { t } = useTranslation();
  const router = useRouter();

  const [businessName, setBusinessName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const handleBack = useCallback(() => { router.back(); }, [router]);
  const handleSubmit = useCallback(() => { /* TODO: wire to use case */ }, []);

  return (
    <ScreenLayout withKeyboardAvoid>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(30,41,59,0.5)',
              alignItems: 'center', justifyContent: 'center',
            })}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
          </Pressable>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, flex: 1, textAlign: 'center', marginRight: 40, letterSpacing: -0.3 }}>
            {t('home.addBusiness.title')}
          </AppText>
        </View>

        {/* Hero Icon */}
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
          <View
            style={{
              width: 80, height: 80, borderRadius: 40, backgroundColor: colors.cardDark,
              alignItems: 'center', justifyContent: 'center',
              shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
            }}
          >
            <MaterialCommunityIcons name="store" size={36} color={colors.neonPurple} />
          </View>
          <AppText style={{ color: colors.textSlate400, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
            {t('home.addBusiness.subtitle')}
          </AppText>
        </View>

        {/* Business Details Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <Card style={CARD_STYLE}>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 16 }}>
              {t('home.addBusiness.businessDetails')}
            </AppText>

            <AppInput
              label={t('home.addBusiness.businessName')}
              placeholder={t('home.addBusiness.businessNamePlaceholder')}
              value={businessName}
              onChangeText={setBusinessName}
              accessibilityLabel={t('home.addBusiness.businessName')}
            />

            {/* Category Selector (mock) */}
            <View style={{ width: '100%', marginBottom: 16 }}>
              <AppText style={{ color: colors.textSlate400, fontSize: 14, marginBottom: 4, fontWeight: '500' }}>
                {t('home.addBusiness.category')}
              </AppText>
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardDark,
                  borderWidth: 1, borderColor: colors.borderDark, borderRadius: 12,
                  paddingHorizontal: 16, paddingVertical: 12, opacity: pressed ? 0.7 : 1,
                })}
                accessibilityLabel={t('home.addBusiness.category')}
                accessibilityRole="button"
              >
                <AppText style={{ flex: 1, color: colors.textSlate500, fontSize: 16 }}>
                  {t('home.addBusiness.categoryPlaceholder')}
                </AppText>
                <MaterialCommunityIcons name="chevron-down" size={22} color={colors.textSlate500} />
              </Pressable>
            </View>

            <AppInput
              label={t('home.addBusiness.location')}
              placeholder={t('home.addBusiness.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
              accessibilityLabel={t('home.addBusiness.location')}
              rightIcon={<MaterialCommunityIcons name="map-marker-outline" size={22} color={colors.textSlate500} />}
            />

            <AppInput
              label={t('home.addBusiness.website')}
              placeholder={t('home.addBusiness.websitePlaceholder')}
              value={website}
              onChangeText={setWebsite}
              keyboardType="url"
              autoCapitalize="none"
              accessibilityLabel={t('home.addBusiness.website')}
            />
          </Card>
        </View>

        {/* Media Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
          <Card style={CARD_STYLE}>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 16 }}>
              {t('home.addBusiness.media')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <UploadBox label={t('home.addBusiness.uploadLogo')} />
              <UploadBox label={t('home.addBusiness.uploadCover')} />
            </View>
          </Card>
        </View>

        {/* Submit Button */}
        <View style={{ paddingHorizontal: 24, marginTop: 28 }}>
          <AppButton
            title={t('home.addBusiness.submitBusiness')}
            size="lg"
            onPress={handleSubmit}
            accessibilityLabel={t('home.addBusiness.submitBusiness')}
            accessibilityRole="button"
            icon={<MaterialCommunityIcons name="check" size={20} color={colors.white} />}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
