import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { RatingCriterionDef, CATEGORY_MAP } from '@/core/constants/categoriesData';
import { container } from '@/core/di/container';
import { useWriteReview } from '../hooks/useWriteReview';
import { PhotoPicker, SelectedPhoto } from '../components/PhotoPicker';
import { GuestGate } from '@/presentation/shared/components/GuestGate';

const MAX_CHARS = 500;

const FALLBACK_CRITERIA: RatingCriterionDef[] = [
  { key: 'service', label: 'Service', icon: 'shield-account' },
  { key: 'quality', label: 'Quality', icon: 'star-check' },
  { key: 'cleanliness', label: 'Cleanliness', icon: 'broom' },
];

type RatingsState = Record<string, number>;

interface StarRatingProps {
  rating: number;
  onRate: (n: number) => void;
}

const StarRating = React.memo(
  ({ rating, onRate }: StarRatingProps) => {
    const theme = useTheme();
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => onRate(star)}
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
            accessibilityRole="button"
            hitSlop={4}
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={28}
              color={star <= rating ? colors.neonPurple : theme.border}
            />
          </Pressable>
        ))}
      </View>
    );
  },
);

StarRating.displayName = 'StarRating';

export default function WriteReviewScreen() {
  useAnalyticsScreen(AnalyticsScreens.WRITE_REVIEW);
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { businessId, businessName, categoryId } = useLocalSearchParams<{
    businessId: string;
    businessName: string;
    categoryId?: string;
  }>();

  const resolvedBusinessId = businessId ?? '';
  const resolvedBusinessName = businessName ?? 'Business';

  const { isSubmitting, submitSuccess, submittedReviewId, error, submitReview, reset } =
    useWriteReview(resolvedBusinessId, resolvedBusinessName);

  // Start with bundled data so the UI is instant, then overwrite with Firestore
  // once loaded so admin changes are reflected.
  const [ratingCriteria, setRatingCriteria] = useState<RatingCriterionDef[]>(() => {
    if (!categoryId) return FALLBACK_CRITERIA;
    const criteria = CATEGORY_MAP[categoryId]?.ratingCriteria;
    return criteria !== undefined ? criteria : FALLBACK_CRITERIA;
  });

  useEffect(() => {
    if (!categoryId) return;
    container.getCategoriesUseCase.execute().then((result) => {
      result.fold(
        () => undefined,
        (cats) => {
          const cat = cats.find((c) => c.id === categoryId);
          if (!cat) return;
          // cat.ratingCriteria comes from Firestore (admin-editable).
          // Empty array is intentional for 'other'-style categories → general rating mode.
          setRatingCriteria(cat.ratingCriteria);
        },
      );
    });
  }, [categoryId]);

  // True when the category has no sub-criteria (e.g. 'other')
  const isGeneralRating = ratingCriteria.length === 0;

  const initialRatings = useMemo<RatingsState>(
    () => Object.fromEntries(ratingCriteria.map((c) => [c.key, 0])),
    [ratingCriteria],
  );

  const [ratings, setRatings] = useState<RatingsState>(initialRatings);
  const [generalRating, setGeneralRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);

  const handleRate = useCallback((key: string, val: number) => {
    setRatings((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleTextChange = useCallback((text: string) => {
    if (text.length <= MAX_CHARS) setReviewText(text);
  }, []);

  const handleSubmit = useCallback(() => {
    if (isGeneralRating) {
      submitReview({ general: generalRating }, reviewText, photos);
    } else {
      submitReview(ratings, reviewText, photos);
    }
  }, [isGeneralRating, generalRating, ratings, reviewText, photos, submitReview]);

  useEffect(() => {
    if (submitSuccess) {
      reset();
      router.replace({
        pathname: '/(main)/(feed)/review-success',
        params: {
          businessName: resolvedBusinessName,
          businessId: resolvedBusinessId,
          ratings: JSON.stringify(ratings),
          reviewText,
          reviewId: submittedReviewId ?? '',
        },
      });
    }
  }, [submitSuccess, reset, router, resolvedBusinessName, ratings, reviewText]);

  useEffect(() => {
    if (error) {
      crossPlatformAlert('Error', error);
    }
  }, [error]);

  const isSubmitDisabled =
    isSubmitting ||
    !reviewText.trim() ||
    (isGeneralRating ? generalRating === 0 : Object.values(ratings).some((r) => r === 0));

  return (
    <GuestGate>
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
              width: 44, height: 44, borderRadius: 22, backgroundColor: theme.card,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
          </Pressable>
        </View>

        {/* Business Hero */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: '100%', height: 140, backgroundColor: theme.card, position: 'relative' }}>
            <View style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: 80, backgroundColor: theme.background, opacity: 0.8,
            }} />
          </View>
          <View style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: theme.card,
            borderWidth: 3, borderColor: colors.neonPurple, alignItems: 'center',
            justifyContent: 'center', marginTop: -36,
          }}>
            <MaterialCommunityIcons name="store" size={32} color={colors.neonPurple} />
          </View>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: theme.text, marginTop: 10, textAlign: 'center' }}>
            {resolvedBusinessName}
          </AppText>
        </View>

        {/* Rating Section — general (1-5 stars) or per-criterion */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <Card style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20 }}>
            {isGeneralRating ? (
              /* General rating mode for 'other' category */
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <View style={{
                  width: 56, height: 56, borderRadius: 28, backgroundColor: `${colors.neonPurple}15`,
                  alignItems: 'center', justifyContent: 'center', marginBottom: 12,
                }}>
                  <MaterialCommunityIcons name="star-circle-outline" size={28} color={colors.neonPurple} />
                </View>
                <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
                  {t('writeReview.overallRating')}
                </AppText>
                {generalRating === 0 && (
                  <AppText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16 }}>
                    {t('writeReview.tapToRate')}
                  </AppText>
                )}
                {generalRating > 0 && (
                  <AppText style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 16 }}>
                    {generalRating} / 5
                  </AppText>
                )}
                <StarRating rating={generalRating} onRate={setGeneralRating} />
              </View>
            ) : (
              /* Per-criterion rating mode */
              ratingCriteria.map((criterion, idx) => (
                <View
                  key={criterion.key}
                  style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    paddingVertical: 14, borderBottomWidth: idx < ratingCriteria.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View style={{
                      width: 36, height: 36, borderRadius: 18, backgroundColor: `${colors.neonPurple}15`,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MaterialCommunityIcons
                        name={criterion.icon as React.ComponentProps<typeof MaterialCommunityIcons>['name']}
                        size={18}
                        color={colors.neonPurple}
                      />
                    </View>
                    <View>
                      <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>
                        {criterion.label}
                      </AppText>
                      {ratings[criterion.key] === 0 && (
                        <AppText style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2 }}>
                          {t('writeReview.tapToRate')}
                        </AppText>
                      )}
                    </View>
                  </View>
                  <StarRating rating={ratings[criterion.key] ?? 0} onRate={(v) => handleRate(criterion.key, v)} />
                </View>
              ))
            )}
          </Card>
        </View>

        {/* Write Your Review */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
            {t('writeReview.writeYourReview')}
          </AppText>
          <View style={{
            backgroundColor: theme.card, borderRadius: 14,
            borderWidth: 1, borderColor: theme.border, padding: 14, minHeight: 130,
          }}>
            <TextInput
              style={{ color: theme.text, fontSize: 15, lineHeight: 22, minHeight: 90, textAlignVertical: 'top' }}
              placeholder={t('writeReview.placeholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              maxLength={MAX_CHARS}
              value={reviewText}
              onChangeText={handleTextChange}
              accessibilityLabel={t('writeReview.writeYourReview')}
            />
            <AppText style={{ fontSize: 12, color: theme.textSecondary, textAlign: 'right', marginTop: 8 }}>
              {reviewText.length}/{MAX_CHARS}
            </AppText>
          </View>
        </View>

        {/* Add Photos */}
        <View style={{ paddingHorizontal: 20, marginBottom: 32 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text, marginBottom: 12 }}>
            {t('writeReview.addPhotos')}
          </AppText>
          <PhotoPicker photos={photos} onChange={setPhotos} />
        </View>

        {/* Content Guidelines */}
        <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
          <View style={{
            backgroundColor: `${colors.neonPurple}10`,
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: `${colors.neonPurple}25`,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <MaterialCommunityIcons name="information-outline" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }}>
                {t('writeReview.contentGuidelines')}
              </AppText>
            </View>
            <AppText style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>
              {t('writeReview.contentGuidelinesText')}
            </AppText>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <View style={{
            backgroundColor: 'rgba(239,68,68,0.06)',
            borderRadius: 12,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.15)',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <MaterialCommunityIcons name="shield-alert-outline" size={16} color="#F87171" />
              <AppText style={{ fontSize: 12, fontWeight: '600', color: '#F87171' }}>
                {t('common.legalNotice', { defaultValue: 'Legal Notice' })}
              </AppText>
            </View>
            <AppText style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 17 }}>
              {t('writeReview.legalDisclaimer')}
            </AppText>
          </View>
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
            icon={!isSubmitting ? <MaterialCommunityIcons name="arrow-right" size={20} color="#FFFFFF" /> : undefined}
          />
        </View>
      </ScrollView>
    </ScreenLayout>
    </GuestGate>
  );
}
