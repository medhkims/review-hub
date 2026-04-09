import React, { useState, useCallback } from 'react';
import { ScrollView, View, RefreshControl, Modal, Pressable, Share, Platform, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { BusinessCoverSection } from '../components/BusinessCoverSection';
import { ActionButtons } from '../components/ActionButtons';
import { ReviewsSection } from '../components/ReviewsSection';
import { InformationSection } from '../components/InformationSection';
import { DeliverySection } from '../components/DeliverySection';
import { MenuSection } from '../components/MenuSection';
import { DescriptionSection } from '../components/DescriptionSection';
import { useBusinessDetail } from '../hooks/useBusinessDetail';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { OpeningHours, DayKey } from '@/domain/business/entities/businessDetailEntity';
import { container } from '@/core/di/container';
import { auth } from '@/core/firebase/firebaseConfig';

const DAY_INDEX: DayKey[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function computeIsOpen(hours: OpeningHours): boolean {
  const now = new Date();
  const schedule = hours[DAY_INDEX[now.getDay()]];
  if (!schedule?.isOpen) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = schedule.openTime.split(':').map(Number);
  const [ch, cm] = schedule.closeTime.split(':').map(Number);
  return cur >= oh * 60 + om && cur < ch * 60 + cm;
}

interface BusinessDetailScreenProps {
  businessId: string;
}

export default function BusinessDetailScreen({ businessId }: BusinessDetailScreenProps) {
  useAnalyticsScreen(AnalyticsScreens.BUSINESS_DETAIL);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { business, reviews, isLoading, error, toggleWishlist, isWishlisted, checkHasReviewed, refresh } = useBusinessDetail(businessId);
  const [alreadyReviewedVisible, setAlreadyReviewedVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportDone, setReportDone] = useState(false);

  const REPORT_REASONS = [
    { key: 'spam', label: t('businessDetail.reportReasons.spam') },
    { key: 'inappropriate', label: t('businessDetail.reportReasons.inappropriate') },
    { key: 'wrongInfo', label: t('businessDetail.reportReasons.wrongInfo') },
    { key: 'closed', label: t('businessDetail.reportReasons.closed') },
    { key: 'other', label: t('businessDetail.reportReasons.other') },
  ];

  const handleShare = useCallback(async () => {
    if (!business) return;
    try {
      await Share.share({
        title: business.name,
        message: Platform.OS === 'ios'
          ? business.name
          : `${business.name} — ${business.categoryName}`,
        url: Platform.OS === 'ios' ? `https://tchecki.app/business/${business.id}` : undefined,
      });
    } catch {
      // user dismissed share sheet — no-op
    }
  }, [business]);

  const handleSubmitReport = useCallback(async () => {
    if (!business || !selectedReason) return;
    if (selectedReason === 'other' && !otherText.trim()) return;
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    setIsSubmittingReport(true);
    const finalReason = selectedReason === 'other'
      ? `other: ${otherText.trim()}`
      : selectedReason;
    const currentUser = auth.currentUser;
    const displayName = currentUser?.displayName
      || currentUser?.email?.split('@')[0]
      || 'Anonymous';
    await container.reportBusinessUseCase.execute({
      businessId: business.id,
      businessName: business.name,
      reason: finalReason,
      reportedByUserId: userId,
      reporterDisplayName: displayName,
    });
    setIsSubmittingReport(false);
    setReportDone(true);
  }, [business, selectedReason, otherText]);

  if (isLoading && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <LoadingIndicator />
      </View>
    );
  }

  if (error && !business) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center' }}>
        <ErrorView message={error} onRetry={refresh} />
      </View>
    );
  }

  if (!business) return null;

  // Badge only shown when hours are set AND visible to users
  const openStatus: boolean | null =
    business.openingHours && business.openingHoursVisible !== false
      ? computeIsOpen(business.openingHours)
      : null;

  const handleViewAllReviews = () => {
    router.push({
      pathname: '/(main)/(feed)/business-reviews' as const,
      params: { businessId: business.id, businessName: business.name, ...(business.logoUrl ? { businessLogoUrl: business.logoUrl } : {}) },
    } as never);
  };

  const handleAddReview = async () => {
    const hasReviewed = await checkHasReviewed();
    if (hasReviewed) {
      setAlreadyReviewedVisible(true);
      return;
    }
    router.push({
      pathname: '/(main)/(feed)/write-review' as const,
      params: {
        businessId: business.id,
        businessName: business.name,
        categoryId: business.categoryId,
      },
    } as never);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Already Reviewed Modal */}
      <Modal
        visible={alreadyReviewedVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlreadyReviewedVisible(false)}
        statusBarTranslucent
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.7)',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 32,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 24,
              padding: 28,
              width: '100%',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {/* Icon */}
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: `${colors.neonPurple}20`,
                borderWidth: 1,
                borderColor: `${colors.neonPurple}40`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
                shadowColor: colors.neonPurple,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
                elevation: 6,
              }}
            >
              <MaterialCommunityIcons name="star-check" size={30} color={colors.neonPurple} />
            </View>

            {/* Title */}
            <AppText
              style={{
                fontSize: 18,
                fontWeight: '700',
                color: theme.text,
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              {t('businessDetail.alreadyReviewed.title')}
            </AppText>

            {/* Message */}
            <AppText
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 24,
              }}
            >
              {t('businessDetail.alreadyReviewed.message', { businessName: business.name })}
            </AppText>

            {/* Buttons */}
            <View style={{ width: '100%', gap: 10 }}>
              <AppButton
                title={t('businessDetail.alreadyReviewed.seeMyReview')}
                variant="primary"
                size="md"
                shape="pill"
                accessibilityLabel={t('businessDetail.alreadyReviewed.seeMyReview')}
                accessibilityRole="button"
                onPress={() => {
                  setAlreadyReviewedVisible(false);
                  router.push('/(main)/(reviews)' as never);
                }}
              />
              <Pressable
                onPress={() => {
                  setAlreadyReviewedVisible(false);
                  router.replace('/(main)/(feed)' as never);
                }}
                accessibilityLabel={t('businessDetail.alreadyReviewed.goHome')}
                accessibilityRole="button"
                style={{ paddingVertical: 12, alignItems: 'center' }}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>
                  {t('businessDetail.alreadyReviewed.goHome')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setReportVisible(false); setSelectedReason(null); setOtherText(''); setReportDone(false); }}
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: theme.card,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: 24,
              paddingBottom: 40,
              borderWidth: 1,
              borderColor: theme.border,
            }}
          >
            {reportDone ? (
              <View style={{ alignItems: 'center', paddingVertical: 16 }}>
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: `${colors.success}20`,
                    borderWidth: 1,
                    borderColor: `${colors.success}40`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <MaterialCommunityIcons name="check-circle-outline" size={30} color={colors.success} />
                </View>
                <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 8 }}>
                  {t('businessDetail.reportSuccess')}
                </AppText>
                <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 24 }}>
                  {t('businessDetail.reportSuccessMessage')}
                </AppText>
                <AppButton
                  title={t('common.close')}
                  variant="primary"
                  size="md"
                  shape="pill"
                  accessibilityLabel={t('common.close')}
                  accessibilityRole="button"
                  onPress={() => { setReportVisible(false); setSelectedReason(null); setOtherText(''); setReportDone(false); }}
                />
              </View>
            ) : (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <MaterialCommunityIcons name="flag-outline" size={22} color={colors.neonPurple} />
                  <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginLeft: 8 }}>
                    {t('businessDetail.reportBusiness')}
                  </AppText>
                </View>
                <AppText style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 16 }}>
                  {t('businessDetail.reportReasonTitle')}
                </AppText>
                <View style={{ gap: 10, marginBottom: 24 }}>
                  {REPORT_REASONS.map(({ key, label }) => (
                    <Pressable
                      key={key}
                      onPress={() => setSelectedReason(key)}
                      accessibilityRole="radio"
                      accessibilityLabel={label}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        padding: 14,
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: selectedReason === key ? colors.neonPurple : 'rgba(255,255,255,0.1)',
                        backgroundColor: selectedReason === key ? `${colors.neonPurple}15` : 'transparent',
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: selectedReason === key ? colors.neonPurple : theme.textMuted,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        {selectedReason === key && (
                          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.neonPurple }} />
                        )}
                      </View>
                      <AppText style={{ fontSize: 14, color: selectedReason === key ? theme.text : theme.textSecondary, flex: 1 }}>
                        {label}
                      </AppText>
                    </Pressable>
                  ))}
                </View>

                {/* "Other" custom text input */}
                {selectedReason === 'other' && (
                  <>
                    <TextInput
                      value={otherText}
                      onChangeText={setOtherText}
                      placeholder={t('businessDetail.reportOtherPlaceholder')}
                      placeholderTextColor={theme.textMuted}
                      multiline
                      maxLength={200}
                      accessibilityLabel={t('businessDetail.reportOtherPlaceholder')}
                      style={{
                        marginTop: 4,
                        marginBottom: 4,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderWidth: 1.5,
                        borderColor: otherText.trim() ? colors.neonPurple : 'rgba(255,255,255,0.15)',
                        borderRadius: 12,
                        padding: 14,
                        color: theme.text,
                        fontSize: 14,
                        minHeight: 90,
                        textAlignVertical: 'top',
                      }}
                    />
                    <AppText style={{ fontSize: 12, color: otherText.length >= 200 ? colors.error : theme.textMuted, textAlign: 'right', marginBottom: 16 }}>
                      {otherText.length}/200
                    </AppText>
                  </>
                )}

                <View style={{ gap: 10 }}>
                  <AppButton
                    title={isSubmittingReport ? t('common.saving') : t('businessDetail.reportSubmit')}
                    variant="primary"
                    size="md"
                    shape="pill"
                    accessibilityLabel={t('businessDetail.reportSubmit')}
                    accessibilityRole="button"
                    onPress={handleSubmitReport}
                    disabled={!selectedReason || isSubmittingReport || (selectedReason === 'other' && !otherText.trim())}
                  />
                  <Pressable
                    onPress={() => { setReportVisible(false); setSelectedReason(null); setOtherText(''); }}
                    accessibilityLabel={t('common.cancel')}
                    accessibilityRole="button"
                    style={{ paddingVertical: 12, alignItems: 'center' }}
                  >
                    <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.textSecondary }}>
                      {t('common.cancel')}
                    </AppText>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      >
        {/* Cover + Logo + Name + Rating */}
        <BusinessCoverSection
          coverImageUrl={business.coverImageUrl}
          logoUrl={business.logoUrl}
          categoryId={business.categoryId}
          name={business.name}
          categoryName={business.categoryName}
          openStatus={openStatus}
          rating={business.rating}
          reviewCount={business.reviewCount}
          onBackPress={() => router.back()}
          onRatingPress={handleViewAllReviews}
          onSharePress={handleShare}
          onReportPress={() => { setSelectedReason(null); setOtherText(''); setReportDone(false); setReportVisible(true); }}
        />

        {/* Action Buttons */}
        <ActionButtons
          isWishlisted={isWishlisted(business.id)}
          onAddReview={handleAddReview}
          onToggleWishlist={toggleWishlist}
        />

        {/* Sections */}
        <View style={{ paddingHorizontal: 20, gap: 32 }}>
          {/* Description Section */}
          <DescriptionSection description={business.description} />

          {/* Reviews Section */}
          <ReviewsSection
            rating={business.rating}
            ratingDistribution={business.ratingDistribution}
            categoryRatings={business.categoryRatings}
            reviews={reviews}
            onViewAllReviews={handleViewAllReviews}
          />

          {/* Information Section */}
          <InformationSection
            location={business.location}
            contact={business.contact}
            isOnline={business.isOnline}
            businessId={business.id}
            openingHours={business.openingHours}
            openingHoursVisible={business.openingHoursVisible}
          />

          {/* Delivery Section */}
          <DeliverySection deliveryServices={business.deliveryServices} businessId={business.id} />

          {/* Menu Section */}
          <MenuSection menuCategories={business.menuCategories} businessId={business.id} />
        </View>
      </ScrollView>
    </View>
  );
}
