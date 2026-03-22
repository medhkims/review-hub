import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

// ── Business Card ─────────────────────────────────────────────────────────────

interface BusinessCardProps {
  item: BusinessEntity;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
}

const BusinessCard = React.memo<BusinessCardProps>(({ item, onPress, onFavorite }) => {
  const theme = useTheme();
  const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
  const handleFavorite = useCallback(() => onFavorite(item.id), [item.id, onFavorite]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        marginBottom: 14,
        borderRadius: 16,
        backgroundColor: theme.card,
        overflow: 'hidden',
        opacity: pressed ? 0.9 : 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
      })}
      accessibilityLabel={item.name}
      accessibilityRole="button"
    >
      {/* Avatar / Cover Image */}
      <View style={{ position: 'relative', marginRight: 14 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: theme.border,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {item.coverImageUrl ? (
            <Image
              source={{ uri: item.coverImageUrl }}
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={item.name}
            />
          ) : (
            <MaterialCommunityIcons name="store" size={32} color={theme.textMuted} />
          )}
        </View>

        {/* Rating Badge */}
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: -2,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.neonPurple,
            borderRadius: 10,
            paddingHorizontal: 5,
            paddingVertical: 2,
          }}
        >
          <MaterialCommunityIcons name="star" size={10} color={colors.white} />
          <AppText style={{ fontSize: 10, fontWeight: '700', color: colors.white, marginLeft: 2 }}>
            {item.rating.toFixed(1)}
          </AppText>
        </View>
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <AppText
          style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 3 }}
          numberOfLines={1}
        >
          {item.name}
        </AppText>
        <AppText
          style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '500', marginBottom: 6 }}
          numberOfLines={1}
        >
          {item.categoryName}
        </AppText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={13}
            color={theme.textSecondary}
          />
          <AppText
            style={{ fontSize: 12, color: theme.textSecondary, marginLeft: 3 }}
            numberOfLines={1}
          >
            {item.location}
          </AppText>
        </View>
      </View>

      {/* Favorite Button */}
      <Pressable
        onPress={handleFavorite}
        style={({ pressed }) => ({
          width: 36,
          height: 36,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
        accessibilityLabel={`Favorite ${item.name}`}
        accessibilityRole="button"
      >
        <MaterialCommunityIcons
          name={item.isFavorite ? 'heart' : 'heart-outline'}
          size={22}
          color={item.isFavorite ? colors.neonPurple : theme.textSecondary}
        />
      </Pressable>
    </Pressable>
  );
});

