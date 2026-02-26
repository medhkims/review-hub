import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TextInput, Pressable, Image, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

// ── Helper ───────────────────────────────────────────────────────────────────

const getCategoryDisplayName = (categoryId: string): string => {
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

// ── Business Card ────────────────────────────────────────────────────────────

interface BusinessCardProps {
  item: BusinessEntity;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
  reviewsLabel: string;
}

const BusinessCard: React.FC<BusinessCardProps> = React.memo(
  ({ item, onPress, onFavorite, reviewsLabel }) => {
    const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
    const handleFavorite = useCallback(() => onFavorite(item.id), [item.id, onFavorite]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          marginBottom: 16,
          borderRadius: 16,
          backgroundColor: colors.cardDark,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
        })}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        {/* Cover Image */}
        <View
          style={{
            height: 160,
            backgroundColor: colors.borderDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.coverImageUrl ? (
            <Image
              source={{ uri: item.coverImageUrl }}
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={item.name}
            />
          ) : (
            <MaterialCommunityIcons
              name="image-outline"
              size={48}
              color={colors.textSlate500}
            />
          )}

          {/* Favorite button */}
          <Pressable
            onPress={handleFavorite}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            accessibilityLabel={`Favorite ${item.name}`}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={item.isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={item.isFavorite ? colors.neonPurple : colors.white}
            />
          </Pressable>
        </View>

        {/* Card Content */}
        <View style={{ padding: 14 }}>
          <AppText
            style={{ fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 6 }}
            numberOfLines={1}
          >
            {item.name}
          </AppText>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={colors.textSlate400}
            />
            <AppText
              style={{ fontSize: 13, color: colors.textSlate400, marginLeft: 4 }}
              numberOfLines={1}
            >
              {item.location}
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.ratingGold}
            />
            <AppText style={{ fontSize: 13, color: colors.white, marginLeft: 4, fontWeight: '600' }}>
              {item.rating.toFixed(1)}
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.textSlate400, marginLeft: 4 }}>
              {item.reviewCount}+ {reviewsLabel}
            </AppText>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: colors.textSlate500,
                marginHorizontal: 8,
              }}
            />
            <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '500' }}>
              {item.categoryName}
            </AppText>
          </View>
        </View>
      </Pressable>
    );
  },
);

BusinessCard.displayName = 'BusinessCard';


// ── Main Screen ──────────────────────────────────────────────────────────────

export default function SubCategoryBrowserScreen() {
  useAnalyticsScreen(AnalyticsScreens.SUB_CATEGORY_BROWSER);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categoryId, categoryName } = useLocalSearchParams<{ categoryId: string; categoryName?: string }>();

  const resolvedCategoryId = categoryId ?? 'restaurants';
  const categoryDisplayName = categoryName ?? getCategoryDisplayName(resolvedCategoryId);

  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBusinesses = useCallback(async () => {
    setError(null);
    const result = await container.getBusinessesByCategoryUseCase.execute(resolvedCategoryId);
    result.fold(
      (failure) => setError(failure.message),
      (data) => setBusinesses(data),
    );
    setIsLoading(false);
    setIsRefreshing(false);
  }, [resolvedCategoryId]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBusinesses();
  }, [loadBusinesses]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const query = searchQuery.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(query));
  }, [businesses, searchQuery]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/(main)/(feed)/business/[businessId]', params: { businessId: id } });
    },
    [router],
  );

  const handleFavorite = useCallback(async (businessId: string) => {
    if (!user) return;
    const result = await container.toggleFavoriteUseCase.execute(businessId, user.id);
    result.fold(
      () => {},
      (isFavorite) => {
        setBusinesses((prev) =>
          prev.map((b) => (b.id === businessId ? { ...b, isFavorite } : b)),
        );
      },
    );
  }, [user]);

  const searchPlaceholder = t('subCategory.searchBusinesses', { category: categoryDisplayName.toLowerCase() });

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <BusinessCard
        item={item}
        onPress={handleItemPress}
        onFavorite={handleFavorite}
        reviewsLabel={t('subCategory.reviews')}
      />
    ),
    [handleItemPress, handleFavorite, t],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  if (isLoading && businesses.length === 0) {
    return (
      <ScreenLayout>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
          <Pressable onPress={handleBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30,41,59,0.5)', alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={t('common.back')} accessibilityRole="button">
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
          </Pressable>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, flex: 1, marginLeft: 16 }}>{categoryDisplayName}</AppText>
        </View>
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error && businesses.length === 0) {
    return (
      <ScreenLayout>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 12 }}>
          <Pressable onPress={handleBack} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(30,41,59,0.5)', alignItems: 'center', justifyContent: 'center' }} accessibilityLabel={t('common.back')} accessibilityRole="button">
            <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
          </Pressable>
          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white, flex: 1, marginLeft: 16 }}>{categoryDisplayName}</AppText>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorView message={error} onRetry={loadBusinesses} />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(30,41,59,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={colors.white}
          />
        </Pressable>
        <AppText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.white,
            flex: 1,
            marginLeft: 16,
            letterSpacing: -0.3,
          }}
        >
          {categoryDisplayName}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <MaterialCommunityIcons
              name="magnify"
              size={22}
              color={colors.neonPurple}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={{ flex: 1, color: colors.textWhite, fontSize: 15, padding: 0 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textSlate500}
              accessibilityLabel={searchPlaceholder}
              accessibilityRole="search"
            />
          </View>

          {/* Sort Button */}
          <Pressable
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel={t('sortBy.title')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="sort-variant"
              size={20}
              color={colors.textSlate400}
            />
          </Pressable>

          {/* Filter Button */}
          <Pressable
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel={t('filterBy.title')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={colors.textSlate400}
            />
          </Pressable>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="store-search-outline"
              size={48}
              color={colors.textSlate500}
            />
            <AppText style={{ color: colors.textSlate500, fontSize: 16, marginTop: 16 }}>
              {t('home.noResults')}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
}
