import React, { useState, useCallback } from 'react';
import { View, FlatList, Image, Pressable, Modal, Platform, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SectionCard } from './SectionCard';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useTheme } from '@/core/theme/useTheme';

const ITEM_WIDTH = 240;
const ITEM_HEIGHT = 160;

interface PhotoGallerySectionProps {
  galleryImages: string[];
}

interface GalleryItemProps {
  uri: string;
  onPress: () => void;
}

const GalleryItem: React.FC<GalleryItemProps> = React.memo(({ uri, onPress }) => {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="image"
      accessibilityLabel="Gallery photo"
      style={({ pressed }) => ({
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: theme.card,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Image
        source={{ uri }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </Pressable>
  );
});

export const PhotoGallerySection: React.FC<PhotoGallerySectionProps> = ({ galleryImages }) => {
  const { t } = useTranslation();
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const handleClose = useCallback(() => setPreviewIndex(null), []);

  const renderItem = useCallback(
    ({ item, index }: { item: string; index: number }) => (
      <GalleryItem uri={item} onPress={() => setPreviewIndex(index)} />
    ),
    [],
  );

  const keyExtractor = useCallback((item: string, index: number) => `gallery-${index}-${item}`, []);

  if (galleryImages.length === 0) return null;

  return (
    <>
      <SectionCard title={t('businessDetail.gallery')}>
        <FlatList
          data={galleryImages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 12 }}
        />
        <AppText
          style={{
            fontSize: 12,
            color: '#94A3B8',
            marginTop: 10,
            textAlign: 'center',
          }}
        >
          {galleryImages.length} {galleryImages.length === 1 ? 'photo' : 'photos'}
        </AppText>
      </SectionCard>

      {/* Fullscreen Preview Modal */}
      <Modal
        visible={previewIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        statusBarTranslucent={Platform.OS !== 'web'}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            style={{
              position: 'absolute',
              top: Platform.OS === 'web' ? 16 : 56,
              right: 20,
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <MaterialCommunityIcons name="close" size={24} color="#FFFFFF" />
          </Pressable>

          {previewIndex !== null && (
            <Image
              source={{ uri: galleryImages[previewIndex] }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
              resizeMode="contain"
            />
          )}

          {/* Navigation arrows */}
          {previewIndex !== null && previewIndex > 0 && (
            <Pressable
              onPress={() => setPreviewIndex(previewIndex - 1)}
              accessibilityRole="button"
              accessibilityLabel="Previous photo"
              style={{
                position: 'absolute',
                left: 16,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
            </Pressable>
          )}
          {previewIndex !== null && previewIndex < galleryImages.length - 1 && (
            <Pressable
              onPress={() => setPreviewIndex(previewIndex + 1)}
              accessibilityRole="button"
              accessibilityLabel="Next photo"
              style={{
                position: 'absolute',
                right: 16,
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="chevron-right" size={28} color="#FFFFFF" />
            </Pressable>
          )}

          {/* Counter */}
          <AppText
            style={{
              position: 'absolute',
              bottom: Platform.OS === 'web' ? 24 : 60,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '600',
            }}
          >
            {(previewIndex ?? 0) + 1} / {galleryImages.length}
          </AppText>
        </View>
      </Modal>
    </>
  );
};
