import React, { useCallback, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Image,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { Card } from '@/presentation/shared/components/ui/Card';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';
import { useHome } from '../hooks/useHome';

// ── Image Upload Box ──────────────────────────────────────────────────────────

interface ImageUploadBoxProps {
  label: string;
  imageUri: string | null;
  onPick: () => void;
  onRemove: () => void;
  height: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  hintText: string;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label, imageUri, onPick, onRemove, height, icon, hintText,
}) => {
  const theme = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <AppText style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 6, fontWeight: '500' }}>
        {label}
      </AppText>
      <Pressable
        onPress={onPick}
        accessibilityLabel={label}
        accessibilityRole="button"
        style={{
          height,
          borderStyle: 'dashed',
          borderWidth: 1.5,
          borderColor: theme.border,
          borderRadius: 12,
          backgroundColor: theme.card,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={label} />
        ) : (
          <View style={{ alignItems: 'center' }}>
            <MaterialCommunityIcons name={icon} size={24} color={theme.textMuted} />
            <AppText style={{ color: theme.textMuted, fontSize: 12, marginTop: 6 }}>{hintText}</AppText>
          </View>
        )}
      </Pressable>
      {imageUri && (
        <Pressable
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${label}`}
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(15,23,42,0.8)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="close" size={16} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
};

// ── Alert Modal ───────────────────────────────────────────────────────────────

interface AlertModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose?: () => void;
  buttons: { label: string; onPress: () => void; variant?: 'primary' | 'secondary' }[];
}

const AlertModal: React.FC<AlertModalProps> = ({ visible, title, message, onClose, buttons }) => {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, width: '100%', borderWidth: 1, borderColor: theme.border }}>
          {onClose && (
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={{ position: 'absolute', top: 12, right: 12, padding: 4 }}
            >
              <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
            </Pressable>
          )}
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, marginBottom: 8, textAlign: 'center' }}>
            {title}
          </AppText>
          <AppText style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
            {message}
          </AppText>
          {buttons.map((btn, i) => (
            <Pressable
              key={i}
              onPress={btn.onPress}
              accessibilityRole="button"
              accessibilityLabel={btn.label}
              style={{
                backgroundColor: btn.variant === 'primary' ? colors.neonPurple : 'transparent',
                borderWidth: btn.variant !== 'primary' ? 1 : 0,
                borderColor: theme.border,
                borderRadius: 12,
                paddingVertical: 13,
                alignItems: 'center',
                marginBottom: i < buttons.length - 1 ? 10 : 0,
              }}
            >
              <AppText style={{ color: btn.variant === 'primary' ? '#FFFFFF' : theme.textSecondary, fontWeight: '600', fontSize: 15 }}>
                {btn.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AddBusinessScreen() {
  useAnalyticsScreen(AnalyticsScreens.ADD_BUSINESS);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { prefillName, isAdmin } = useLocalSearchParams<{ prefillName?: string; isAdmin?: string }>();
  const adminMode = isAdmin === 'true';

  const { submitBusiness, checkBusinessDuplicate } = useHome();

  // Form state
  const [businessName, setBusinessName] = useState(prefillName ?? '');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Duplicate modal state
  const [duplicateModal, setDuplicateModal] = useState<{
    visible: boolean;
    type: 'exact' | 'similar';
    businessId: string;
    businessName: string;
  }>({ visible: false, type: 'exact', businessId: '', businessName: '' });

  const handleBack = useCallback(() => { router.back(); }, [router]);

  const logoPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setLogoUri(uri); }, []),
  });

  const coverPicker = useImagePickerWithPreview({
    aspect: [16, 9],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setCoverUri(uri); }, []),
  });

  const doSubmit = useCallback(async () => {
    const resultId = await submitBusiness({
      businessName: businessName.trim(),
      categoryId: selectedCategoryId,
      categoryName: selectedCategoryName,
      location: location.trim(),
      website: website.trim() || undefined,
      isAdminSubmit: adminMode,
    });
    setIsSubmitting(false);
    if (resultId) {
      if (adminMode) {
        router.replace(`/(main)/(feed)/business/${resultId}`);
      } else {
        router.replace({
          pathname: '/(main)/(feed)/business-pending',
          params: {
            businessName: businessName.trim(),
            categoryName: selectedCategoryName,
            location: location.trim(),
          },
        });
      }
    } else {
      setValidationError(t('home.addBusiness.submitError'));
    }
  }, [submitBusiness, businessName, selectedCategoryId, selectedCategoryName, location, website, router, t, adminMode]);

  const handleSubmit = useCallback(async () => {
    setValidationError(null);

    if (!businessName.trim()) {
      setValidationError(t('home.addBusiness.businessNameRequired'));
      return;
    }
    if (!selectedCategoryId) {
      setValidationError(t('home.addBusiness.categoryRequired'));
      return;
    }
    if (!location.trim()) {
      setValidationError(t('home.addBusiness.locationRequired'));
      return;
    }

    setIsSubmitting(true);

    const dupeResult = await checkBusinessDuplicate(businessName.trim(), selectedCategoryId);
    const dupeData = dupeResult.fold(() => null, (data) => data);

    if (dupeData?.exact) {
      setIsSubmitting(false);
      setDuplicateModal({ visible: true, type: 'exact', businessId: dupeData.exact.id, businessName: dupeData.exact.name });
      return;
    }

    if (dupeData?.similar) {
      setIsSubmitting(false);
      setDuplicateModal({ visible: true, type: 'similar', businessId: dupeData.similar.id, businessName: dupeData.similar.name });
      return;
    }

    await doSubmit();
  }, [businessName, selectedCategoryId, location, checkBusinessDuplicate, doSubmit, t]);

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
            <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
          </Pressable>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text, flex: 1, textAlign: 'center', marginRight: 40 }}>
            {t('home.addBusiness.title')}
          </AppText>
        </View>

        {/* Hero icon */}
        <View style={{ alignItems: 'center', marginTop: 4, marginBottom: 16 }}>
          <View style={{
            width: 72, height: 72, borderRadius: 36, backgroundColor: theme.card,
            alignItems: 'center', justifyContent: 'center',
            shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5, shadowRadius: 16, elevation: 8,
          }}>
            <MaterialCommunityIcons name="store-plus" size={32} color={colors.neonPurple} />
          </View>
          <AppText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 10, textAlign: 'center' }}>
            {t('home.addBusiness.subtitle')}
          </AppText>
        </View>

        {/* Business Details Card */}
        <View style={{ paddingHorizontal: 24, marginTop: 4 }}>
          <Card style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 20 }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 16 }}>
              {t('home.addBusiness.businessDetails')}
            </AppText>

            <AppInput
              label={t('home.addBusiness.businessName')}
              placeholder={t('home.addBusiness.businessNamePlaceholder')}
              value={businessName}
              onChangeText={setBusinessName}
              accessibilityLabel={t('home.addBusiness.businessName')}
            />

            {/* Category Selector */}
            <View style={{ marginBottom: 16 }}>
              <AppText style={{ color: theme.textSecondary, fontSize: 14, marginBottom: 4, fontWeight: '500' }}>
                {t('home.addBusiness.category')}
              </AppText>
              <Pressable
                onPress={() => setShowCategoryPicker(true)}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background,
                  borderWidth: 1, borderColor: selectedCategoryId ? colors.neonPurple : theme.border,
                  borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, opacity: pressed ? 0.7 : 1,
                })}
                accessibilityLabel={t('home.addBusiness.category')}
                accessibilityRole="button"
              >
                <AppText style={{ flex: 1, color: selectedCategoryId ? theme.text : theme.textMuted, fontSize: 15 }}>
                  {selectedCategoryId ? selectedCategoryName : t('home.addBusiness.categoryPlaceholder')}
                </AppText>
                <MaterialCommunityIcons name="chevron-down" size={22} color={theme.textMuted} />
              </Pressable>
            </View>

            <AppInput
              label={t('home.addBusiness.location')}
              placeholder={t('home.addBusiness.locationPlaceholder')}
              value={location}
              onChangeText={setLocation}
              accessibilityLabel={t('home.addBusiness.location')}
              rightIcon={<MaterialCommunityIcons name="map-marker-outline" size={22} color={theme.textMuted} />}
            />

            <AppInput
              label={`${t('home.addBusiness.website')} (${t('home.addBusiness.optional')})`}
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
        <View style={{ paddingHorizontal: 24, marginTop: 16 }}>
          <Card style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border, borderRadius: 16, padding: 20 }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 4 }}>
              {t('home.addBusiness.media')}
            </AppText>
            <AppText style={{ fontSize: 12, color: theme.textMuted, marginBottom: 16 }}>
              ({t('home.addBusiness.optional')})
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <ImageUploadBox
                label={t('home.addBusiness.logo')}
                imageUri={logoUri}
                onPick={logoPicker.pickImage}
                onRemove={() => setLogoUri(null)}
                height={100}
                icon="store-outline"
                hintText="PNG / JPG"
              />
              <ImageUploadBox
                label={t('home.addBusiness.coverPicture')}
                imageUri={coverUri}
                onPick={coverPicker.pickImage}
                onRemove={() => setCoverUri(null)}
                height={100}
                icon="image-outline"
                hintText="16:9"
              />
            </View>
          </Card>
        </View>

        {/* Validation error */}
        {validationError && (
          <View style={{ paddingHorizontal: 24, marginTop: 12 }}>
            <View style={{ backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}>
              <AppText style={{ color: '#F87171', fontSize: 14 }}>{validationError}</AppText>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={{ paddingHorizontal: 24, marginTop: 24, gap: 12 }}>
          <AppButton
            title={t('home.addBusiness.submitBusiness')}
            size="lg"
            onPress={handleSubmit}
            isLoading={isSubmitting}
            accessibilityLabel={t('home.addBusiness.submitBusiness')}
            accessibilityRole="button"
          />
          <Pressable
            onPress={handleBack}
            style={{ paddingVertical: 14, alignItems: 'center' }}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          >
            <AppText style={{ color: theme.textSecondary, fontSize: 15, fontWeight: '600' }}>
              {t('common.cancel')}
            </AppText>
          </Pressable>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
                {t('home.addBusiness.category')}
              </AppText>
              <Pressable onPress={() => setShowCategoryPicker(false)} accessibilityRole="button" accessibilityLabel="Close">
                <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
            <FlatList
              data={CATEGORIES_DATA}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: 12 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setSelectedCategoryId(item.id);
                    setSelectedCategoryName(item.name);
                    setShowCategoryPicker(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center',
                    paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 4,
                    backgroundColor: item.id === selectedCategoryId
                      ? 'rgba(168,85,247,0.15)'
                      : pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
                  })}
                  accessibilityLabel={item.name}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons
                    name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                    size={22}
                    color={item.id === selectedCategoryId ? colors.neonPurple : theme.textSecondary}
                    style={{ marginRight: 14 }}
                  />
                  <AppText style={{
                    fontSize: 15, flex: 1,
                    color: item.id === selectedCategoryId ? colors.neonPurple : theme.text,
                    fontWeight: item.id === selectedCategoryId ? '700' : '500',
                  }}>
                    {item.name}
                  </AppText>
                  {item.id === selectedCategoryId && (
                    <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Exact Duplicate Modal */}
      <AlertModal
        visible={duplicateModal.visible && duplicateModal.type === 'exact'}
        title={t('home.addBusiness.duplicateTitle')}
        message={t('home.addBusiness.duplicateMessage')}
        onClose={() => setDuplicateModal((d) => ({ ...d, visible: false }))}
        buttons={[
          {
            label: t('home.addBusiness.goToBusiness'),
            variant: 'primary',
            onPress: () => {
              setDuplicateModal((d) => ({ ...d, visible: false }));
              router.push(`/(main)/(feed)/business/${duplicateModal.businessId}`);
            },
          },
          {
            label: t('home.addBusiness.goHome'),
            onPress: () => {
              setDuplicateModal((d) => ({ ...d, visible: false }));
              router.replace('/(main)/(feed)');
            },
          },
        ]}
      />

      {/* Similar Business Modal */}
      <AlertModal
        visible={duplicateModal.visible && duplicateModal.type === 'similar'}
        title={t('home.addBusiness.similarTitle')}
        message={t('home.addBusiness.similarMessage', { name: duplicateModal.businessName })}
        onClose={() => setDuplicateModal((d) => ({ ...d, visible: false }))}
        buttons={[
          {
            label: t('home.addBusiness.yesOpenBusiness'),
            variant: 'primary',
            onPress: () => {
              setDuplicateModal((d) => ({ ...d, visible: false }));
              router.push(`/(main)/(feed)/business/${duplicateModal.businessId}`);
            },
          },
          {
            label: t('home.addBusiness.noOtherBusiness'),
            onPress: async () => {
              setDuplicateModal((d) => ({ ...d, visible: false }));
              setIsSubmitting(true);
              await doSubmit();
            },
          },
        ]}
      />

      {isSubmitting && (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      )}
      <ImageCropModal
        visible={logoPicker.isPreviewVisible}
        imageUri={logoPicker.pendingUri}
        originalWidth={logoPicker.pendingWidth}
        originalHeight={logoPicker.pendingHeight}
        aspect={logoPicker.aspect}
        onConfirm={logoPicker.confirmImage}
        onRetake={logoPicker.retakeImage}
        onCancel={logoPicker.cancelPreview}
      />
      <ImageCropModal
        visible={coverPicker.isPreviewVisible}
        imageUri={coverPicker.pendingUri}
        originalWidth={coverPicker.pendingWidth}
        originalHeight={coverPicker.pendingHeight}
        aspect={coverPicker.aspect}
        onConfirm={coverPicker.confirmImage}
        onRetake={coverPicker.retakeImage}
        onCancel={coverPicker.cancelPreview}
      />
    </ScreenLayout>
  );
}
