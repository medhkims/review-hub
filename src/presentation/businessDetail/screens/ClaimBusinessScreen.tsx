import React, { useState, useCallback } from 'react';
import { View, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { container } from '@/core/di/container';

export default function ClaimBusinessScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const { businessId, businessName } = useLocalSearchParams<{ businessId: string; businessName: string }>();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState(user?.displayName || '');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [proof, setProof] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const canSubmit = fullName.trim() && role.trim() && phone.trim() && email.trim() && proof.trim() && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !user?.id || !businessId) return;
    setIsSubmitting(true);
    const result = await container.claimBusinessUseCase.execute({
      businessId,
      businessName: businessName || '',
      claimantUserId: user.id,
      claimantName: fullName.trim(),
      claimantEmail: email.trim(),
      claimantPhone: phone.trim(),
      claimantRole: role.trim(),
      proofDescription: proof.trim(),
    });
    setIsSubmitting(false);
    result.fold(
      () => { /* handle error if needed */ },
      () => setIsDone(true),
    );
  }, [canSubmit, user, businessId, businessName, fullName, email, phone, role, proof]);

  const inputStyle = {
    backgroundColor: theme.card,
    borderWidth: 1.5,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 14,
    color: theme.text,
    fontSize: 14,
  };

  if (isDone) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 }}>
        <View style={{
          width: 72, height: 72, borderRadius: 36,
          backgroundColor: `${colors.success}20`, borderWidth: 1, borderColor: `${colors.success}40`,
          alignItems: 'center', justifyContent: 'center', marginBottom: 20,
        }}>
          <MaterialCommunityIcons name="check-circle-outline" size={36} color={colors.success} />
        </View>
        <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 10 }}>
          {t('businessDetail.claimSubmitted')}
        </AppText>
        <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 28 }}>
          {t('businessDetail.claimSubmittedMessage')}
        </AppText>
        <AppButton
          title={t('common.close')}
          variant="primary"
          size="md"
          shape="pill"
          accessibilityLabel={t('common.close')}
          accessibilityRole="button"
          onPress={() => router.back()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <MaterialCommunityIcons name="store-check-outline" size={24} color={colors.neonPurple} />
          <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, marginLeft: 8 }}>
            {t('businessDetail.claimBusiness')}
          </AppText>
        </View>

        <AppText style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 20, marginBottom: 8 }}>
          {t('businessDetail.claimBusinessDescription')}
        </AppText>

        {/* Business name being claimed */}
        <View style={{
          backgroundColor: `${colors.neonPurple}10`, borderRadius: 12, padding: 14,
          borderWidth: 1, borderColor: `${colors.neonPurple}30`, marginBottom: 24,
        }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
            {businessName}
          </AppText>
        </View>

        {/* Form fields */}
        <View style={{ gap: 16 }}>
          {/* Full Name */}
          <View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
              {t('businessDetail.claimFullName')}
            </AppText>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('businessDetail.claimFullName')}
              placeholderTextColor={theme.textMuted}
              style={inputStyle}
              accessibilityLabel={t('businessDetail.claimFullName')}
            />
          </View>

          {/* Role */}
          <View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
              {t('businessDetail.claimRole')}
            </AppText>
            <TextInput
              value={role}
              onChangeText={setRole}
              placeholder={t('businessDetail.claimRolePlaceholder')}
              placeholderTextColor={theme.textMuted}
              style={inputStyle}
              accessibilityLabel={t('businessDetail.claimRole')}
            />
          </View>

          {/* Phone */}
          <View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
              {t('businessDetail.claimPhone')}
            </AppText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+216"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
              style={inputStyle}
              accessibilityLabel={t('businessDetail.claimPhone')}
            />
          </View>

          {/* Email */}
          <View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
              {t('businessDetail.claimEmail')}
            </AppText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('businessDetail.claimEmail')}
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={inputStyle}
              accessibilityLabel={t('businessDetail.claimEmail')}
            />
          </View>

          {/* Proof */}
          <View>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: theme.text, marginBottom: 6 }}>
              {t('businessDetail.claimProof')}
            </AppText>
            <TextInput
              value={proof}
              onChangeText={setProof}
              placeholder={t('businessDetail.claimProofPlaceholder')}
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              maxLength={500}
              style={{ ...inputStyle, minHeight: 100, textAlignVertical: 'top' }}
              accessibilityLabel={t('businessDetail.claimProof')}
            />
            <AppText style={{ fontSize: 12, color: proof.length >= 500 ? colors.error : theme.textMuted, textAlign: 'right', marginTop: 4 }}>
              {proof.length}/500
            </AppText>
          </View>
        </View>

        {/* Submit */}
        <View style={{ marginTop: 24 }}>
          <AppButton
            title={isSubmitting ? t('common.saving') : t('businessDetail.claimBusinessButton')}
            variant="primary"
            size="lg"
            shape="pill"
            icon={<MaterialCommunityIcons name="store-check-outline" size={20} color={colors.white} />}
            accessibilityLabel={t('businessDetail.claimBusinessButton')}
            accessibilityRole="button"
            onPress={handleSubmit}
            disabled={!canSubmit}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
