import React, { useState, useCallback } from 'react';
import { View, Modal, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/core/theme/useTheme';
import { colors } from '@/core/theme/colors';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';

interface ReportReviewModalProps {
  visible: boolean;
  onClose: () => void;
  reviewId: string;
  businessId: string;
  businessName: string;
  reviewAuthorId: string;
  reviewAuthorName: string;
  reviewText: string;
  reviewRating: number;
}

const REASONS = [
  'false_claims',
  'never_visited',
  'competitor',
  'defamatory',
  'outdated',
  'other',
] as const;

type ReasonKey = (typeof REASONS)[number];

export const ReportReviewModal: React.FC<ReportReviewModalProps> = ({
  visible,
  onClose,
  reviewId,
  businessId,
  businessName,
  reviewAuthorId,
  reviewAuthorName,
  reviewText,
  reviewRating,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const user = useAuthStore((s) => s.user);

  const [reason, setReason] = useState<ReasonKey | null>(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const canSubmit = reason !== null && explanation.trim().length >= 20 && !isLoading;

  const handleClose = useCallback(() => {
    setReason(null);
    setExplanation('');
    setSuccess(false);
    setIsLoading(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !user) return;
    setIsLoading(true);
    const result = await container.submitDisputeUseCase.execute({
      reviewId,
      businessId,
      businessName,
      reviewAuthorId,
      reviewAuthorName,
      reviewText,
      reviewRating,
      disputedById: user.id,
      disputedByName: user.displayName,
      disputedByEmail: user.email,
      reason,
      explanation: explanation.trim(),
      evidenceUrls: [],
    });
    setIsLoading(false);
    result.fold(
      () => {},
      () => {
        setSuccess(true);
        setTimeout(handleClose, 1500);
      },
    );
  }, [canSubmit, user, reviewId, businessId, businessName, reviewAuthorId, reviewAuthorName, reviewText, reviewRating, reason, explanation, handleClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '85%',
            paddingBottom: 32,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <AppText style={{ fontSize: 18, fontWeight: '700' }}>{t('dispute.reportReview')}</AppText>
            <Pressable onPress={handleClose} accessibilityLabel={t('common.close')} accessibilityRole="button">
              <MaterialCommunityIcons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          {success ? (
            <View style={{ alignItems: 'center', padding: 40 }}>
              <MaterialCommunityIcons name="check-circle" size={56} color={colors.success} />
              <AppText style={{ marginTop: 16, fontSize: 16, fontWeight: '600' }}>
                {t('dispute.submitSuccess')}
              </AppText>
            </View>
          ) : (
            <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
              {/* Reason selector */}
              <AppText style={{ fontSize: 14, fontWeight: '600', marginBottom: 12 }}>
                {t('dispute.selectReason')}
              </AppText>
              {REASONS.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setReason(key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                  }}
                  accessibilityRole="radio"
                  accessibilityLabel={t(`dispute.reason_${key}`)}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: reason === key ? colors.neonPurple : theme.textMuted,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    {reason === key && (
                      <View
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: colors.neonPurple,
                        }}
                      />
                    )}
                  </View>
                  <AppText style={{ fontSize: 14 }}>{t(`dispute.reason_${key}`)}</AppText>
                </Pressable>
              ))}

              {/* Explanation */}
              <AppText style={{ fontSize: 14, fontWeight: '600', marginTop: 16, marginBottom: 8 }}>
                {t('dispute.explanation')}
              </AppText>
              <TextInput
                value={explanation}
                onChangeText={setExplanation}
                placeholder={t('dispute.explanationPlaceholder')}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderRadius: 10,
                  padding: 12,
                  fontSize: 14,
                  minHeight: 100,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
                accessibilityLabel={t('dispute.explanation')}
              />
              <AppText style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
                {explanation.trim().length}/20 min
              </AppText>

              {/* Submit */}
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={{
                  backgroundColor: canSubmit ? colors.neonPurple : theme.textMuted,
                  borderRadius: 12,
                  paddingVertical: 14,
                  alignItems: 'center',
                  marginTop: 20,
                  opacity: canSubmit ? 1 : 0.6,
                }}
                accessibilityRole="button"
                accessibilityLabel={t('dispute.submit')}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <AppText style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                    {t('dispute.submit')}
                  </AppText>
                )}
              </Pressable>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};
