import React, { useCallback } from 'react';
import { View, Image, Pressable, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

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

  const handlePick = useCallback(async () => {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) {
      Alert.alert(t('writeReview.maxPhotosTitle'), t('writeReview.maxPhotosMessage', { max: MAX_PHOTOS }));
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('writeReview.permissionTitle'), t('writeReview.permissionMessage'));
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
                style={{ width: 90, height: 90, borderRadius: 10, backgroundColor: colors.cardDark }}
                accessibilityLabel={t('writeReview.photoThumbnail', { index: index + 1 })}
              />
              <Pressable
                onPress={() => handleRemove(index)}
                accessibilityLabel={t('writeReview.removePhoto')}
                accessibilityRole="button"
                hitSlop={4}
                style={{
                  position: 'absolute',
                  top: -6,
                  right: -6,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: colors.error,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="close" size={13} color={colors.textWhite} />
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
            borderColor: colors.borderDark,
            borderStyle: 'dashed',
            borderRadius: 14,
            paddingVertical: 28,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${colors.cardDark}80`,
          }}
        >
          <MaterialCommunityIcons name="camera-plus-outline" size={32} color={colors.textSlate400} />
          <AppText style={{ fontSize: 13, color: colors.textSlate400, marginTop: 8 }}>
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
