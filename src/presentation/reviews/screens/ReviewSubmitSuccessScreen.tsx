import React, { useMemo } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

interface StarRowProps {
  label: string;
  rating: number;
}

const StarRow = ({ label, rating }: StarRowProps) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6 }}>
    <AppText style={{ fontSize: 13, color: colors.textSlate400 }}>{label}</AppText>
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialCommunityIcons
          key={star}
          name={star <= rating ? 'star' : 'star-outline'}
          size={14}
          color={colors.neonPurple}
        />
      ))}
    </View>
  </View>
);

export default function ReviewSubmitSuccessScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { businessName, ratings: ratingsParam, reviewText } = useLocalSearchParams<{
    businessName: string;
    ratings: string;
    reviewText: string;
  }>();

  const resolvedBusinessName = businessName ?? '';

  const ratings = useMemo<Record<string, number>>(() => {
    try {
      return JSON.parse(ratingsParam ?? '{}') as Record<string, number>;
    } catch {
      return {};
    }
  }, [ratingsParam]);

  const ratingEntries = Object.entries(ratings);

  const handleGoToMyReviews = () => {
    router.push('/(main)/(reviews)');
  };

  const handleBackToHome = () => {
    router.push('/(main)/(feed)');
  };

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 }}>
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite, letterSpacing: 0.5 }}>
          {t('reviewSuccess.title')}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Success icon + heading */}
        <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 32, gap: 16 }}>
          <View style={{
            width: 96, height: 96, borderRadius: 48,
            backgroundColor: colors.midnight,
            borderWidth: 1, borderColor: `${colors.neonPurple}33`,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 30,
            elevation: 12,
          }}>
            <MaterialCommunityIcons name="check-circle" size={52} color={colors.neonPurple} />
          </View>

          <View style={{ alignItems: 'center', gap: 6 }}>
            <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.textWhite, textAlign: 'center' }}>
              {t('reviewSuccess.heading')}
            </AppText>
            <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', lineHeight: 20 }}>
              {t('reviewSuccess.subtitle', { businessName: resolvedBusinessName })}
            </AppText>
          </View>
        </View>

        {/* Review summary card */}
        <View style={{
          backgroundColor: colors.cardDark,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: `${colors.textWhite}0D`,
          overflow: 'hidden',
          marginBottom: 28,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.37,
          shadowRadius: 16,
          elevation: 8,
        }}>
          {/* Purple left accent bar */}
          <View style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: 5,
            backgroundColor: colors.neonPurple,
          }} />

          <View style={{ paddingLeft: 22, paddingRight: 16, paddingVertical: 16 }}>
            {/* Business header row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 24,
                backgroundColor: colors.midnight,
                borderWidth: 1, borderColor: `${colors.textWhite}1A`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.neonPurple }}>
                  {resolvedBusinessName.charAt(0).toUpperCase()}
                </AppText>
              </View>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.textWhite, flex: 1 }}>
                {resolvedBusinessName}
              </AppText>
            </View>

            {/* Rating criteria rows */}
            {ratingEntries.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                {ratingEntries.map(([key, value]) => (
                  <StarRow
                    key={key}
                    label={t(`ratingCriteria.${key}`, {
                      defaultValue: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
                    })}
                    rating={value}
                  />
                ))}
              </View>
            )}

            {/* Review text */}
            {!!reviewText && (
              <AppText style={{
                fontSize: 13,
                color: colors.textSlate200,
                fontStyle: 'italic',
                borderTopWidth: 1,
                borderTopColor: `${colors.textWhite}0D`,
                paddingTop: 12,
                lineHeight: 20,
              }}>
                {`"${reviewText}"`}
              </AppText>
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={{ gap: 12 }}>
          <AppButton
            title={t('reviewSuccess.goToMyReviews')}
            variant="primary"
            size="lg"
            shape="pill"
            onPress={handleGoToMyReviews}
            accessibilityLabel={t('reviewSuccess.goToMyReviews')}
            accessibilityRole="button"
            icon={<MaterialCommunityIcons name="arrow-right" size={18} color={colors.textWhite} />}
          />
          <AppButton
            title={t('reviewSuccess.backToHome')}
            variant="secondary"
            size="lg"
            shape="pill"
            onPress={handleBackToHome}
            accessibilityLabel={t('reviewSuccess.backToHome')}
            accessibilityRole="button"
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
