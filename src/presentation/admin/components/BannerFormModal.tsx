import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  Switch,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';

interface BannerFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingBanner?: BannerEntity | null;
}

const FIELD_STYLE = {
  backgroundColor: 'rgba(51,65,85,0.4)',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: 'rgba(51,65,85,0.6)',
  paddingHorizontal: 14,
  paddingVertical: 12,
  color: '#fff' as const,
  fontSize: 15,
};

export function BannerFormModal({ visible, onClose, onSaved, editingBanner }: BannerFormModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | undefined>(undefined);
  const [isNewImage, setIsNewImage] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isClickable, setIsClickable] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setTitle(editingBanner?.title ?? '');
      setDescription(editingBanner?.description ?? '');
      setContent(editingBanner?.content ?? '');
      setImageUri(editingBanner?.imageUrl ?? null);
      setImageMimeType(undefined);
      setIsNewImage(false);
      setIsActive(editingBanner?.isActive ?? true);
      setIsClickable(editingBanner?.isClickable ?? true);
      setSortOrder(String(editingBanner?.sortOrder ?? 0));
      setError(null);
    }
  }, [visible, editingBanner]);

  const bannerPicker = useImagePickerWithPreview({
    aspect: [16, 9],
    quality: 0.85,
    onSelected: useCallback((uri: string, mimeType: string) => {
      setImageUri(uri);
      setImageMimeType(mimeType);
      setIsNewImage(true);
    }, []),
  });

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError(t('admin.banners.titleRequired'));
      return;
    }
    if (!imageUri) {
      setError(t('admin.banners.imageRequired'));
      return;
    }
    setIsSaving(true);
    setError(null);

    const order = parseInt(sortOrder, 10) || 0;

    let result;
    if (editingBanner) {
      result = await container.updateBannerUseCase.execute(editingBanner.id, {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        isActive,
        isClickable,
        sortOrder: order,
        ...(isNewImage && { imageUri: imageUri, mimeType: imageMimeType }),
      });
    } else {
      result = await container.createBannerUseCase.execute({
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        imageUri,
        mimeType: imageMimeType,
        isActive,
        isClickable,
        sortOrder: order,
      });
    }

    result.fold(
      (failure) => setError(failure.message),
      () => onSaved(),
    );
    setIsSaving(false);
  }, [title, description, content, imageUri, imageMimeType, isNewImage, isActive, isClickable, sortOrder, editingBanner, onSaved, t]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ImageCropModal
        visible={bannerPicker.isPreviewVisible}
        imageUri={bannerPicker.pendingUri}
        onConfirm={bannerPicker.confirmImage}
        onRetake={bannerPicker.retakeImage}
        onCancel={bannerPicker.cancelPreview}
        originalWidth={bannerPicker.pendingWidth}
        originalHeight={bannerPicker.pendingHeight}
        aspect={bannerPicker.aspect}
      />
      <View style={{ flex: 1, backgroundColor: colors.midnight }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(51,65,85,0.3)',
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
            {editingBanner ? t('admin.banners.editBanner') : t('admin.banners.addBanner')}
          </AppText>
          <Pressable
            onPress={onClose}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            style={{ padding: 4 }}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.textSlate400} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 20 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {error && (
            <View
              style={{
                backgroundColor: 'rgba(239,68,68,0.12)',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <AppText style={{ color: '#EF4444', fontSize: 13 }}>{error}</AppText>
            </View>
          )}

          {/* Image Picker */}
          <View>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {t('admin.banners.image')}
            </AppText>
            <Pressable
              onPress={bannerPicker.pickImage}
              accessibilityLabel={t('admin.banners.tapToSelectImage')}
              accessibilityRole="button"
              style={{
                width: '100%',
                height: 160,
                borderRadius: 14,
                overflow: 'hidden',
                backgroundColor: colors.cardDark,
                borderWidth: 2,
                borderColor: imageUri ? colors.neonPurple : 'rgba(51,65,85,0.5)',
                borderStyle: imageUri ? 'solid' : 'dashed',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="image-plus" size={36} color={colors.textSlate500} />
                  <AppText style={{ color: colors.textSlate500, fontSize: 13 }}>
                    {t('admin.banners.tapToSelectImage')}
                  </AppText>
                </View>
              )}
            </Pressable>
            {imageUri && (
              <Pressable
                onPress={bannerPicker.pickImage}
                style={{ marginTop: 8, alignSelf: 'flex-end' }}
                accessibilityLabel={t('admin.banners.changeImage')}
                accessibilityRole="button"
              >
                <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
                  {t('admin.banners.changeImage')}
                </AppText>
              </Pressable>
            )}
          </View>

          {/* Title */}
          <View>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {t('admin.banners.titleLabel')}
            </AppText>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={FIELD_STYLE}
              placeholderTextColor="rgba(148,163,184,0.6)"
              placeholder="e.g. Summer Sale"
              accessibilityLabel={t('admin.banners.titleLabel')}
            />
          </View>

          {/* Description */}
          <View>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {t('admin.banners.descriptionLabel')}
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              style={[FIELD_STYLE, { minHeight: 96, textAlignVertical: 'top' }]}
              placeholderTextColor="rgba(148,163,184,0.6)"
              placeholder="Optional details shown on the detail page"
              accessibilityLabel={t('admin.banners.descriptionLabel')}
            />
          </View>

          {/* Content */}
          <View>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {t('admin.banners.contentLabel')}
            </AppText>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={6}
              style={[FIELD_STYLE, { minHeight: 140, textAlignVertical: 'top' }]}
              placeholderTextColor="rgba(148,163,184,0.6)"
              placeholder={t('admin.banners.contentPlaceholder')}
              accessibilityLabel={t('admin.banners.contentLabel')}
            />
            <AppText style={{ color: colors.textSlate500, fontSize: 12, marginTop: 4 }}>
              {t('admin.banners.contentHint')}
            </AppText>
          </View>

          {/* Sort Order */}
          <View>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 12,
                fontWeight: '600',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.6,
              }}
            >
              {t('admin.banners.sortOrder')}
            </AppText>
            <TextInput
              value={sortOrder}
              onChangeText={setSortOrder}
              keyboardType="number-pad"
              style={[FIELD_STYLE, { width: 120 }]}
              placeholderTextColor="rgba(148,163,184,0.6)"
              placeholder="0"
              accessibilityLabel={t('admin.banners.sortOrder')}
            />
            <AppText style={{ color: colors.textSlate500, fontSize: 12, marginTop: 4 }}>
              {t('admin.banners.sortOrderHint')}
            </AppText>
          </View>

          {/* Active Toggle */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.cardDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <AppText style={{ color: colors.white, fontSize: 15, fontWeight: '600' }}>
                {t('admin.banners.activeLabel')}
              </AppText>
              <AppText style={{ color: colors.textSlate400, fontSize: 12, marginTop: 2 }}>
                {t('admin.banners.activeDescription')}
              </AppText>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.textSlate500, true: colors.neonPurple }}
              thumbColor={colors.white}
              accessibilityLabel={t('admin.banners.activeLabel')}
            />
          </View>

          {/* Clickable Toggle */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: colors.cardDark,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
            }}
          >
            <View style={{ flex: 1, marginRight: 16 }}>
              <AppText style={{ color: colors.white, fontSize: 15, fontWeight: '600' }}>
                {t('admin.banners.clickableLabel')}
              </AppText>
              <AppText style={{ color: colors.textSlate400, fontSize: 12, marginTop: 2 }}>
                {t('admin.banners.clickableDescription')}
              </AppText>
            </View>
            <Switch
              value={isClickable}
              onValueChange={setIsClickable}
              trackColor={{ false: colors.textSlate500, true: colors.neonPurple }}
              thumbColor={colors.white}
              accessibilityLabel={t('admin.banners.clickableLabel')}
            />
          </View>
        </ScrollView>

        {/* Save Button */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingBottom: 32,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: 'rgba(51,65,85,0.3)',
          }}
        >
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            style={{
              backgroundColor: colors.neonPurple,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              opacity: isSaving ? 0.7 : 1,
            }}
            accessibilityLabel={isSaving ? t('common.saving') : t('common.save')}
            accessibilityRole="button"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <AppText style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
                {t('common.save')}
              </AppText>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
