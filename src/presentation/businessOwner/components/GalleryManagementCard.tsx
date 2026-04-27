import React, { useCallback } from 'react';
import { View, Image, Pressable, FlatList, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

const MAX_GALLERY_PHOTOS = 10;
const ITEM_SIZE = 100;

interface GalleryManagementCardProps {
  galleryImages: string[];
  isEditMode: boolean;
  isUploading?: boolean;
  onAddPhoto?: () => void;
  onRemovePhoto?: (index: number) => void;
}

export const GalleryManagementCard: React.FC<GalleryManagementCardProps> = ({
  galleryImages,
  isEditMode,
  isUploading = false,
  onAddPhoto,
  onRemovePhoto,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const canAddMore = galleryImages.length < MAX_GALLERY_PHOTOS;

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <View style={{ width: ITEM_SIZE, height: ITEM_SIZE, borderRadius: 12, overflow: 'hidden', backgroundColor: theme.card }}>
        <Image source={{ uri: item }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        {isEditMode && onRemovePhoto && (
          <Pressable
            onPress={() => onRemovePhoto(index)}
            accessibilityRole="button"
            accessibilityLabel={t('businessOwner.companyProfile.removePhoto')}
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="close" size={14} color="#FFFFFF" />
          </Pressable>
        )}
      </View>
    ),
    [isEditMode, onRemovePhoto, theme.card, t],
  );

  const keyExtractor = useCallback((item: string, index: number) => `gm-${index}-${item}`, []);

  if (!isEditMode && galleryImages.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <MaterialCommunityIcons name="image-multiple" size={20} color={colors.neonPurple} />
          <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
            {t('businessDetail.gallery')}
          </AppText>
        </View>
        {isEditMode && (
          <AppText style={{ fontSize: 12, color: theme.textMuted }}>
            {galleryImages.length}/{MAX_GALLERY_PHOTOS}
          </AppText>
        )}
      </View>

      {/* Gallery grid */}
      {galleryImages.length > 0 && (
        <FlatList
          data={galleryImages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, marginBottom: isEditMode ? 12 : 0 }}
        />
      )}

      {/* Add photo button */}
      {isEditMode && canAddMore && onAddPhoto && (
        <Pressable
          onPress={onAddPhoto}
          disabled={isUploading}
          accessibilityRole="button"
          accessibilityLabel={t('businessOwner.companyProfile.addPhoto')}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: `${colors.neonPurple}50`,
            backgroundColor: `${colors.neonPurple}08`,
            opacity: pressed || isUploading ? 0.6 : 1,
          })}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color={colors.neonPurple} />
          ) : (
            <>
              <MaterialCommunityIcons name="camera-plus" size={20} color={colors.neonPurple} />
              <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
                {t('businessOwner.companyProfile.addPhoto')}
              </AppText>
            </>
          )}
        </Pressable>
      )}

      {/* Empty state */}
      {galleryImages.length === 0 && !isEditMode && (
        <AppText style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center' }}>
          {t('businessDetail.noPhotos')}
        </AppText>
      )}
    </View>
  );
};
