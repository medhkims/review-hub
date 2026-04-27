import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { AdminMenuButton } from '../components/AdminMenuButton';

interface ManageTrendingScreenProps {
  onBack: () => void;
}

export function ManageTrendingScreen({ onBack }: ManageTrendingScreenProps) {
  const { t } = useTranslation();
  const [trending, setTrending] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BusinessEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Search state for adding
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const loadTrending = useCallback(async () => {
    setIsLoading(true);
    // Reuse getNewBusinesses which now queries by weekly_review_count desc
    const result = await container.getNewBusinessesUseCase.execute();
    result.fold(
      () => setIsLoading(false),
      (data) => {
        // Only show businesses that have weekly_review_count > 0
        setTrending(data.filter((b) => b.weeklyReviewCount > 0));
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    loadTrending();
  }, [loadTrending]);

  const handleAdd = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setModalVisible(true);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const result = await container.searchBusinessesUseCase.execute(query, null);
    result.fold(
      () => setIsSearching(false),
      (data) => {
        setSearchResults(data);
        setIsSearching(false);
      },
    );
  }, []);

  const handleSelectBusiness = useCallback(async (business: BusinessEntity) => {
    // Add to trending by setting weekly_review_count to 1 (or current max + 1)
    const maxCount = trending.length > 0
      ? Math.max(...trending.map((b) => b.weeklyReviewCount)) + 1
      : 1;
    await container.updateBusinessUseCase.execute(business.id, {
      weekly_review_count: maxCount,
    });
    setModalVisible(false);
    loadTrending();
  }, [trending, loadTrending]);

  const handleDelete = useCallback((business: BusinessEntity) => {
    if (Platform.OS === 'web') {
      setDeleteTarget(business);
    } else {
      Alert.alert(
        t('admin.trending.deleteTitle'),
        t('admin.trending.deleteMessage', { name: business.name }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('myReviews.deleteConfirmYes'),
            style: 'destructive',
            onPress: async () => {
              await container.updateBusinessUseCase.execute(business.id, {
                weekly_review_count: 0,
              });
              setTrending((prev) => prev.filter((b) => b.id !== business.id));
            },
          },
        ],
      );
    }
  }, [t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    await container.updateBusinessUseCase.execute(deleteTarget.id, {
      weekly_review_count: 0,
    });
    setTrending((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    setIsDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardDark,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.borderDark,
        }}
      >
        {item.coverImageUrl || item.logoUrl ? (
          <Image
            source={{ uri: (item.coverImageUrl ?? item.logoUrl)! }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            resizeMode="cover"
            accessibilityLabel={item.name}
          />
        ) : (
          <View
            style={{
              width: 56, height: 56, borderRadius: 12,
              backgroundColor: 'rgba(249,115,22,0.20)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="fire" size={24} color="#F97316" />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 14, gap: 4 }}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }} numberOfLines={1}>
            {item.name}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }} numberOfLines={1}>
            {item.categoryName} · ⭐ {item.rating.toFixed(1)} · {item.reviewCount} reviews
          </AppText>
          <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>
            {t('admin.trending.weeklyReviews', { count: item.weeklyReviewCount })}
          </AppText>
        </View>
        <Pressable
          onPress={() => handleDelete(item)}
          accessibilityLabel={t('common.delete')}
          accessibilityRole="button"
          style={{ padding: 8 }}
        >
          <MaterialCommunityIcons name="delete-outline" size={22} color="#EF4444" />
        </Pressable>
      </View>
    ),
    [handleDelete, t],
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 16,
          gap: 14,
        }}
      >
        <AdminMenuButton />
        <Pressable
          onPress={onBack}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize: 20, fontWeight: '800', color: colors.white, flex: 1 }}>
          {t('admin.trending.title')}
        </AppText>
        <Pressable
          onPress={handleAdd}
          accessibilityLabel={t('admin.trending.add')}
          accessibilityRole="button"
          style={{
            width: 40, height: 40, borderRadius: 12,
            backgroundColor: colors.neonPurple,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="plus" size={22} color={colors.white} />
        </Pressable>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : trending.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 }}>
          <MaterialCommunityIcons name="fire" size={48} color={colors.textSlate500} />
          <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>
            {t('admin.trending.empty')}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={trending}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Trending Business Modal */}
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setModalVisible(false)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, gap: 16, maxHeight: '80%' }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
                {t('admin.trending.add')}
              </AppText>
              <Pressable onPress={() => setModalVisible(false)} accessibilityLabel={t('common.cancel')} accessibilityRole="button">
                <MaterialCommunityIcons name="close" size={20} color={colors.textSlate400} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Business Search */}
              <View style={{ gap: 6, marginBottom: 16 }}>
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('admin.trending.selectBusiness')}
                </AppText>
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder={t('admin.trending.searchPlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  style={{
                    backgroundColor: colors.midnight,
                    color: colors.white,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: colors.borderDark,
                  }}
                  accessibilityLabel={t('admin.trending.selectBusiness')}
                />
                {isSearching && (
                  <ActivityIndicator size="small" color={colors.neonPurple} style={{ marginTop: 8 }} />
                )}
                {searchResults.length > 0 && (
                  <View style={{ borderRadius: 12, backgroundColor: colors.midnight, borderWidth: 1, borderColor: colors.borderDark, marginTop: 4, maxHeight: 300 }}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {searchResults.slice(0, 15).map((biz) => {
                        const alreadyTrending = trending.some((t) => t.id === biz.id);
                        return (
                          <Pressable
                            key={biz.id}
                            onPress={() => !alreadyTrending && handleSelectBusiness(biz)}
                            accessibilityRole="button"
                            accessibilityLabel={biz.name}
                            disabled={alreadyTrending}
                            style={({ pressed }) => ({
                              flexDirection: 'row', alignItems: 'center', gap: 10,
                              padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderDark,
                              opacity: alreadyTrending ? 0.4 : pressed ? 0.7 : 1,
                            })}
                          >
                            {biz.logoUrl ? (
                              <Image source={{ uri: biz.logoUrl }} style={{ width: 32, height: 32, borderRadius: 8 }} accessibilityLabel={biz.name} />
                            ) : (
                              <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: `${colors.neonPurple}20`, alignItems: 'center', justifyContent: 'center' }}>
                                <MaterialCommunityIcons name="store" size={16} color={colors.neonPurple} />
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.white }} numberOfLines={1}>{biz.name}</AppText>
                              <AppText style={{ fontSize: 11, color: colors.textSlate400 }} numberOfLines={1}>
                                {biz.categoryName ?? ''} · ⭐ {biz.rating.toFixed(1)}
                              </AppText>
                            </View>
                            {alreadyTrending && (
                              <MaterialCommunityIcons name="check-circle" size={18} color={colors.emerald} />
                            )}
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Close button */}
            <Pressable
              onPress={() => setModalVisible(false)}
              accessibilityLabel={t('common.cancel')}
              accessibilityRole="button"
              style={{ paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
            >
              <AppText style={{ color: colors.textSlate400, fontWeight: '600', fontSize: 14 }}>
                {t('common.close')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal (web) */}
      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setDeleteTarget(null)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, gap: 16 }}>
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(239,68,68,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <MaterialCommunityIcons name="delete-outline" size={28} color="#EF4444" />
              </View>
              <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
                {t('admin.trending.deleteTitle')}
              </AppText>
              <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center' }}>
                {t('admin.trending.deleteMessage', { name: deleteTarget?.name ?? '' })}
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setDeleteTarget(null)}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.textSlate400, fontWeight: '600', fontSize: 14 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={confirmDelete}
                disabled={isDeleting}
                accessibilityLabel={t('myReviews.deleteConfirmYes')}
                accessibilityRole="button"
                style={{
                  flex: 1, paddingVertical: 13, borderRadius: 12,
                  backgroundColor: '#EF4444', alignItems: 'center',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <AppText style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>
                    {t('myReviews.deleteConfirmYes')}
                  </AppText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
