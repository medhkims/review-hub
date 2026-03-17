import React, { useState, useEffect, useCallback } from 'react';
import { View, Modal, Pressable, TextInput, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { colors } from '@/core/theme/colors';

interface MenuCategoryModalProps {
  visible: boolean;
  /** Pre-fill for edit mode; omit for add mode */
  initialName?: string;
  initialImageUri?: string;
  onClose: () => void;
  onConfirm: (name: string, imageUri?: string) => void;
}

export const MenuCategoryModal: React.FC<MenuCategoryModalProps> = ({
  visible,
  initialName,
  initialImageUri,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  const isEditMode = initialName !== undefined;

  useEffect(() => {
    if (visible) {
      setName(initialName ?? '');
      setImageUri(initialImageUri ?? undefined);
    }
  }, [visible, initialName, initialImageUri]);

  const imagePicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setImageUri(uri); }, []),
  });

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(name.trim(), imageUri);
  };

  const handleClose = () => {
    onClose();
  };

  const title = isEditMode
    ? t('businessOwner.companyProfile.editCategory')
    : t('businessOwner.companyProfile.addCategory');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <ImageCropModal
        visible={imagePicker.isPreviewVisible}
        imageUri={imagePicker.pendingUri}
        onConfirm={imagePicker.confirmImage}
        onRetake={imagePicker.retakeImage}
        onCancel={imagePicker.cancelPreview}
        originalWidth={imagePicker.pendingWidth}
        originalHeight={imagePicker.pendingHeight}
        aspect={imagePicker.aspect}
      />
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={handleClose}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        />
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, gap: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
              {title}
            </AppText>
            <Pressable onPress={handleClose} accessibilityLabel={t('common.cancel')} accessibilityRole="button">
              <MaterialCommunityIcons name="close" size={20} color={colors.textSlate400} />
            </Pressable>
          </View>

          {/* Image Picker */}
          <Pressable
            onPress={imagePicker.pickImage}
            accessibilityLabel={imageUri ? t('businessOwner.companyProfile.changePhoto') : t('businessOwner.companyProfile.addPhoto')}
            accessibilityRole="button"
            style={{ alignSelf: 'center' }}
          >
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 96, height: 96, borderRadius: 16, borderWidth: 2, borderColor: colors.neonPurple }}
                resizeMode="cover"
                accessibilityLabel={name || t('businessOwner.companyProfile.categoryNameLabel')}
              />
            ) : (
              <View
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: 16,
                  backgroundColor: `${colors.neonPurple}1A`,
                  borderWidth: 2,
                  borderColor: `${colors.neonPurple}4D`,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <MaterialCommunityIcons name="camera-plus-outline" size={28} color={colors.neonPurple} />
                <AppText style={{ fontSize: 10, color: colors.neonPurple, fontWeight: '600' }}>
                  {t('businessOwner.companyProfile.addPhoto')}
                </AppText>
              </View>
            )}
          </Pressable>

          {/* Name Input */}
          <View style={{ gap: 8 }}>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
              {t('businessOwner.companyProfile.categoryNameLabel')}
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('businessOwner.companyProfile.categoryNamePlaceholder')}
              placeholderTextColor={colors.textSlate500}
              style={{
                backgroundColor: colors.midnight,
                color: colors.white,
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                borderWidth: 1,
                borderColor: name.trim() ? colors.neonPurple : colors.borderDark,
              }}
              accessibilityLabel={t('businessOwner.companyProfile.categoryNameLabel')}
            />
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={handleClose}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
              style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
            >
              <AppText style={{ color: colors.textSlate400, fontWeight: '600', fontSize: 14 }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={handleConfirm}
              accessibilityLabel={t('common.confirm')}
              accessibilityRole="button"
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: name.trim() ? colors.neonPurple : `${colors.neonPurple}4D`,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                {t('common.confirm')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
