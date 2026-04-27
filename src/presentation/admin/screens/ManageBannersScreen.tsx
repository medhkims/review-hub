import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { crossPlatformAlert } from '@/core/utils/crossPlatformAlert';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { BannerFormModal } from '../components/BannerFormModal';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { AdminMenuButton } from '../components/AdminMenuButton';

export function ManageBannersScreen() {
  const { t } = useTranslation();
  const [banners, setBanners] = useState<BannerEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerEntity | null>(null);

  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    const result = await container.getAllBannersUseCase.execute();
    result.fold(
      () => setIsLoading(false),
      (data) => {
        setBanners(data);
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    loadBanners();
  }, [loadBanners]);

  const handleAdd = useCallback(() => {
    setEditingBanner(null);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((banner: BannerEntity) => {
    setEditingBanner(banner);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((banner: BannerEntity) => {
    crossPlatformAlert(
      t('admin.banners.deleteTitle'),
      t('admin.banners.deleteMessage', { title: banner.title }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('myReviews.deleteConfirmYes'),
          style: 'destructive',
          onPress: async () => {
            const result = await container.deleteBannerUseCase.execute(banner.id);
            result.fold(
              () => {},
              () => setBanners((prev) => prev.filter((b) => b.id !== banner.id)),
            );
          },
        },
      ],
    );
  }, [t]);

  const handleSaved = useCallback(() => {
    setModalVisible(false);
    loadBanners();
  }, [loadBanners]);

  const renderItem = useCallback(
    ({ item }: { item: BannerEntity }) => (
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: colors.cardDark,
          borderRadius: 14,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(51,65,85,0.3)',
        }}
      >
        {/* Thumbnail */}
        <View style={{ width: 90, height: 72 }}>
          <Image source={{ uri: item.imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        </View>

        {/* Info */}
        <View style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 10, justifyContent: 'center' }}>
          <AppText style={{ color: colors.white, fontSize: 14, fontWeight: '700' }} numberOfLines={1}>
            {item.title}
          </AppText>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.isActive ? '#22C55E' : colors.textSlate500,
              }}
            />
            <AppText style={{ color: colors.textSlate400, fontSize: 12 }}>
              {item.isActive ? t('admin.banners.active') : t('admin.banners.inactive')}
            </AppText>
            <AppText style={{ color: colors.textSlate500, fontSize: 12 }}>
              {'•  #' + item.sortOrder}
            </AppText>
          </View>
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingRight: 8, gap: 4 }}>
          <Pressable
            onPress={() => handleEdit(item)}
            style={{ padding: 8 }}
            accessibilityLabel={t('admin.banners.editBanner')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="pencil" size={20} color={colors.neonPurple} />
          </Pressable>
          <Pressable
            onPress={() => handleDelete(item)}
            style={{ padding: 8 }}
            accessibilityLabel={t('admin.banners.deleteBanner')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
          </Pressable>
        </View>
      </View>
    ),
    [t, handleEdit, handleDelete],
  );

  const keyExtractor = useCallback((item: BannerEntity) => item.id, []);

  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 16,
            gap: 12,
          }}
        >
          <AdminMenuButton />
          <Pressable
            onPress={() => router.back()}
            style={{ padding: 4 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
          </Pressable>
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white, flex: 1 }}>
            {t('admin.banners.title')}
          </AppText>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.neonPurple} />
          </View>
        ) : (
          <FlatList
            data={banners}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 60 }}>
                <MaterialCommunityIcons name="image-off" size={48} color={colors.textSlate500} />
                <AppText style={{ color: colors.textSlate500, fontSize: 15, marginTop: 12 }}>
                  {t('admin.banners.empty')}
                </AppText>
              </View>
            }
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={handleAdd}
          style={{
            position: 'absolute',
            bottom: 32,
            right: 24,
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 8,
          }}
          accessibilityLabel={t('admin.banners.addBanner')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
        </Pressable>
      </View>

      <BannerFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSaved={handleSaved}
        editingBanner={editingBanner}
      />
    </ScreenLayout>
  );
}
