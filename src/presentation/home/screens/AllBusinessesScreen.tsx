import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SearchBar } from '../components/SearchBar';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { LocationDropdown } from '@/presentation/shared/components/LocationDropdown';
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
  const [showLocation, setShowLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);

  const isFilterActive =
    activeFilters.categories.length > 0 ||
    activeFilters.minRating > 0;
  const isSortActive = activeSort !== null;
  const isLocationActive = activeLocations.length > 0;

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

    if (activeLocations.length > 0) {
      data = data.filter((b) =>
        activeLocations.some((loc) =>
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
  }, [displayedBusinesses, isRecentSource, localSearch, activeFilters, activeLocations, activeSort]);

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

      {/* Search bar */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        <SearchBar
          value={searchValue}
          onChangeText={onSearch}
          placeholder={t('home.searchPlaceholder')}
        />
      </View>

      {/* Sort / Filter / Location row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, height: 44, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}
      >
        <Pressable
          onPress={() => setShowSort(true)}
          accessibilityLabel={t('home.sort')}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isSortActive ? colors.neonPurple : colors.borderDark,
            backgroundColor: isSortActive ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={16}
            color={isSortActive ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: isSortActive ? '600' : '500',
              color: isSortActive ? colors.neonPurple : theme.textSecondary,
            }}
          >
            {t('home.sort')}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setShowFilter(true)}
          accessibilityLabel={t('home.filter')}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isFilterActive ? colors.neonPurple : colors.borderDark,
            backgroundColor: isFilterActive ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={16}
            color={isFilterActive ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: isFilterActive ? '600' : '500',
              color: isFilterActive ? colors.neonPurple : theme.textSecondary,
            }}
          >
            {t('home.filter')}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => setShowLocation((prev) => !prev)}
          accessibilityLabel={t('home.location')}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
            borderWidth: 1,
            borderColor: isLocationActive ? colors.neonPurple : colors.borderDark,
            backgroundColor: isLocationActive ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={isLocationActive ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: isLocationActive ? '600' : '500',
              color: isLocationActive ? colors.neonPurple : theme.textSecondary,
            }}
          >
            {t('home.location')}
          </AppText>
        </Pressable>
      </ScrollView>

      <LocationDropdown
        visible={showLocation}
        initialLocations={activeLocations}
        onApply={(locations) => {
          setActiveLocations(locations);
          setShowLocation(false);
        }}
      />

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