BusinessCard.displayName = 'BusinessCard';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MultiCategoryResultsScreen() {
  useAnalyticsScreen(AnalyticsScreens.MULTI_CATEGORY_RESULTS);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categoryIds, categoryNames } = useLocalSearchParams<{
    categoryIds: string;
    categoryNames: string;
  }>();

  const parsedIds = useMemo(
    () => (categoryIds ? categoryIds.split(',').filter(Boolean) : []),
    [categoryIds],
  );

  const title = useMemo(() => {
    if (!categoryNames) return t('home.allCategories.title');
    const names = categoryNames.split(',').filter(Boolean);
    if (names.length <= 2) return names.join(' & ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }, [categoryNames, t]);

  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);

  const loadBusinesses = useCallback(async () => {
    if (parsedIds.length === 0) {
      setIsLoading(false);
      return;
    }
    setError(null);

    const results = await Promise.all(
      parsedIds.map((id) => container.getBusinessesByCategoryUseCase.execute(id)),
    );

    const merged: BusinessEntity[] = [];
    const seen = new Set<string>();

    results.forEach((result) => {
      result.fold(
        () => {},
        (data) => {
          data.forEach((b) => {
            if (!seen.has(b.id)) {
              seen.add(b.id);
              merged.push(b);
            }
          });
        },
      );
    });

    if (merged.length === 0 && results.every((r) => r.isLeft())) {
      setError(t('common.error'));
    }

    setBusinesses(merged);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [parsedIds, t]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBusinesses();
  }, [loadBusinesses]);

  // Unique categories present in the loaded businesses (for the filter dropdown)
  const availableCategories = useMemo(() => {
    const seen = new Set<string>();
    const result: { id: string; name: string }[] = [];
    businesses.forEach((b) => {
      if (!seen.has(b.categoryId)) {
        seen.add(b.categoryId);
        result.push({ id: b.categoryId, name: b.categoryName });
      }
    });
    return result;
  }, [businesses]);

  const filteredData = useMemo(() => {
    let data = businesses;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((b) => b.name.toLowerCase().includes(query));
    }

    if (activeFilters.locations.length > 0) {
      data = data.filter((b) =>
        activeFilters.locations.some((loc) =>
          b.location?.toLowerCase().includes(loc.toLowerCase()),
        ),
      );
    }

    if (activeFilters.categories.length > 0) {
      data = data.filter((b) => activeFilters.categories.includes(b.categoryId));
    }

    if (activeFilters.minRating > 0) {
      data = data.filter((b) => b.rating >= activeFilters.minRating);
    }

    switch (activeSort) {
      case 'top_rating':
        return [...data].sort((a, b) => b.rating - a.rating);
      case 'top_result':
        return [...data].sort((a, b) => b.reviewCount - a.reviewCount);
      case 'new_businesses':
        return [...data].sort((a, b) => {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
          return bTime - aTime;
        });
      default:
        return data;
    }
  }, [businesses, searchQuery, activeFilters, activeSort]);

  const isFilterActive =
    activeFilters.locations.length > 0 ||
    activeFilters.categories.length > 0 ||
    activeFilters.minRating > 0;

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleItemPress = useCallback(
    (id: string) => {
      router.push({ pathname: '/(main)/(feed)/business/[businessId]', params: { businessId: id } });
    },
    [router],
  );

  const handleFavorite = useCallback(
    async (businessId: string) => {
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
    },
    [user],
  );

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <BusinessCard item={item} onPress={handleItemPress} onFavorite={handleFavorite} />
    ),
    [handleItemPress, handleFavorite],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

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
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : theme.isDark ? 'rgba(30,41,59,0.5)' : 'rgba(148,163,184,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={theme.text} />
        </Pressable>
        <AppText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: theme.text,
            flex: 1,
            marginLeft: 16,
            letterSpacing: -0.3,
          }}
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      {/* Search + Sort + Filter row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingBottom: 12,
          gap: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
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
            style={{ flex: 1, color: theme.text, fontSize: 15, padding: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={t('home.searchPlaceholder')}
            accessibilityRole="search"
          />
        </View>

        {/* Sort button */}
        <Pressable
          onPress={() => setShowSort(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: activeSort ? 'rgba(168,85,247,0.15)' : theme.card,
            borderWidth: 1,
            borderColor: activeSort ? colors.neonPurple : theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={t('home.sort')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={22}
            color={activeSort ? colors.neonPurple : theme.textSecondary}
          />
        </Pressable>

        {/* Filter button */}
        <Pressable
          onPress={() => setShowFilter(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: isFilterActive ? 'rgba(168,85,247,0.15)' : theme.card,
            borderWidth: 1,
            borderColor: isFilterActive ? colors.neonPurple : theme.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={t('home.filter')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={22}
            color={isFilterActive ? colors.neonPurple : theme.textSecondary}
          />
        </Pressable>
      </View>

      {/* Loading */}
      {isLoading && businesses.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          style={{ flex: 1 }}
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
                size={52}
                color={theme.textMuted}
              />
              <AppText
                style={{
                  color: theme.textSecondary,
                  fontSize: 16,
                  fontWeight: '600',
                  marginTop: 16,
                  textAlign: 'center',
                }}
              >
                {error ?? t('home.noResults')}
              </AppText>
            </View>
          }
        />
      )}

      {/* Bottom Sheets */}
      <FilterBySheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setShowFilter(false);
        }}
        initialFilters={activeFilters}
        showCategories={availableCategories.length > 1}
        availableCategories={availableCategories}
      />

      <SortBySheet
        visible={showSort}
        onClose={() => setShowSort(false)}
        onApply={(option) => {
          setActiveSort(option);
          setShowSort(false);
        }}
        initialValue={activeSort}
      />
    </ScreenLayout>
  );
}
