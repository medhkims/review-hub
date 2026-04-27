import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { DatePickerField } from '@/presentation/shared/components/ui/DatePickerField';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { SectionHeader } from '@/presentation/shared/components/ui/SectionHeader';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { router as expoRouter } from 'expo-router';

export default function PersonalInfoScreen() {
  useAnalyticsScreen(AnalyticsScreens.PERSONAL_INFO);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, error, isUploading, uploadProgress, updateProfile, updateEmail, uploadAvatar } = useProfile(user?.id);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email);
      setPhoneNumber(profile.phoneNumber || '');
      setGender(profile.gender ?? null);
      setDateOfBirth(profile.dateOfBirth ?? null);
    } else if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
    }
  }, [profile, user]);

  const handleSaveChanges = useCallback(async () => {
    if (!user) return;
    setIsUpdating(true);
    await updateProfile(user.id, {
      displayName,
      phoneNumber: phoneNumber || null,
      gender: gender ?? null,
      dateOfBirth: dateOfBirth ?? null,
    });
    setIsUpdating(false);
    if (!error) {
      Alert.alert(t('personalInfo.success'), t('personalInfo.updateSuccess'), [{ text: t('common.ok') }]);
    }
  }, [user, displayName, phoneNumber, gender, dateOfBirth, error, updateProfile, t]);

  const handleChangeEmail = useCallback(async () => {
    if (!user) return;
    if (email === profile?.email) {
      Alert.alert(t('personalInfo.error'), t('personalInfo.emailUnchanged'));
      return;
    }
    Alert.alert(
      t('changeEmail.title'),
      t('personalInfo.changeEmailConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsUpdating(true);
            await updateEmail(user.id, email);
            setIsUpdating(false);
            if (!error) {
              Alert.alert(t('personalInfo.success'), t('personalInfo.emailUpdateSuccess'), [{ text: t('common.ok') }]);
            }
          },
        },
      ]
    );
  }, [user, email, profile?.email, error, updateEmail, t]);

  const avatarPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback(
      async (uri: string, mimeType: string) => {
        if (!user) return;
        await uploadAvatar(user.id, uri, mimeType);
      },
      [user, uploadAvatar],
    ),
  });

  const handleEditAvatar = useCallback(async () => {
    if (!user) return;
    await avatarPicker.pickImage();
  }, [user, avatarPicker]);

  const handleDeleteAccount = useCallback(async () => {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await container.deleteAccountUseCase.execute();
    result.fold(
      (failure) => {
        setDeleteError(failure.message);
        setIsDeleting(false);
      },
      () => {
        setIsDeleting(false);
        setShowDeleteConfirm(false);
        expoRouter.replace('/(auth)/sign-in');
      },
    );
  }, []);

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (isLoading && !profile) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      </ScreenLayout>
    );
  }

  const displayUser = profile || user;
  const hasNameChanged = displayName !== (profile?.displayName || user?.displayName || '');
  const hasPhoneChanged = phoneNumber !== (profile?.phoneNumber || '');
  const hasGenderChanged = gender !== (profile?.gender ?? null);
  const hasDobChanged = (dateOfBirth?.getTime() ?? null) !== (profile?.dateOfBirth?.getTime() ?? null);
  const hasProfileChanges = hasNameChanged || hasPhoneChanged || hasGenderChanged || hasDobChanged;
  const hasEmailChanged = email !== (profile?.email || user?.email || '');

  return (
    <ScreenLayout withKeyboardAvoid>
      <ImageCropModal
        visible={avatarPicker.isPreviewVisible}
        imageUri={avatarPicker.pendingUri}
        onConfirm={avatarPicker.confirmImage}
        onRetake={avatarPicker.retakeImage}
        onCancel={avatarPicker.cancelPreview}
        isLoading={avatarPicker.isConfirming}
        originalWidth={avatarPicker.pendingWidth}
        originalHeight={avatarPicker.pendingHeight}
        aspect={avatarPicker.aspect}
      />
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
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
          accessibilityLabel={t('common.back')}
          style={{
            padding: 8,
            borderRadius: 9999,
            backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(148,163,184,0.2)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
          {t('personalInfo.title')}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <View style={{ position: 'relative' }}>
            <Avatar
              imageUrl={displayUser?.avatarUrl || null}
              size="xl"
              withGlow
              onEditPress={isUploading ? undefined : handleEditAvatar}
              initials={displayUser ? getInitials(displayUser.displayName) : '??'}
            />
            {isUploading && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: 9999,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color={colors.neonPurple} size="small" />
                <AppText style={{ color: theme.text, fontSize: 11, marginTop: 4 }}>
                  {Math.round(uploadProgress * 100)}%
                </AppText>
              </View>
            )}
          </View>

          <View style={{ marginTop: 16, alignItems: 'center' }}>
            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, letterSpacing: -0.3 }}>
              {displayUser?.displayName || 'Guest'}
            </AppText>
            <AppText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 4 }}>
              {displayUser?.email || ''}
            </AppText>
          </View>
        </View>

        {/* Profile Info Section */}
        <SectionHeader title={t('settings.profile')} />
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 24,
            gap: 4,
          }}
        >
          <AppInput
            label={t('personalInfo.fullName')}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('personalInfo.fullNamePlaceholder')}
            editable={!isUpdating}
            accessibilityLabel={t('personalInfo.fullName')}
          />
          <AppInput
            label={t('personalInfo.phoneNumber')}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder={t('personalInfo.phoneNumberPlaceholder')}
            keyboardType="phone-pad"
            editable={!isUpdating}
            accessibilityLabel={t('personalInfo.phoneNumber')}
          />

          {/* Gender Dropdown */}
          <View>
            <Pressable
              onPress={() => !isUpdating && setGenderDropdownOpen((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={t('personalInfo.gender')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                height: 52,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: genderDropdownOpen ? colors.neonPurple : theme.border,
                backgroundColor: 'transparent',
                paddingHorizontal: 16,
                gap: 10,
                opacity: isUpdating ? 0.5 : 1,
              }}
            >
              {gender ? (
                <MaterialCommunityIcons
                  name={gender === 'male' ? 'gender-male' : 'gender-female'}
                  size={18}
                  color={colors.neonPurple}
                />
              ) : (
                <MaterialCommunityIcons name="gender-male-female" size={18} color={theme.textMuted} />
              )}
              <AppText style={{
                flex: 1,
                fontSize: 15,
                color: gender ? theme.text : theme.textMuted,
              }}>
                {gender
                  ? t(`personalInfo.gender${gender === 'male' ? 'Male' : 'Female'}`)
                  : t('personalInfo.gender')}
              </AppText>
              <MaterialCommunityIcons
                name={genderDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>

            {genderDropdownOpen && (
              <View style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.card,
                marginTop: 4,
                overflow: 'hidden',
              }}>
                {(['male', 'female'] as const).map((g, index) => {
                  const isSelected = gender === g;
                  return (
                    <Pressable
                      key={g}
                      onPress={() => { setGender(g); setGenderDropdownOpen(false); }}
                      accessibilityRole="button"
                      accessibilityLabel={t(`personalInfo.gender${g === 'male' ? 'Male' : 'Female'}`)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 13,
                        borderTopWidth: index === 0 ? 0 : 1,
                        borderTopColor: theme.border,
                        backgroundColor: isSelected ? 'rgba(168,85,247,0.1)' : 'transparent',
                      }}
                    >
                      <MaterialCommunityIcons
                        name={g === 'male' ? 'gender-male' : 'gender-female'}
                        size={18}
                        color={isSelected ? colors.neonPurple : theme.textSecondary}
                      />
                      <AppText style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? colors.neonPurple : theme.text,
                      }}>
                        {t(`personalInfo.gender${g === 'male' ? 'Male' : 'Female'}`)}
                      </AppText>
                      {isSelected && (
                        <MaterialCommunityIcons name="check" size={16} color={colors.neonPurple} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          <DatePickerField
            value={dateOfBirth}
            onChange={setDateOfBirth}
            placeholder={t('personalInfo.birthdayPlaceholder')}
            disabled={isUpdating}
            accessibilityLabel={t('personalInfo.birthday')}
          />
        </View>

        <Pressable
          onPress={handleSaveChanges}
          disabled={isUpdating || !hasProfileChanges}
          accessibilityRole="button"
          accessibilityLabel={t('personalInfo.saveChanges')}
          style={{
            marginBottom: 24,
            borderRadius: 16,
            overflow: 'hidden',
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: hasProfileChanges ? 0.6 : 0,
            shadowRadius: 16,
            elevation: hasProfileChanges ? 10 : 0,
            backgroundColor: hasProfileChanges ? colors.neonPurple : theme.card,
            borderWidth: hasProfileChanges ? 0 : 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingVertical: 18,
          }}
        >
          <MaterialCommunityIcons
            name={isUpdating ? 'loading' : 'content-save-outline'}
            size={22}
            color={hasProfileChanges ? colors.textWhite : theme.textSecondary}
          />
          <AppText style={{ fontSize: 17, fontWeight: '700', color: hasProfileChanges ? colors.textWhite : theme.textSecondary, letterSpacing: 0.3 }}>
            {isUpdating ? t('common.saving') : t('personalInfo.saveChanges')}
          </AppText>
        </Pressable>

        {/* Email Section */}
        <SectionHeader title={t('changeEmail.title')} />
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 16,
            marginBottom: 24,
            gap: 4,
          }}
        >
          <AppInput
            label={t('personalInfo.email')}
            value={email}
            onChangeText={setEmail}
            placeholder={t('personalInfo.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isUpdating}
            accessibilityLabel={t('personalInfo.email')}
          />
        </View>

        <Pressable
          onPress={handleChangeEmail}
          disabled={isUpdating || !hasEmailChanged}
          accessibilityRole="button"
          accessibilityLabel={t('personalInfo.changeEmail')}
          style={{
            marginBottom: 24,
            borderRadius: 16,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: hasEmailChanged ? 0.6 : 0,
            shadowRadius: 16,
            elevation: hasEmailChanged ? 10 : 0,
            backgroundColor: hasEmailChanged ? colors.neonPurple : theme.card,
            borderWidth: hasEmailChanged ? 0 : 1,
            borderColor: theme.border,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            paddingVertical: 18,
          }}
        >
          <MaterialCommunityIcons
            name="email-edit-outline"
            size={22}
            color={hasEmailChanged ? colors.textWhite : theme.textSecondary}
          />
          <AppText style={{ fontSize: 17, fontWeight: '700', color: hasEmailChanged ? colors.textWhite : theme.textSecondary, letterSpacing: 0.3 }}>
            {t('personalInfo.changeEmail')}
          </AppText>
        </Pressable>

        {/* Error Message */}
        {error && (
          <View
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239, 68, 68, 0.3)',
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginBottom: 16,
            }}
          >
            <AppText style={{ color: '#F87171', fontSize: 14 }}>{error}</AppText>
          </View>
        )}

        {/* Delete Account — subtle link */}
        <Pressable
          onPress={() => setShowDeleteConfirm(true)}
          style={{ alignItems: 'center', marginTop: 24, marginBottom: 16 }}
          accessibilityRole="button"
          accessibilityLabel={t('settings.deleteAccount')}
        >
          <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
            {t('settings.deleteAccount')}
          </AppText>
        </Pressable>
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => !isDeleting && setShowDeleteConfirm(false)}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          onPress={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <Pressable
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              width: 320,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: theme.border,
            }}
            onPress={() => {}}
          >
            <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 16, paddingHorizontal: 20 }}>
              <View style={{
                width: 56, height: 56, borderRadius: 28,
                backgroundColor: 'rgba(239,68,68,0.15)',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <MaterialCommunityIcons name="alert-circle" size={32} color="#EF4444" />
              </View>
              <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, textAlign: 'center', marginBottom: 8 }}>
                {t('settings.deleteAccountTitle')}
              </AppText>
              <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                {t('settings.deleteAccountMessage')}
              </AppText>
              {deleteError && (
                <AppText style={{ fontSize: 13, color: '#EF4444', textAlign: 'center', marginTop: 12 }}>
                  {deleteError}
                </AppText>
              )}
            </View>
            <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: theme.border }}>
              <Pressable
                onPress={() => { setShowDeleteConfirm(false); setDeleteError(null); }}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderRightColor: theme.border }}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
              >
                <AppText style={{ fontSize: 15, fontWeight: '600', color: theme.text }}>{t('common.cancel')}</AppText>
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                disabled={isDeleting}
                style={{ flex: 1, paddingVertical: 16, alignItems: 'center' }}
                accessibilityRole="button"
                accessibilityLabel={t('settings.deleteAccountConfirm')}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <AppText style={{ fontSize: 15, fontWeight: '700', color: '#EF4444' }}>{t('settings.deleteAccountConfirm')}</AppText>
                )}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScreenLayout>
  );
}
