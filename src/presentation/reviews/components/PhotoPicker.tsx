import React, { useCallback } from 'react';
import { View, Image, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

const MAX_PHOTOS = 5;

export interface SelectedPhoto {
  uri: string;
  mimeType?: string;
}

interface PhotoPickerProps {
  photos: SelectedPhoto[];
  onChange: (photos: SelectedPhoto[]) => void;
}

export const PhotoPicker = React.memo(({ photos, onChange }: PhotoPickerProps) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const handlePick = useCallback(async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      crossPlatformAlert(t('writeReview.maxPhotosTitle'), t('writeReview.maxPhotosMessage', { max: MAX_PHOTOS }));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      crossPlatformAlert(t('writeReview.permissionTitle'), t('writeReview.permissionMessage'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const newPhotos: SelectedPhoto[] = result.assets.map((asset) => ({
        uri: asset.uri,
        mimeType: asset.mimeType ?? 'image/jpeg',
      }));
      onChange([...photos, ...newPhotos]);
    }
  }, [photos, onChange, t]);

  const handleRemove = useCallback(
    (index: number) => {
      onChange(photos.filter((_, i) => i !== index));
    },
    [photos, onChange],
  );

  return (
    <View>
      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 10 }}
        >
          {photos.map((photo, index) => (
            <View key={photo.uri} style={{ position: 'relative' }}>
              <Image
                source={{ uri: photo.uri }}
                style={{ width: 90, height: 90, borderRadius: 10, backgroundColor: theme.card }}
                accessibilityLabel={t('writeReview.photoThumbnail', { index: index + 1 })}
              />
              <Pressable
                onPress={() => handleRemove(index)}
                accessibilityLabel={t('writeReview.removePhoto')}
                accessibilityRole="button"
                style={{
                  position: 'absolute',
                  top: -17,
                  right: -17,
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialCommunityIcons name="close" size={13} color="#FFFFFF" />
                </View>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      )}

      {photos.length < MAX_PHOTOS && (
        <Pressable
          onPress={handlePick}
          accessibilityLabel={t('writeReview.uploadPhotos')}
          accessibilityRole="button"
          style={{
            borderWidth: 1.5,
            borderColor: theme.border,
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 28,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${theme.card}80`,
          }}
        >
          <MaterialCommunityIcons name="camera-plus-outline" size={32} color={theme.textSecondary} />
          <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 8 }}>
            {photos.length === 0
              ? t('writeReview.uploadPhotos')
              : t('writeReview.addMorePhotos', { remaining: MAX_PHOTOS - photos.length })}
          </AppText>
        </Pressable>
      )}
    </View>
  );
});

PhotoPicker.displayName = 'PhotoPicker';
