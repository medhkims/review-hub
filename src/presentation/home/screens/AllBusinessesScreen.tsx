import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SearchBar } from '../components/SearchBar';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { NoResultsView } from '@/presentation/shared/components/NoResultsView';
import { useHome } from '../hooks/useHome';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BusinessCard } from '../components/BusinessCard';

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function AllBusinessesScreen() {
  useAnalyticsScreen(AnalyticsScreens.ALL_BUSINESSES);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const isNewSource = source === 'new';
  const isRecentSource = source === 'recent';

  const {
    businesses,
    newBusinesses,
    recentSearches,
    categories,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    isFuzzySearching,
    fuzzyMatch,
    isWishlisted,
    search,
    toggleWishlist,
    refresh,
    refreshNewBusinesses,
  } = useHome();

  // Local search query used only for the Recent Searches screen so we don't
  // trigger a Firestore query (which updates `businesses`, not `recentSearches`).
  const [localSearch, setLocalSearch] = useState('');

  const displayedBusinesses = isRecentSource
    ? recentSearches
    : isNewSource
      ? newBusinesses
      : businesses;
  const displayedLoading = isNewSource ? isNewBusinessesLoading : (isRecentSource ? false : isLoading);
  const handleRefresh = isNewSource ? refreshNewBusinesses : refresh;

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);

  const isFilterActive =
    activeFilters.locations.length > 0 ||
    activeFilters.categories.length > 0 ||
    activeFilters.minRating > 0;

  const availableCategories = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  const filteredAndSorted = useMemo(() => {
    let data = [...displayedBusinesses];

    // Local text filter for recent searches screen
    if (isRecentSource && localSearch.trim()) {
      const q = localSearch.toLowerCase();
      data = data.filter((b) => b.name.toLowerCase().includes(q));
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
  }, [displayedBusinesses, isRecentSource, localSearch, activeFilters, activeSort]);

  const handleBusinessPress = useCallback((businessId: string) => {
    router.push(`/(main)/(feed)/business/${businessId}`);
  }, [router]);

  const handleAddBusiness = useCallback(() => {
    router.push('/(main)/(feed)/add-business');
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <BusinessCard
        business={item}
        onPress={() => handleBusinessPress(item.id)}
        onWishlistPress={() => toggleWishlist(item)}
        isWishlisted={isWishlisted(item.id)}
        variant="compact"
      />
    ),
    [handleBusinessPress, toggleWishlist, isWishlisted],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  // For recent searches: use local state; for others: use the store search.
  const searchValue = isRecentSource ? localSearch : searchQuery;
  const onSearch = isRecentSource ? setLocalSearch : search;

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 8,
          paddingBottom: 12,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
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
            marginLeft: 4,
          }}
        >
          {isRecentSource
            ? t('home.lastSearchesSection')
            : isNewSource
              ? t('home.newAddedSection')
              : t('home.allBusinesses')}
        </AppText>
      </View>

      {/* Search + Sort + Filter row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 16,
          gap: 10,
        }}
      >
        <View style={{ flex: 1 }}>
          <SearchBar
            value={searchValue}
            onChangeText={onSearch}
            placeholder={t('home.searchPlaceholder')}
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

      {/* Loading indicator */}
      {displayedLoading && displayedBusinesses.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      )}

      {/* Business List */}
      <FlatList
        data={filteredAndSorted}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !displayedLoading ? (
            <NoResultsView
              searchQuery={searchValue}
              fuzzyMatch={fuzzyMatch}
              isFuzzySearching={isFuzzySearching}
              onOpenSuggestion={(business) => handleBusinessPress(business.id)}
              onAddNew={handleAddBusiness}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={displayedLoading && displayedBusinesses.length > 0}
            onRefresh={handleRefresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      />

      {/* Bottom Sheets */}
      <FilterBySheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setShowFilter(false);
        }}
        initialFilters={activeFilters}
        showCategories={true}
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
