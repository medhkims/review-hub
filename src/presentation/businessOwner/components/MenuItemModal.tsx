import React, { useState, useEffect, useCallback } from 'react';
import { View, Modal, Pressable, TextInput, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { colors } from '@/core/theme/colors';

interface MenuItemModalProps {
  visible: boolean;
  /** Pre-fill for edit mode; omit for add mode */
  initialName?: string;
  initialDescription?: string;
  initialPrice?: string;
  initialImageUri?: string;
  onClose: () => void;
  onConfirm: (name: string, description: string, price: string, imageUri?: string) => void;
}

export const MenuItemModal: React.FC<MenuItemModalProps> = ({
  visible,
  initialName,
  initialDescription,
  initialPrice,
  initialImageUri,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>();

  const isEditMode = initialName !== undefined;

  useEffect(() => {
    if (visible) {
      setName(initialName ?? '');
      setDescription(initialDescription ?? '');
      setPrice(initialPrice ?? '');
      setImageUri(initialImageUri ?? undefined);
    }
  }, [visible, initialName, initialDescription, initialPrice, initialImageUri]);

  const imagePicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setImageUri(uri); }, []),
  });

  const handleConfirm = () => {
    if (!name.trim() || !price.trim()) return;
    onConfirm(name.trim(), description.trim(), price.trim(), imageUri);
  };

  const canConfirm = name.trim().length > 0 && price.trim().length > 0;
  const title = isEditMode
    ? t('businessOwner.companyProfile.editItem')
    : t('businessOwner.companyProfile.addItem');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
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
          onPress={onClose}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        />
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, gap: 16 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
              {title}
            </AppText>
            <Pressable onPress={onClose} accessibilityLabel={t('common.cancel')} accessibilityRole="button">
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
                style={{ width: 88, height: 88, borderRadius: 14, borderWidth: 2, borderColor: colors.neonPurple }}
                resizeMode="cover"
                accessibilityLabel={name || t('businessOwner.companyProfile.itemNameLabel')}
              />
            ) : (
              <View
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 14,
                  backgroundColor: `${colors.neonPurple}1A`,
                  borderWidth: 2,
                  borderColor: `${colors.neonPurple}4D`,
                  borderStyle: 'dashed',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                }}
              >
                <MaterialCommunityIcons name="camera-plus-outline" size={26} color={colors.neonPurple} />
                <AppText style={{ fontSize: 10, color: colors.neonPurple, fontWeight: '600' }}>
                  {t('businessOwner.companyProfile.addPhoto')}
                </AppText>
              </View>
            )}
          </Pressable>

          {/* Name Input */}
          <View style={{ gap: 6 }}>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
              {t('businessOwner.companyProfile.itemNameLabel')}
            </AppText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('businessOwner.companyProfile.itemNamePlaceholder')}
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
              accessibilityLabel={t('businessOwner.companyProfile.itemNameLabel')}
            />
          </View>

          {/* Description Input */}
          <View style={{ gap: 6 }}>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
              {t('businessOwner.companyProfile.itemDescriptionLabel')}
            </AppText>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder={t('businessOwner.companyProfile.itemDescriptionPlaceholder')}
              placeholderTextColor={colors.textSlate500}
              multiline
              style={{
                backgroundColor: colors.midnight,
                color: colors.white,
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                borderWidth: 1,
                borderColor: colors.borderDark,
                minHeight: 72,
                textAlignVertical: 'top',
              }}
              accessibilityLabel={t('businessOwner.companyProfile.itemDescriptionLabel')}
            />
          </View>

          {/* Price Input */}
          <View style={{ gap: 6 }}>
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
              {t('businessOwner.companyProfile.itemPriceLabel')}
            </AppText>
            <TextInput
              value={price}
              onChangeText={(val) => setPrice(val.replace(',', '.'))}
              placeholder={t('businessOwner.companyProfile.itemPricePlaceholder')}
              placeholderTextColor={colors.textSlate500}
              keyboardType="decimal-pad"
              style={{
                backgroundColor: colors.midnight,
                color: colors.white,
                borderRadius: 12,
                padding: 14,
                fontSize: 14,
                borderWidth: 1,
                borderColor: price.trim() ? colors.neonPurple : colors.borderDark,
              }}
              accessibilityLabel={t('businessOwner.companyProfile.itemPriceLabel')}
            />
          </View>

          {/* Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable
              onPress={onClose}
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
              accessibilityLabel={t('common.save')}
              accessibilityRole="button"
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: canConfirm ? colors.neonPurple : `${colors.neonPurple}4D`,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                {t('common.save')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
