import React, { useCallback, useState } from 'react';
import { View, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SearchBar } from '../components/SearchBar';
import { FilterBySheet } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet } from '@/presentation/shared/components/SortBySheet';
import { NoResultsView } from '@/presentation/shared/components/NoResultsView';
import { useHome } from '../hooks/useHome';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { colors } from '@/core/theme/colors';
import { BusinessCard } from '../components/BusinessCard';

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function AllBusinessesScreen() {
  useAnalyticsScreen(AnalyticsScreens.ALL_BUSINESSES);
  const { t } = useTranslation();
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const isNewSource = source === 'new';
  const isRecentSource = source === 'recent';

  const {
    businesses,
    newBusinesses,
    recentSearches,
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

  const displayedBusinesses = isRecentSource
    ? recentSearches
    : isNewSource
      ? newBusinesses
      : businesses;
  const displayedLoading = isNewSource ? isNewBusinessesLoading : (isRecentSource ? false : isLoading);
  const handleRefresh = isNewSource ? refreshNewBusinesses : refresh;

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);

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
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textWhite} />
        </Pressable>
        <AppText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.textWhite,
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

      {/* Search + Sort + Filter row — hidden for recent searches (local, static) */}
      {!isRecentSource && <View
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
            value={searchQuery}
            onChangeText={search}
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
            backgroundColor: colors.cardDark,
            borderWidth: 1,
            borderColor: colors.borderDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={t('home.sort')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="swap-vertical" size={22} color={colors.neonPurple} />
        </Pressable>

        {/* Filter button */}
        <Pressable
          onPress={() => setShowFilter(true)}
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.cardDark,
            borderWidth: 1,
            borderColor: colors.borderDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          accessibilityLabel={t('home.filter')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="tune-variant" size={22} color={colors.neonPurple} />
        </Pressable>
      </View>}

      {/* Loading indicator */}
      {displayedLoading && displayedBusinesses.length === 0 && (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      )}

      {/* Business List */}
      <FlatList
        data={displayedBusinesses}
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
              searchQuery={searchQuery}
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
        onApply={() => setShowFilter(false)}
      />

      <SortBySheet
        visible={showSort}
        onClose={() => setShowSort(false)}
        onApply={() => setShowSort(false)}
      />
    </ScreenLayout>
  );
}
