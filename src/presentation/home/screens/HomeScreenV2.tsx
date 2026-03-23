import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Keyboard,
  Image,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestions } from '../components/SearchSuggestions';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { LocationDropdown } from '@/presentation/shared/components/LocationDropdown';
import { BusinessCard } from '../components/BusinessCard';
import { NoResultsView } from '@/presentation/shared/components/NoResultsView';
import { useHome } from '../hooks/useHome';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { getCategoryDefaultCover, getCategoryDefaultLogo } from '@/core/utils/categoryDefaultImages';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { trackKeywordEvent } from '@/core/utils/premiumTracking';

// Accent color cycling for category tiles
const CATEGORY_ACCENT_COLORS = [
  colors.neonPurple,
  colors.blue,
  colors.pink,
  colors.emerald,
  colors.orange,
  colors.cyan,
  colors.indigo,
  colors.yellow,
];

export default function HomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.HOME);
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const theme = useTheme();
  const categoryDefaults = useCategoryDefaultStore((s) => s.defaults);
  const { width: windowWidth } = useWindowDimensions();
  // 4 tiles per row, 3 gaps of 10px, FlatList paddingHorizontal 16 on each side
  const categoryTileWidth = (windowWidth - 32 - 30) / 4;

  const {
    businesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    searchQuery,
    isLoading,
    isFuzzySearching,
    fuzzyMatch,
    isNewBusinessesLoading,
    isWishlisted,
    search,
    toggleWishlist,
    addRecentlyViewed,
    refresh,
  } = useHome();

  const handleBannerPress = useCallback((banner: BannerEntity) => {
    if (!banner.isClickable) return;
    router.push({
      pathname: '/(main)/(feed)/banner/[bannerId]',
      params: { bannerId: banner.id },
    });
  }, [router]);

  useEffect(() => {
    const tabNavigator = navigation.getParent();
    if (!tabNavigator) return;
    const unsubscribe = tabNavigator.addListener('tabPress' as never, () => {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      if (searchQuery.trim().length > 0) {
        Keyboard.dismiss();
        search('');
      }
    });
    return unsubscribe;
  }, [navigation, searchQuery, search]);

  const getFirstName = (name: string) => name.split(' ')[0];
  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleAvatarPress = useCallback(() => {
    router.push('/(main)/(settings)');
  }, [router]);

  const handleBusinessPress = useCallback((business: BusinessEntity) => {
    addRecentlyViewed(business);
    if (searchQuery.trim()) {
      trackKeywordEvent(business.id, searchQuery.trim(), true);
    }
    router.push(`/(main)/(feed)/business/${business.id}`);
  }, [router, addRecentlyViewed, searchQuery]);

  const renderBusinessCard = useCallback(({ item }: { item: BusinessEntity }) => (
    <BusinessCard
      business={item}
      onPress={() => handleBusinessPress(item)}
      onWishlistPress={() => toggleWishlist(item)}
      isWishlisted={isWishlisted(item.id)}
      showWishlist
      variant="compact"
    />
  ), [handleBusinessPress, toggleWishlist, isWishlisted]);

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  // ── Discovery content shown when NOT searching ──
  const defaultListHeader = useMemo(() => {
    const featuredBanner = banners[0] ?? null;
    const featuredBusiness = newBusinesses[0] ?? null;
    const heroImageSrc = featuredBanner?.imageUrl
      ? { uri: featuredBanner.imageUrl }
      : featuredBusiness?.coverImageUrl
        ? { uri: featuredBusiness.coverImageUrl }
        : featuredBusiness?.logoUrl
          ? { uri: featuredBusiness.logoUrl }
          : null;

    return (
      <View style={{ paddingBottom: 24 }}>

        {/* ── Hero Card ── */}
        {(featuredBanner || featuredBusiness) && (
          <View style={{ marginBottom: 32 }}>
            <Pressable
              onPress={() => {
                if (featuredBanner) handleBannerPress(featuredBanner);
                else if (featuredBusiness) handleBusinessPress(featuredBusiness);
              }}
              accessibilityRole="button"
              accessibilityLabel={featuredBanner?.title ?? featuredBusiness?.name ?? 'Featured'}
              style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })}
            >
              <View
                style={{
                  height: 210,
                  borderRadius: 24,
                  overflow: 'hidden',
                  backgroundColor: colors.cardDark,
                }}
              >
                {heroImageSrc ? (
                  <Image
                    source={heroImageSrc}
                    style={{ position: 'absolute', width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View
                    style={{
                      position: 'absolute', width: '100%', height: '100%',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="store" size={60} color={colors.textSlate500} />
                  </View>
                )}

                {/* Bottom overlay — kept short so image stays visible */}
                <View
                  style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 85,
                    backgroundColor: 'rgba(15,23,42,0.88)',
                  }}
                />

                {/* "FEATURED" badge */}
                <View
                  style={{
                    position: 'absolute', top: 14, left: 14,
                    backgroundColor: colors.neonPurple,
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 5,
                  }}
                >
                  <MaterialCommunityIcons name="star-four-points" size={10} color={colors.white} />
                  <AppText style={{ fontSize: 10, fontWeight: '800', color: colors.white, letterSpacing: 1.2 }}>
                    {t('home.featuredBadge')}
                  </AppText>
                </View>

                {/* Info row at bottom */}
                <View style={{ position: 'absolute', bottom: 14, left: 16, right: 58 }}>
                  <AppText
                    style={{ fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 5, letterSpacing: -0.3 }}
                    numberOfLines={1}
                  >
                    {featuredBanner?.title ?? featuredBusiness?.name ?? ''}
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {!featuredBanner && featuredBusiness && (
                      <>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <MaterialCommunityIcons name="star" size={13} color={colors.ratingGold} />
                          <AppText style={{ fontSize: 13, color: colors.ratingGold, fontWeight: '700' }}>
                            {featuredBusiness.rating?.toFixed(1) ?? '—'}
                          </AppText>
                        </View>
                        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: colors.textSlate500 }} />
                        <AppText style={{ fontSize: 12, color: colors.textSlate400 }} numberOfLines={1}>
                          {featuredBusiness.categoryName}
                        </AppText>
                      </>
                    )}
                    {featuredBanner && (
                      <AppText style={{ fontSize: 12, color: colors.textSlate400 }} numberOfLines={1}>
                        {featuredBanner.description}
                      </AppText>
                    )}
                  </View>
                </View>

                {/* Arrow button */}
                <View
                  style={{
                    position: 'absolute', bottom: 18, right: 14,
                    width: 38, height: 38, borderRadius: 19,
                    backgroundColor: colors.neonPurple,
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <MaterialCommunityIcons name="arrow-right" size={20} color={colors.white} />
                </View>
              </View>
            </Pressable>
          </View>
        )}

        {/* ── Explore Categories (horizontal scroll) ── */}
        {categories.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}
            >
              <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                {t('home.explore')}
              </AppText>
              <Pressable
                onPress={() => router.push('/(main)/(feed)/categories')}
                accessibilityLabel="All categories"
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}
              >
                <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
                  {t('home.seeAll')}
                </AppText>
                <MaterialCommunityIcons name="chevron-right" size={15} color={colors.neonPurple} />
              </Pressable>
            </View>

            {/* ── 2-row horizontal scroll: 4 tiles per row, fills full width ── */}
            {[categories.filter((_, i) => i % 2 === 0), categories.filter((_, i) => i % 2 !== 0)].map(
              (row, rowIdx) => (
                <ScrollView
                  key={`cat_row_${rowIdx}`}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginBottom: rowIdx === 0 ? 10 : 0 }}
                >
                  {row.map((cat, colIdx) => {
                    const idx = rowIdx + colIdx * 2;
                    const accent = CATEGORY_ACCENT_COLORS[idx % CATEGORY_ACCENT_COLORS.length];
                    const isLast = colIdx === row.length - 1;
                    return (
                      <Pressable
                        key={cat.id}
                        onPress={() =>
                          router.push({
                            pathname: '/(main)/(feed)/sub-category',
                            params: { categoryId: cat.id, categoryName: cat.name },
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={cat.name}
                        style={({ pressed }) => ({
                          width: categoryTileWidth,
                          marginRight: isLast ? 0 : 10,
                          backgroundColor: pressed ? `${accent}18` : colors.cardDark,
                          borderRadius: 18,
                          paddingVertical: 16,
                          paddingHorizontal: 6,
                          alignItems: 'center',
                          borderWidth: 1,
                          borderColor: `${accent}2E`,
                        })}
                      >
                        <View
                          style={{
                            width: 48, height: 48, borderRadius: 24,
                            backgroundColor: `${accent}1E`,
                            alignItems: 'center', justifyContent: 'center', marginBottom: 8,
                          }}
                        >
                          <MaterialCommunityIcons
                            name={(cat.icon as never) ?? 'store-outline'}
                            size={24}
                            color={accent}
                          />
                        </View>
                        <AppText
                          style={{ fontSize: 11, fontWeight: '600', color: theme.text, textAlign: 'center' }}
                          numberOfLines={2}
                        >
                          {cat.name}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              ),
            )}
          </View>
        )}

        {/* ── Trending Now ── */}
        <View style={{ marginBottom: 32 }}>
          <View
            style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.neonPurple }}
              />
              <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                {t('home.trendingNow')}
              </AppText>
            </View>
            <Pressable
              onPress={() => router.push('/(main)/(feed)/all-businesses?source=new')}
              accessibilityLabel="See all trending businesses"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="arrow-right" size={22} color={colors.neonPurple} />
            </Pressable>
          </View>

          {isNewBusinessesLoading ? (
            <View style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="small" color={colors.neonPurple} />
            </View>
          ) : newBusinesses.length > 0 ? (
            <FlatList
              data={newBusinesses.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              keyExtractor={(item) => `trend_${item.id}`}
              renderItem={({ item }) => {
                const remote = categoryDefaults[item.categoryId];
                const imgSrc = item.coverImageUrl
                  ? { uri: item.coverImageUrl }
                  : item.logoUrl
                    ? { uri: item.logoUrl }
                    : remote?.profileImageUrl
                      ? { uri: remote.profileImageUrl }
                      : getCategoryDefaultCover(item.categoryId) ?? getCategoryDefaultLogo(item.categoryId);

                return (
                  <Pressable
                    onPress={() => handleBusinessPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                  >
                    <View
                      style={{
                        width: 150, height: 130, borderRadius: 20,
                        overflow: 'hidden', backgroundColor: colors.cardDark,
                      }}
                    >
                      {imgSrc ? (
                        <Image
                          source={imgSrc}
                          style={{ position: 'absolute', width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                          <MaterialCommunityIcons name="store" size={40} color={colors.textSlate500} />
                        </View>
                      )}

                      {/* Dark overlay at bottom */}
                      <View
                        style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
                          backgroundColor: 'rgba(15,23,42,0.82)',
                          paddingHorizontal: 10, paddingBottom: 10,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <AppText
                          style={{ fontSize: 13, fontWeight: '700', color: colors.white }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                          <MaterialCommunityIcons name="star" size={11} color={colors.ratingGold} />
                          <AppText style={{ fontSize: 11, color: colors.ratingGold, fontWeight: '700' }}>
                            {item.rating?.toFixed(1) ?? '—'}
                          </AppText>
                          <AppText style={{ fontSize: 10, color: colors.textSlate500 }}>
                            ({item.reviewCount})
                          </AppText>
                        </View>
                      </View>

                      {/* Wishlist heart */}
                      <Pressable
                        onPress={() => toggleWishlist(item)}
                        accessibilityLabel="Toggle wishlist"
                        accessibilityRole="button"
                        style={{
                          position: 'absolute', top: 8, right: 8,
                          width: 30, height: 30, borderRadius: 15,
                          backgroundColor: 'rgba(15,23,42,0.65)',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons
                          name={isWishlisted(item.id) ? 'heart' : 'heart-outline'}
                          size={15}
                          color={isWishlisted(item.id) ? colors.pink : colors.white}
                        />
                      </Pressable>

                      {/* NEW badge */}
                      <View
                        style={{
                          position: 'absolute', top: 8, left: 8,
                          backgroundColor: colors.emerald,
                          paddingHorizontal: 7, paddingVertical: 3,
                          borderRadius: 10,
                        }}
                      >
                        <AppText style={{ fontSize: 9, fontWeight: '800', color: colors.white, letterSpacing: 0.8 }}>
                          {t('home.newBadge')}
                        </AppText>
                      </View>
                    </View>
                    <AppText
                      style={{ fontSize: 11, color: theme.textSecondary, marginTop: 6, letterSpacing: 0.4 }}
                      numberOfLines={1}
                    >
                      {item.categoryName?.toUpperCase()}
                    </AppText>
                  </Pressable>
                );
              }}
            />
          ) : null}
        </View>

        {/* ── Add Business CTA ── */}
        <Pressable
          onPress={() => router.push('/(main)/(feed)/add-business')}
          accessibilityRole="button"
          accessibilityLabel={t('home.addBusinessCtaTitle')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderWidth: 1.5,
              borderColor: `${colors.neonPurple}44`,
              borderRadius: 20,
              padding: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <View
              style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: `${colors.neonPurple}22`,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={28} color={colors.neonPurple} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text, marginBottom: 3 }}>
                {t('home.addBusinessCtaTitle')}
              </AppText>
              <AppText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}>
                {t('home.addBusinessCtaSubtitle')}
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textSlate500} />
          </View>
        </Pressable>

      </View>
    );
  }, [
    t, theme, categories, banners, newBusinesses,
    isNewBusinessesLoading, handleBannerPress, handleBusinessPress,
    toggleWishlist, isWishlisted, router, categoryDefaults, categoryTileWidth,
  ]);

  // Minimal header shown when searching
  const searchResultsHeader = useMemo(() => (
    <View style={{ paddingTop: 16, paddingBottom: 12 }}>
      <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
        {t('home.searchResultsSection')}
      </AppText>
    </View>
  ), [t, theme]);

  const handleFuzzyYes = useCallback((business: BusinessEntity) => {
    addRecentlyViewed(business);
    router.push(`/(main)/(feed)/business/${business.id}`);
  }, [router, addRecentlyViewed]);

  const handleAddNewBusiness = useCallback(() => {
    router.push({
      pathname: '/(main)/(feed)/add-business',
      params: { prefillName: searchQuery },
    });
  }, [router, searchQuery]);

  const ListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      );
    }
    if (!searchQuery.trim()) return null;
    return (
      <NoResultsView
        searchQuery={searchQuery}
        fuzzyMatch={fuzzyMatch}
        isFuzzySearching={isFuzzySearching}
        onOpenSuggestion={handleFuzzyYes}
        onAddNew={handleAddNewBusiness}
      />
    );
  }, [isLoading, isFuzzySearching, fuzzyMatch, searchQuery, handleFuzzyYes, handleAddNewBusiness]);

  const [isFocused, setIsFocused] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);
  const [activeLocations, setActiveLocations] = useState<string[]>([]);

  const isSearching = searchQuery.trim().length > 0;
  const isFilterActive = activeFilters.categories.length > 0 || activeFilters.minRating > 0;
  const isSortActive = activeSort !== null;
  const isLocationActive = activeLocations.length > 0;

  const availableCategories = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  const filteredAndSorted = useMemo(() => {
    if (!isSearching) return businesses;
    let data = [...businesses];
    if (activeLocations.length > 0) {
      data = data.filter((b) =>
        activeLocations.some((loc) => b.location?.toLowerCase().includes(loc.toLowerCase())),
      );
    }
    if (activeFilters.categories.length > 0) {
      data = data.filter((b) => activeFilters.categories.includes(b.categoryId));
    }
    if (activeFilters.minRating > 0) {
      data = data.filter((b) => b.rating >= activeFilters.minRating);
    }
    switch (activeSort) {
      case 'top_rating': return [...data].sort((a, b) => b.rating - a.rating);
      case 'top_result': return [...data].sort((a, b) => b.reviewCount - a.reviewCount);
      case 'new_businesses': return [...data].sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return bTime - aTime;
      });
      default: return data;
    }
  }, [isSearching, businesses, activeFilters, activeLocations, activeSort]);

  const flatListRef = useRef<FlatList<BusinessEntity>>(null);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    };
  }, []);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const seen = new Set<string>();
    const results: { id: string; name: string }[] = [];
    [...recentSearches, ...newBusinesses].forEach((b) => {
      if (!seen.has(b.id) && b.name.toLowerCase().includes(q)) {
        seen.add(b.id);
        results.push({ id: b.id, name: b.name });
      }
    });
    return results.slice(0, 6);
  }, [searchQuery, newBusinesses, recentSearches]);

  const suggestionItems = isSearching
    ? suggestions
    : recentSearches.slice(0, 5).map((b) => ({ id: b.id, name: b.name }));

  const showSuggestions = isFocused && suggestionItems.length > 0 && headerHeight > 0;
  const suggestionsTitle = isSearching ? t('home.suggestions') : t('home.recentSearches');

  const handleSearchFocus = useCallback(() => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setIsFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 150);
  }, []);

  const handleSuggestionSelect = useCallback((id: string, _name: string) => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    setIsFocused(false);
    Keyboard.dismiss();
    const business = [...recentSearches, ...newBusinesses].find((b) => b.id === id);
    if (business) addRecentlyViewed(business);
    if (searchQuery.trim()) trackKeywordEvent(id, searchQuery.trim(), true);
    router.push(`/(main)/(feed)/business/${id}`);
  }, [recentSearches, newBusinesses, addRecentlyViewed, searchQuery, router]);

  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>
        {/*
         * Fixed header rendered OUTSIDE the FlatList.
         * Prevents SearchBar TextInput from unmounting/remounting on list state changes.
         */}
        <View
          onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 14 }}
        >
          {/* ── Top bar: logo + avatar ── */}
          <View
            style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9 }}>
              <View
                style={{
                  width: 34, height: 34, borderRadius: 11,
                  backgroundColor: colors.neonPurple,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="star-four-points" size={19} color={colors.white} />
              </View>
              <AppText style={{ fontSize: 18, fontWeight: '800', color: theme.text, letterSpacing: -0.4 }}>
                ReviewHub
              </AppText>
            </View>
            <Pressable
              onPress={handleAvatarPress}
              accessibilityLabel="Profile"
              accessibilityRole="button"
            >
              <Avatar
                imageUrl={user?.avatarUrl}
                size="sm"
                initials={user ? getInitials(user.displayName) : '?'}
              />
            </Pressable>
          </View>

          {/* ── Greeting (hidden while searching to save space) ── */}
          {!isSearching && (
            <View style={{ marginBottom: 18 }}>
              <AppText
                style={{ fontSize: 28, fontWeight: '800', color: theme.text, letterSpacing: -0.5 }}
              >
                {t('home.greeting', { name: user ? getFirstName(user.displayName) : '' })}
              </AppText>
              <AppText style={{ fontSize: 14, color: theme.textSecondary, marginTop: 4 }}>
                {t('home.greetingSubtitle')}
              </AppText>
            </View>
          )}

          {/* ── Search bar ── */}
          <SearchBar
            value={searchQuery}
            onChangeText={search}
            placeholder={t('home.searchPlaceholder')}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
          />

          {/* ── Sort / Filter / Location chips (visible only while searching) ── */}
          {isSearching && (
            <>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ flexGrow: 0, marginTop: 10 }}
                contentContainerStyle={{ gap: 10 }}
              >
                <Pressable
                  onPress={() => setShowSort(true)}
                  accessibilityLabel={t('home.sort')}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 16, paddingVertical: 9,
                    borderRadius: 24, borderWidth: 1.5,
                    borderColor: isSortActive ? colors.neonPurple : colors.borderDark,
                    backgroundColor: isSortActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? 'rgba(51,65,85,0.6)' : colors.cardDark,
                  })}
                >
                  <MaterialCommunityIcons
                    name="swap-vertical" size={15}
                    color={isSortActive ? colors.neonPurple : colors.textSlate200}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isSortActive ? '600' : '500', color: isSortActive ? colors.neonPurple : colors.textSlate200 }}>
                    {t('home.sort')}
                  </AppText>
                  {isSortActive && (
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.neonPurple, marginLeft: 2 }} />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowFilter(true)}
                  accessibilityLabel={t('home.filter')}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 16, paddingVertical: 9,
                    borderRadius: 24, borderWidth: 1.5,
                    borderColor: isFilterActive ? colors.neonPurple : colors.borderDark,
                    backgroundColor: isFilterActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? 'rgba(51,65,85,0.6)' : colors.cardDark,
                  })}
                >
                  <MaterialCommunityIcons
                    name="tune-variant" size={15}
                    color={isFilterActive ? colors.neonPurple : colors.textSlate200}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isFilterActive ? '600' : '500', color: isFilterActive ? colors.neonPurple : colors.textSlate200 }}>
                    {t('home.filter')}
                  </AppText>
                  {isFilterActive && (
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.neonPurple, marginLeft: 2 }} />
                  )}
                </Pressable>

                <Pressable
                  onPress={() => setShowLocation((prev) => !prev)}
                  accessibilityLabel={t('home.location')}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 16, paddingVertical: 9,
                    borderRadius: 24, borderWidth: 1.5,
                    borderColor: isLocationActive ? colors.neonPurple : colors.borderDark,
                    backgroundColor: isLocationActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? 'rgba(51,65,85,0.6)' : colors.cardDark,
                  })}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline" size={15}
                    color={isLocationActive ? colors.neonPurple : colors.textSlate200}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isLocationActive ? '600' : '500', color: isLocationActive ? colors.neonPurple : colors.textSlate200 }}>
                    {t('home.location')}
                  </AppText>
                  {isLocationActive && (
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.neonPurple, marginLeft: 2 }} />
                  )}
                </Pressable>
              </ScrollView>

              <LocationDropdown
                visible={showLocation}
                initialLocations={activeLocations}
                onApply={(locs) => {
                  setActiveLocations(locs);
                  setShowLocation(false);
                }}
              />
            </>
          )}
        </View>

        {/* ── FlatList: empty data when browsing, results when searching ── */}
        <FlatList
          ref={flatListRef}
          data={isSearching ? filteredAndSorted : []}
          renderItem={renderBusinessCard}
          keyExtractor={keyExtractor}
          ListHeaderComponent={isSearching ? searchResultsHeader : defaultListHeader}
          ListEmptyComponent={ListEmpty}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={isNewBusinessesLoading}
              onRefresh={refresh}
              tintColor={colors.neonPurple}
              colors={[colors.neonPurple]}
            />
          }
        />

        {/* ── Suggestions overlay ── */}
        {showSuggestions && (
          <View
            style={{
              position: 'absolute', top: headerHeight, left: 0, right: 0,
              zIndex: 999, elevation: 999,
            }}
          >
            <SearchSuggestions
              items={suggestionItems}
              sectionTitle={suggestionsTitle}
              onSelect={handleSuggestionSelect}
            />
          </View>
        )}
      </View>

      <SortBySheet
        visible={showSort}
        onClose={() => setShowSort(false)}
        onApply={(sort) => { setActiveSort(sort); setShowSort(false); }}
        initialValue={activeSort}
      />
      <FilterBySheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => { setActiveFilters(filters); setShowFilter(false); }}
        initialFilters={activeFilters}
        showCategories
        availableCategories={availableCategories}
      />
    </ScreenLayout>
  );
}
