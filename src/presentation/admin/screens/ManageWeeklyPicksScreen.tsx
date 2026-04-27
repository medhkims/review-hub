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
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { WeeklyPickEntity } from '@/domain/weeklyPicks/entities/weeklyPickEntity';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { AdminMenuButton } from '../components/AdminMenuButton';

interface ManageWeeklyPicksScreenProps {
  onBack?: () => void;
}

export function ManageWeeklyPicksScreen({ onBack }: ManageWeeklyPicksScreenProps = {}) {
  const { t } = useTranslation();
  const [picks, setPicks] = useState<WeeklyPickEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WeeklyPickEntity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state for adding a pick
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BusinessEntity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessEntity | null>(null);
  const [pickReason, setPickReason] = useState('');

  const loadPicks = useCallback(async () => {
    setIsLoading(true);
    const result = await container.getAllWeeklyPicksUseCase.execute();
    result.fold(
      () => setIsLoading(false),
      (data) => {
        setPicks(data);
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    loadPicks();
  }, [loadPicks]);

  const handleAdd = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBusiness(null);
    setPickReason('');
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

  const handleSelectBusiness = useCallback((business: BusinessEntity) => {
    setSelectedBusiness(business);
    setSearchQuery(business.name);
    setSearchResults([]);
  }, []);

  const handleCreate = useCallback(async () => {
    if (!selectedBusiness || !pickReason.trim()) return;
    const result = await container.createWeeklyPickUseCase.execute({
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
      businessLogoUrl: selectedBusiness.logoUrl ?? null,
      businessCoverUrl: selectedBusiness.coverImageUrl ?? null,
      businessRating: selectedBusiness.rating,
      businessReviewCount: selectedBusiness.reviewCount,
      categoryName: selectedBusiness.categoryName ?? '',
      pickReason: pickReason.trim(),
    });
    result.fold(
      () => {},
      () => {
        setModalVisible(false);
        loadPicks();
      },
    );
  }, [selectedBusiness, pickReason, loadPicks]);

  const handleDelete = useCallback((pick: WeeklyPickEntity) => {
    if (Platform.OS === 'web') {
      setDeleteTarget(pick);
    } else {
      Alert.alert(
        t('admin.weeklyPicks.deleteTitle'),
        t('admin.weeklyPicks.deleteMessage', { name: pick.businessName }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('myReviews.deleteConfirmYes'),
            style: 'destructive',
            onPress: async () => {
              const result = await container.deleteWeeklyPickUseCase.execute(pick.id);
              result.fold(
                () => {},
                () => setPicks((prev) => prev.filter((p) => p.id !== pick.id)),
              );
            },
          },
        ],
      );
    }
  }, [t]);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const result = await container.deleteWeeklyPickUseCase.execute(deleteTarget.id);
    result.fold(
      () => {},
      () => setPicks((prev) => prev.filter((p) => p.id !== deleteTarget.id)),
    );
    setIsDeleting(false);
    setDeleteTarget(null);
  }, [deleteTarget]);

  const renderItem = useCallback(
    ({ item }: { item: WeeklyPickEntity }) => (
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
        {item.businessCoverUrl ? (
          <Image
            source={{ uri: item.businessCoverUrl }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            resizeMode="cover"
            accessibilityLabel={item.businessName}
          />
        ) : (
          <View
            style={{
              width: 56, height: 56, borderRadius: 12,
              backgroundColor: `${colors.neonPurple}20`,
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="crown" size={24} color={colors.neonPurple} />
          </View>
        )}
        <View style={{ flex: 1, marginLeft: 14, gap: 4 }}>
          <AppText style={{ fontSize: 15, fontWeight: '700', color: colors.white }} numberOfLines={1}>
            {item.businessName}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate400 }} numberOfLines={1}>
            {item.categoryName} · ⭐ {item.businessRating.toFixed(1)}
          </AppText>
          <AppText style={{ fontSize: 11, color: colors.textSlate500, fontStyle: 'italic' }} numberOfLines={2}>
            "{item.pickReason}"
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
          onPress={onBack ?? (() => router.back())}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.white} />
        </Pressable>
        <AppText style={{ fontSize: 20, fontWeight: '800', color: colors.white, flex: 1 }}>
          {t('admin.weeklyPicks.title')}
        </AppText>
        <Pressable
          onPress={handleAdd}
          accessibilityLabel={t('admin.weeklyPicks.add')}
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
      ) : picks.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 40 }}>
          <MaterialCommunityIcons name="crown-outline" size={48} color={colors.textSlate500} />
          <AppText style={{ fontSize: 16, color: colors.textSlate400, textAlign: 'center' }}>
            {t('admin.weeklyPicks.empty')}
          </AppText>
        </View>
      ) : (
        <FlatList
          data={picks}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Add Weekly Pick Modal */}
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
                {t('admin.weeklyPicks.add')}
              </AppText>
              <Pressable onPress={() => setModalVisible(false)} accessibilityLabel={t('common.cancel')} accessibilityRole="button">
                <MaterialCommunityIcons name="close" size={20} color={colors.textSlate400} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Business Search */}
              <View style={{ gap: 6, marginBottom: 16 }}>
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('admin.weeklyPicks.selectBusiness')}
                </AppText>
                <TextInput
                  value={searchQuery}
                  onChangeText={handleSearch}
                  placeholder={t('admin.weeklyPicks.searchPlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  style={{
                    backgroundColor: colors.midnight,
                    color: colors.white,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: selectedBusiness ? colors.emerald : colors.borderDark,
                  }}
                  accessibilityLabel={t('admin.weeklyPicks.selectBusiness')}
                />
                {isSearching && (
                  <ActivityIndicator size="small" color={colors.neonPurple} style={{ marginTop: 8 }} />
                )}
                {searchResults.length > 0 && (
                  <View style={{ borderRadius: 12, backgroundColor: colors.midnight, borderWidth: 1, borderColor: colors.borderDark, marginTop: 4, maxHeight: 200 }}>
                    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
                      {searchResults.slice(0, 10).map((biz) => (
                        <Pressable
                          key={biz.id}
                          onPress={() => handleSelectBusiness(biz)}
                          accessibilityRole="button"
                          accessibilityLabel={biz.name}
                          style={({ pressed }) => ({
                            flexDirection: 'row', alignItems: 'center', gap: 10,
                            padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderDark,
                            opacity: pressed ? 0.7 : 1,
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
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
                {selectedBusiness && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <MaterialCommunityIcons name="check-circle" size={16} color={colors.emerald} />
                    <AppText style={{ fontSize: 12, color: colors.emerald, fontWeight: '600' }}>
                      {selectedBusiness.name}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Pick Reason */}
              <View style={{ gap: 6, marginBottom: 16 }}>
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400 }}>
                  {t('admin.weeklyPicks.pickReason')}
                </AppText>
                <TextInput
                  value={pickReason}
                  onChangeText={setPickReason}
                  placeholder={t('admin.weeklyPicks.pickReasonPlaceholder')}
                  placeholderTextColor={colors.textSlate500}
                  multiline
                  style={{
                    backgroundColor: colors.midnight,
                    color: colors.white,
                    borderRadius: 12,
                    padding: 14,
                    fontSize: 14,
                    borderWidth: 1,
                    borderColor: pickReason.trim() ? colors.neonPurple : colors.borderDark,
                    minHeight: 80,
                    textAlignVertical: 'top',
                  }}
                  accessibilityLabel={t('admin.weeklyPicks.pickReason')}
                />
              </View>
            </ScrollView>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={() => setModalVisible(false)}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{ flex: 1, paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: colors.borderDark, alignItems: 'center' }}
              >
                <AppText style={{ color: colors.textSlate400, fontWeight: '600', fontSize: 14 }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                accessibilityLabel={t('common.save')}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: selectedBusiness && pickReason.trim() ? colors.neonPurple : `${colors.neonPurple}4D`,
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

      {/* Delete Confirmation Modal */}
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
                {t('admin.weeklyPicks.deleteTitle')}
              </AppText>
              <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center' }}>
                {t('admin.weeklyPicks.deleteMessage', { name: deleteTarget?.businessName ?? '' })}
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
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: 12,
                  backgroundColor: '#EF4444',
                  alignItems: 'center',
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
