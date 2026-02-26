import React, { useState, useCallback, useEffect } from 'react';
import { View, ScrollView, TextInput, Pressable, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useWriteReview } from '../hooks/useWriteReview';

const MAX_CHARS = 500;

const CATEGORIES = [
  { key: 'cooking', label: 'Cooking', icon: 'silverware-fork-knife' as const },
  { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' as const },
  { key: 'service', label: 'Service', icon: 'shield-account' as const },
];

type RatingsState = Record<string, number>;

interface StarRatingProps {
  rating: number;
  onRate: (n: number) => void;
}

const StarRating = React.memo(({ rating, onRate }: StarRatingProps) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    {[1, 2, 3, 4, 5].map((star) => (
      <Pressable
        key={star}
        onPress={() => onRate(star)}
        accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
        accessibilityRole="button"
        hitSlop={4}
      >
        <MaterialCommunityIcons
          name={star <= rating ? 'star' : 'star-outline'}
          size={28}
          color={star <= rating ? colors.neonPurple : colors.borderDark}
        />
      </Pressable>
    ))}
  </View>
));

StarRating.displayName = 'StarRating';

export default function WriteReviewScreen() {
  useAnalyticsScreen(AnalyticsScreens.WRITE_REVIEW);
  const router = useRouter();
  const { t } = useTranslation();
  const { businessId, businessName } = useLocalSearchParams<{ businessId: string; businessName: string }>();

  const resolvedBusinessId = businessId ?? '';
  const resolvedBusinessName = businessName ?? 'Business';

  const { isSubmitting, submitSuccess, error, submitReview, reset } =
    useWriteReview(resolvedBusinessId, resolvedBusinessName);

  const [ratings, setRatings] = useState<RatingsState>({ cooking: 0, cleanliness: 0, service: 0 });
  const [reviewText, setReviewText] = useState('');

  const handleRate = useCallback((key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleTextChange = useCallback((text: string) => {
    if (text.length <= MAX_CHARS) setReviewText(text);
  }, []);

  const handleSubmit = useCallback(() => {
    submitReview(ratings, reviewText, []);
  }, [ratings, reviewText, submitReview]);

  useEffect(() => {
    if (submitSuccess) {
      Alert.alert('Success', 'Your review has been submitted!', [
        {
          text: 'OK',
          onPress: () => {
            reset();
            router.back();
          },
        },
      ]);
    }
  }, [submitSuccess, reset, router]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  const isSubmitDisabled = isSubmitting || !reviewText.trim() || Object.values(ratings).some((r) => r === 0);

  return (
    <ScreenLayout withKeyboardAvoid>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel={t('common.back')}
            accessibilityRole="button"
            hitSlop={8}
            style={{
              width: 40, height: 40, borderRadius: 20, backgroundColor: colors.cardDark,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textWhite} />
          </Pressable>
        </View>

        {/* Business Hero */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: '100%', height: 140, backgroundColor: colors.cardDark, position: 'relative' }}>
            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 80, backgroundColor: colors.midnight, opacity: 0.8,
            }} />
          </View>
          <View style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: colors.cardDark,
            borderWidth: 3, borderColor: colors.neonPurple, alignItems: 'center',
            justifyContent: 'center', marginTop: -36,
          }}>
            <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
          </View>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.textWhite, marginTop: 10, textAlign: 'center' }}>
            {resolvedBusinessName}
          </AppText>
        </View>

        {/* Rating Categories */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card style={{ backgroundColor: colors.cardDark, borderRadius: 16, padding: 20 }}>
            {CATEGORIES.map((cat, idx) => (
              <View
                key={cat.key}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingVertical: 14, borderBottomWidth: idx < CATEGORIES.length - 1 ? 1 : 0,
                  borderBottomColor: colors.borderDark,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.neonPurple}15`,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <MaterialCommunityIcons name={cat.icon} size={18} color={colors.neonPurple} />
                  </View>
                  <View>
                    <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textWhite }}>
                      {cat.label}
                    </AppText>
                    {ratings[cat.key] === 0 && (
                      <AppText style={{ fontSize: 11, color: colors.textSlate400, marginTop: 2 }}>
                        {t('writeReview.tapToRate')}
                      </AppText>
                    )}
                  </View>
                </View>
                <StarRating rating={ratings[cat.key] ?? 0} onRate={(v) => handleRate(cat.key, v)} />
              </View>
            ))}
          </Card>
        </View>

        {/* Write Your Review */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.textWhite, marginBottom: 12 }}>
            {t('writeReview.writeYourReview')}
          </AppText>
          <View style={{
            backgroundColor: colors.cardDark, borderRadius: 14,
            borderWidth: 1, borderColor: colors.borderDark, padding: 14, minHeight: 130,
          }}>
            <TextInput
              style={{ color: colors.textWhite, fontSize: 15, lineHeight: 22, minHeight: 90, textAlignVertical: 'top' }}
              placeholder={t('writeReview.placeholder')}
              placeholderTextColor={colors.textSlate500}
              multiline
              maxLength={MAX_CHARS}
              value={reviewText}
              onChangeText={handleTextChange}
              accessibilityLabel={t('writeReview.writeYourReview')}
            />
            <AppText style={{ fontSize: 12, color: colors.textSlate400, textAlign: 'right', marginTop: 8 }}>
              {reviewText.length}/{MAX_CHARS}
            </AppText>
          </View>
        </View>

        {/* Add Photos */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.textWhite, marginBottom: 12 }}>
            {t('writeReview.addPhotos')}
          </AppText>
          <Pressable
            accessibilityLabel={t('writeReview.uploadPhotos')}
            accessibilityRole="button"
            style={{
              borderWidth: 1.5, borderColor: colors.borderDark, borderStyle: 'dashed',
              borderRadius: 14, paddingVertical: 28, alignItems: 'center',
              justifyContent: 'center', backgroundColor: `${colors.cardDark}80`,
            }}
          >
            <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.textSlate400} />
            <AppText style={{ fontSize: 13, color: colors.textSlate400, marginTop: 8 }}>
              {t('writeReview.uploadPhotos')}
            </AppText>
          </Pressable>
        </View>

        {/* Submit Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <AppButton
            title={t('writeReview.submit')}
            variant="primary"
            size="lg"
            shape="pill"
            disabled={isSubmitDisabled}
            isLoading={isSubmitting}
            onPress={handleSubmit}
            accessibilityLabel={t('writeReview.submit')}
            accessibilityRole="button"
            icon={!isSubmitting ? <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textWhite} /> : undefined}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
