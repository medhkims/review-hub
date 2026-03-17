import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, FlatList, RefreshControl, Pressable, ActivityIndicator, Keyboard, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { SearchBar } from '../components/SearchBar';
import { SearchSuggestions } from '../components/SearchSuggestions';
import { CategoryChip } from '../components/CategoryChip';
import { BusinessCard } from '../components/BusinessCard';
import { BannerSlider } from '../components/BannerSlider';
import { NoResultsView } from '@/presentation/shared/components/NoResultsView';
import { useHome } from '../hooks/useHome';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { colors } from '@/core/theme/colors';
import { getCategoryDefaultCover, getCategoryDefaultLogo } from '@/core/utils/categoryDefaultImages';
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { trackKeywordEvent } from '@/core/utils/premiumTracking';

export default function HomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.HOME);
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { role } = useRoleStore();
  const categoryDefaults = useCategoryDefaultStore((s) => s.defaults);

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
    isBannersLoading,
    error,
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
      params: {
        bannerId: banner.id,
      },
    });
  }, [router]);

  // When the home tab is pressed while already on this screen, reset search.
  // tabPress fires on the Tab navigator, but useNavigation() gives us the Stack
  // navigator (the (feed) stack). We must go up to the parent Tab navigator.
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAvatarPress = useCallback(() => {
    router.push('/(main)/(profile)/personal-info');
  }, [router]);

  const handleBusinessPress = useCallback((business: BusinessEntity) => {
    addRecentlyViewed(business);
    // Track keyword open-event when user opens a business from search results
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

  // Header shown when NOT searching — useMemo returns JSX element (not a component
  // function) so FlatList never unmounts/remounts the header on state changes.
  const defaultListHeader = useMemo(() => (
    <View>
      {/* ── Banner Slider ── */}
      <BannerSlider
        banners={banners}
        isLoading={isBannersLoading}
        onPress={handleBannerPress}
      />

      {/* ── Categories ── */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 12 }}
      >
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
          {t('home.categoriesSection')}
        </AppText>
        <Pressable
          onPress={() => router.push('/(main)/(feed)/categories')}
          accessibilityLabel="See all categories"
          accessibilityRole="button"
        >
          <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 8 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryChip
            category={item}
            isSelected={false}
            onPress={() =>
              router.push({
                pathname: '/(main)/(feed)/sub-category',
                params: { categoryId: item.id, categoryName: item.name },
              })
            }
          />
        )}
      />

      {/* ── Recent Searches ── */}
      {recentSearches.length > 0 && (
        <>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 1, marginTop: 24, marginBottom: 12 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  backgroundColor: colors.cyan,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons name="history" size={16} color={colors.white} />
              </View>
              <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
                {t('home.lastSearchesSection')}
              </AppText>
            </View>
            <Pressable
              onPress={() => router.push('/(main)/(feed)/all-businesses?source=recent')}
              accessibilityLabel="See all recently viewed"
              accessibilityRole="button"
            >
              <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
                {t('home.seeAll')}
              </AppText>
            </Pressable>
          </View>

          {/* Horizontal image cards */}
          <FlatList
            data={recentSearches.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 1, paddingBottom: 4 }}
            keyExtractor={(item) => `recent_card_${item.id}`}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleBusinessPress(item)}
                style={{ width: 150, marginRight: 14 }}
                accessibilityLabel={item.name}
                accessibilityRole="button"
              >
                <View
                  style={{
                    width: 150,
                    height: 100,
                    borderRadius: 16,
                    overflow: 'hidden',
                    backgroundColor: colors.cardDark,
                    marginBottom: 10,
                  }}
                >
                  {(() => {
                    const remote = categoryDefaults[item.categoryId];
                    const src = item.logoUrl
                      ? { uri: item.logoUrl }
                      : remote?.profileImageUrl
                        ? { uri: remote.profileImageUrl }
                        : getCategoryDefaultLogo(item.categoryId) ?? getCategoryDefaultCover(item.categoryId);
                    return src ? (
                      <Image
                        source={src}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <MaterialCommunityIcons name="store" size={36} color={colors.textSlate500} />
                      </View>
                    );
                  })()}
                </View>
                <AppText
                  style={{ fontSize: 13, fontWeight: '700', color: colors.white }}
                  numberOfLines={1}
                >
                  {item.name}
                </AppText>
                <AppText
                  style={{ fontSize: 10, color: colors.textSlate400, marginTop: 2, letterSpacing: 0.5 }}
                  numberOfLines={1}
                >
                  {item.categoryName?.toUpperCase()}
                </AppText>
              </Pressable>
            )}
          />
        </>
      )}

      {/* ── New Added ── */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 1, marginTop: 24, marginBottom: 12 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: colors.blue,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="fire" size={16} color={colors.white} />
          </View>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
            {t('home.newAddedSection')}
          </AppText>
        </View>
        <Pressable
          onPress={() => router.push('/(main)/(feed)/all-businesses?source=new')}
          accessibilityLabel="See all new businesses"
          accessibilityRole="button"
        >
          <AppText style={{ color: colors.neonPurple, fontSize: 13, fontWeight: '600' }}>
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>

      {isNewBusinessesLoading ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.neonPurple} />
        </View>
      ) : (
        <View style={{ paddingHorizontal: 1 }}>
          {newBusinesses.slice(0, 5).map((item) => (
            <BusinessCard
              key={item.id}
              business={item}
              onPress={() => handleBusinessPress(item)}
              onWishlistPress={() => toggleWishlist(item)}
              isWishlisted={isWishlisted(item.id)}
              showWishlist
              variant="compact"
              isNew
            />
          ))}
        </View>
      )}
    </View>
  ), [t, categories, banners, isBannersLoading, handleBannerPress, newBusinesses, isNewBusinessesLoading, recentSearches, handleBusinessPress, toggleWishlist, isWishlisted, router]);

  // Header shown when searching — minimal, no extra sections obscuring results
  const searchResultsHeader = useMemo(() => (
    <View style={{ paddingHorizontal: 14, paddingTop: 16, paddingBottom: 12 }}>
      <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.white }}>
        {t('home.searchResultsSection')}
      </AppText>
    </View>
  ), [t]);

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

  const isSearching = searchQuery.trim().length > 0;

  const [isFocused, setIsFocused] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  const suggestionsTitle = isSearching
    ? t('home.suggestions')
    : t('home.recentSearches');

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
    if (business) {
      addRecentlyViewed(business);
    }
    // Track keyword open-event from suggestion tap
    if (searchQuery.trim()) {
      trackKeywordEvent(id, searchQuery.trim(), true);
    }
    router.push(`/(main)/(feed)/business/${id}`);
  }, [recentSearches, newBusinesses, addRecentlyViewed, searchQuery]);

  return (
    <ScreenLayout>
      <View style={{ flex: 1 }}>
      {/*
       * Fixed header rendered OUTSIDE the FlatList.
       * This ensures the SearchBar TextInput is never unmounted/remounted
       * when the FlatList header changes, preventing the focus-loss bug.
       */}
      <View
        onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
        style={{ paddingHorizontal: 12, paddingTop: 8, paddingBottom: 16 }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16 }}
        >
          <View style={{ flex: 1 }}>
            <AppText
              style={{ fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 }}
            >
              {t('home.title')}
            </AppText>
            <AppText
              style={{ color: colors.textSlate400, marginTop: 4, fontSize: 14, fontWeight: '500' }}
            >
              {t('home.subtitle')}
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

        <SearchBar
          value={searchQuery}
          onChangeText={search}
          placeholder={t('home.searchPlaceholder')}
          onFocus={handleSearchFocus}
          onBlur={handleSearchBlur}
          onFilterPress={() => router.push('/(main)/(feed)/categories')}
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={isSearching ? businesses : []}
        renderItem={renderBusinessCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={isSearching ? searchResultsHeader : defaultListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 100 }}
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

      {showSuggestions && (
        <View
          style={{
            position: 'absolute',
            top: headerHeight,
            left: 0,
            right: 0,
            zIndex: 999,
            elevation: 999,
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
    </ScreenLayout>
  );
}
