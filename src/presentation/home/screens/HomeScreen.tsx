import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Skeleton placeholder — a simple rounded box shown while data loads
function SkeletonBox({ width, height, borderRadius = 16, isDark, style }: { width: number | string; height: number; borderRadius?: number; isDark?: boolean; style?: object }) {
  return (
    <View
      style={[
        {
          width: width as never,
          height,
          borderRadius,
          backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        },
        style,
      ]}
    />
  );
}

// Animated counter that counts from 0 → target over ~2 s
function AnimatedCounter({ value, style }: { value: number; style?: object }) {
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplayed(0); return; }
    animValue.setValue(0);
    const listenerId = animValue.addListener(({ value: v }) => setDisplayed(Math.round(v)));
    Animated.timing(animValue, {
      toValue: value,
      duration: 2000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(listenerId);
  }, [value]);

  return <AppText style={style}>{displayed.toLocaleString()}</AppText>;
}
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
  Animated,
  Easing,
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
import { LocationFilterSheet, LocationFilter } from '@/presentation/shared/components/LocationFilterSheet';
import { getMunicipalitiesForGovernorate } from '@/core/constants/tunisiaLocations';
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
import { useCategoryDefaultStore } from '@/presentation/shared/store/categoryDefaultStore';
import { trackKeywordEvent } from '@/core/utils/premiumTracking';
import { haversineDistanceKm } from '@/core/utils/geoDistance';

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
    nearbyBusinesses,
    topRatedBusinesses,
    popularCategoryBusinesses,
    newBusinesses,
    recentSearches,
    categories,
    banners,
    recentReviews,
    deals,
    weeklyPicks,
    userLocation,
    mostViewedCategoryId,
    searchQuery,
    isLoading,
    isCategoryLoading,
    isNewBusinessesLoading,
    isFuzzySearching,
    fuzzyMatch,
    isWishlisted,
    homeStats,
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

  // Sticky search bar: track scroll position and measure header sections
  const scrollY = useRef(new Animated.Value(0)).current;
  const [preSearchHeight, setPreSearchHeight] = useState(0);
  const [searchSectionHeight, setSearchSectionHeight] = useState(0);

  // True while the very first load is still in flight (no data yet)
  const isSectionsLoading = isCategoryLoading && categories.length === 0;

  // ── Discovery content shown when NOT searching ──
  const defaultListHeader = useMemo(() => {
    const featuredBanner = banners[0] ?? null;
    const featuredBusiness = newBusinesses[0] ?? null;
    const topRated = topRatedBusinesses;
    const heroImageSrc = featuredBanner?.imageUrl
      ? { uri: featuredBanner.imageUrl }
      : featuredBusiness?.coverImageUrl
        ? { uri: featuredBusiness.coverImageUrl }
        : featuredBusiness?.logoUrl
          ? { uri: featuredBusiness.logoUrl }
          : null;

    return (
      <View style={{ paddingBottom: 24 }}>

        {/* ── Scrollable header: logo + avatar + greeting ── */}
        <View onLayout={(e) => setPreSearchHeight(e.nativeEvent.layout.height)}>
          {/* ── Top bar: logo + avatar ── */}
          <View
            style={{
              flexDirection: 'row', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20, paddingTop: 10,
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
                TChecki
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

          {/* ── Greeting ── */}
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
        </View>

        {/* ── Spacer for the sticky search bar (rendered absolutely outside FlatList) ── */}
        <View style={{ height: searchSectionHeight }} />

        {/* ── Hero Card ── */}
        {(featuredBanner || featuredBusiness || isSectionsLoading) && (
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
                  backgroundColor: theme.card,
                }}
              >
                {isSectionsLoading ? (
                  <View style={{ flex: 1, backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                ) : heroImageSrc ? (
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
                    <MaterialCommunityIcons name="store" size={60} color={theme.textMuted} />
                  </View>
                )}

                {!isSectionsLoading && (
                  <>
                    {/* Bottom overlay — kept short so image stays visible */}
                    <View
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 85,
                        backgroundColor: theme.isDark ? 'rgba(15,23,42,0.88)' : 'rgba(15,23,42,0.70)',
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
                            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: theme.textMuted }} />
                            <AppText style={{ fontSize: 12, color: theme.textMuted }} numberOfLines={1}>
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
                  </>
                )}

                {/* Arrow button */}
                {!isSectionsLoading && (
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
                )}
              </View>
            </Pressable>
          </View>
        )}

        {/* ── Quick Stats ── */}
        {(homeStats || businesses.length > 0 || isSectionsLoading) && (
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 32 }}>
            {isSectionsLoading
              ? [colors.neonPurple, colors.ratingGold, colors.emerald].map((color, i) => (
                <View key={i} style={{ flex: 1, backgroundColor: theme.card, borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: `${color}28` }}>
                  <SkeletonBox width={22} height={22} borderRadius={11} isDark={theme.isDark} />
                  <SkeletonBox width={40} height={20} borderRadius={6} isDark={theme.isDark} style={{ marginTop: 8 }} />
                  <SkeletonBox width={55} height={10} borderRadius={5} isDark={theme.isDark} style={{ marginTop: 6 }} />
                </View>
              ))
              : [
                { label: t('home.statsBusinesses'), value: homeStats?.totalBusinesses ?? businesses.length, icon: 'store-outline', color: colors.neonPurple },
                { label: t('home.statsReviews'), value: homeStats?.totalReviews ?? 0, icon: 'star-outline', color: colors.ratingGold },
                { label: t('home.statsCategories'), value: categories.length, icon: 'shape-outline', color: colors.emerald },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={{
                    flex: 1,
                    backgroundColor: theme.card,
                    borderRadius: 16,
                    padding: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: `${stat.color}28`,
                  }}
                >
                  <MaterialCommunityIcons name={stat.icon as never} size={22} color={stat.color} />
                  <AnimatedCounter
                    value={stat.value}
                    style={{ fontSize: 20, fontWeight: '800', color: theme.text, marginTop: 6 }}
                  />
                  <AppText style={{ fontSize: 11, color: theme.textSecondary, marginTop: 2, textAlign: 'center' }}>
                    {stat.label}
                  </AppText>
                </View>
              ))
            }
          </View>
        )}

        {/* ── Explore Categories (horizontal scroll) ── */}
        {(categories.length > 0 || isSectionsLoading) && (
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
              {!isSectionsLoading && (
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
              )}
            </View>

            {/* ── Skeleton tiles while categories load ── */}
            {isSectionsLoading && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <View key={i} style={{ width: categoryTileWidth, alignItems: 'center', gap: 8 }}>
                      <SkeletonBox width={categoryTileWidth} height={80} borderRadius={18} isDark={theme.isDark} />
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* ── 2-row horizontal scroll: both rows scroll together ── */}
            {!isSectionsLoading && (() => {
              const row1 = categories.filter((_, i) => i % 2 === 0);
              const row2 = categories.filter((_, i) => i % 2 !== 0);
              const longerRow = Math.max(row1.length, row2.length);
              const totalWidth = longerRow * categoryTileWidth + (longerRow - 1) * 10;

              return (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                >
                  <View style={{ width: totalWidth }}>
                    {[row1, row2].map((row, rowIdx) => (
                      <View
                        key={`cat_row_${rowIdx}`}
                        style={{ flexDirection: 'row', marginBottom: rowIdx === 0 ? 10 : 0 }}
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
                                backgroundColor: pressed ? `${accent}18` : theme.card,
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
                      </View>
                    ))}
                  </View>
                </ScrollView>
              );
            })()}
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} width={150} height={130} borderRadius={20} isDark={theme.isDark} />
              ))}
            </ScrollView>
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
                      : null;

                return (
                  <View style={{ position: 'relative' }}>
                    <Pressable
                      onPress={() => handleBusinessPress(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
                    >
                      <View
                        style={{
                          width: 150, height: 130, borderRadius: 20,
                          overflow: 'hidden', backgroundColor: theme.card,
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
                            <MaterialCommunityIcons name="store" size={40} color={theme.textMuted} />
                          </View>
                        )}

                        {/* Dark overlay at bottom */}
                        <View
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
                            backgroundColor: theme.isDark ? 'rgba(15,23,42,0.82)' : 'rgba(15,23,42,0.62)',
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
                            <AppText style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
                              ({item.reviewCount})
                            </AppText>
                          </View>
                        </View>

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

                    {/* Wishlist heart — sibling of card Pressable to avoid nested buttons on web */}
                    <Pressable
                      onPress={() => toggleWishlist(item)}
                      accessibilityLabel="Toggle wishlist"
                      accessibilityRole="button"
                      style={{
                        position: 'absolute', top: 8, right: 8,
                        width: 30, height: 30, borderRadius: 15,
                        backgroundColor: theme.isDark ? 'rgba(15,23,42,0.65)' : 'rgba(255,255,255,0.85)',
                        alignItems: 'center', justifyContent: 'center',
                        zIndex: 1,
                      }}
                    >
                      <MaterialCommunityIcons
                        name={isWishlisted(item.id) ? 'heart' : 'heart-outline'}
                        size={15}
                        color={isWishlisted(item.id) ? colors.pink : (theme.isDark ? colors.white : colors.textSlate600)}
                      />
                    </Pressable>
                  </View>
                );
              }}
            />
          ) : null}
        </View>

        {/* ── Top Rated ── */}
        {(topRated.length > 0 || isSectionsLoading) && (
          <View style={{ marginBottom: 32 }}>
            <View
              style={{
                flexDirection: 'row', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 16,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="trophy-outline" size={18} color={colors.ratingGold} />
                <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                  {t('home.topRated')}
                </AppText>
              </View>
              <Pressable
                onPress={() => router.push('/(main)/(feed)/all-businesses')}
                accessibilityLabel="See all top rated"
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="arrow-right" size={22} color={colors.neonPurple} />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {isSectionsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonBox key={i} width={200} height={145} borderRadius={20} isDark={theme.isDark} />
                ))
                : topRated.map((item, idx) => {
                const remote = categoryDefaults[item.categoryId];
                const imgSrc = item.coverImageUrl
                  ? { uri: item.coverImageUrl }
                  : item.logoUrl
                    ? { uri: item.logoUrl }
                    : remote?.profileImageUrl
                      ? { uri: remote.profileImageUrl }
                      : null;
                const isLast = idx === topRated.length - 1;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => handleBusinessPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    style={({ pressed }) => ({
                      marginRight: isLast ? 0 : 12,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <View
                      style={{
                        width: 200, height: 145, borderRadius: 20,
                        overflow: 'hidden', backgroundColor: theme.card,
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
                          <MaterialCommunityIcons name="store" size={40} color={theme.textMuted} />
                        </View>
                      )}
                      {/* Bottom overlay */}
                      <View
                        style={{
                          position: 'absolute', bottom: 0, left: 0, right: 0, height: 62,
                          backgroundColor: theme.isDark ? 'rgba(15,23,42,0.88)' : 'rgba(15,23,42,0.65)',
                          paddingHorizontal: 12, paddingBottom: 10,
                          justifyContent: 'flex-end',
                        }}
                      >
                        <AppText
                          style={{ fontSize: 14, fontWeight: '700', color: colors.white }}
                          numberOfLines={1}
                        >
                          {item.name}
                        </AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 }}>
                          <MaterialCommunityIcons name="star" size={12} color={colors.ratingGold} />
                          <AppText style={{ fontSize: 12, color: colors.ratingGold, fontWeight: '700' }}>
                            {item.rating?.toFixed(1) ?? '—'}
                          </AppText>
                          <AppText style={{ fontSize: 11, color: colors.textSlate400 }}>
                            ({item.reviewCount})
                          </AppText>
                        </View>
                      </View>
                      {/* Rank badge */}
                      <View
                        style={{
                          position: 'absolute', top: 10, left: 10,
                          width: 28, height: 28, borderRadius: 14,
                          backgroundColor: colors.ratingGold,
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <AppText style={{ fontSize: 12, fontWeight: '800', color: '#1a1a1a' }}>
                          {idx + 1}
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
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Recent Reviews ── */}
        {(recentReviews.length > 0 || isSectionsLoading) && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MaterialCommunityIcons name="message-star-outline" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                {t('home.recentReviews')}
              </AppText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {isSectionsLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                  <SkeletonBox key={i} width={260} height={130} borderRadius={18} isDark={theme.isDark} />
                ))
                : recentReviews.map((review, idx) => (
                <Pressable
                  key={review.id}
                  onPress={() => router.push(`/(main)/(feed)/business/${review.businessId}`)}
                  accessibilityRole="button"
                  accessibilityLabel={`Review by ${review.authorName}`}
                  style={({ pressed }) => ({
                    marginRight: idx === recentReviews.length - 1 ? 0 : 12,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 260, backgroundColor: theme.card,
                      borderRadius: 18, padding: 16,
                      borderWidth: 1, borderColor: `${colors.neonPurple}18`,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <View
                        style={{
                          width: 36, height: 36, borderRadius: 18,
                          backgroundColor: `${colors.neonPurple}22`,
                          alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {review.authorAvatarUrl ? (
                          <Image
                            source={{ uri: review.authorAvatarUrl }}
                            style={{ width: 36, height: 36 }}
                          />
                        ) : (
                          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
                            {review.authorName.charAt(0).toUpperCase()}
                          </AppText>
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText style={{ fontSize: 13, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                          {review.authorName}
                        </AppText>
                        <AppText style={{ fontSize: 11, color: theme.textSecondary }} numberOfLines={1}>
                          {review.businessName}
                        </AppText>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 2, marginBottom: 8 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialCommunityIcons
                          key={i}
                          name={i < review.rating ? 'star' : 'star-outline'}
                          size={14}
                          color={i < review.rating ? colors.ratingGold : theme.textMuted}
                        />
                      ))}
                    </View>
                    <AppText
                      style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 18 }}
                      numberOfLines={3}
                    >
                      {review.text}
                    </AppText>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Recently Viewed ── */}
        {recentSearches.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MaterialCommunityIcons name="history" size={18} color={colors.cyan} />
              <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                {t('home.recentlyViewed')}
              </AppText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {recentSearches.map((item, idx) => {
                const remote = categoryDefaults[item.categoryId];
                const imgSrc = item.coverImageUrl
                  ? { uri: item.coverImageUrl }
                  : item.logoUrl
                    ? { uri: item.logoUrl }
                    : remote?.profileImageUrl
                      ? { uri: remote.profileImageUrl }
                      : null;
                return (
                  <Pressable
                    key={`rv_${item.id}`}
                    onPress={() => handleBusinessPress(item)}
                    accessibilityRole="button"
                    accessibilityLabel={item.name}
                    style={({ pressed }) => ({
                      marginRight: idx === recentSearches.length - 1 ? 0 : 12,
                      opacity: pressed ? 0.88 : 1,
                    })}
                  >
                    <View style={{ width: 120, alignItems: 'center' }}>
                      <View
                        style={{
                          width: 70, height: 70, borderRadius: 35,
                          overflow: 'hidden', backgroundColor: theme.card,
                          borderWidth: 2, borderColor: `${colors.cyan}44`,
                          marginBottom: 8,
                        }}
                      >
                        {imgSrc ? (
                          <Image source={imgSrc} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="store" size={28} color={theme.textMuted} />
                          </View>
                        )}
                      </View>
                      <AppText
                        style={{ fontSize: 12, fontWeight: '600', color: theme.text, textAlign: 'center' }}
                        numberOfLines={2}
                      >
                        {item.name}
                      </AppText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
                        <MaterialCommunityIcons name="star" size={11} color={colors.ratingGold} />
                        <AppText style={{ fontSize: 11, color: colors.ratingGold, fontWeight: '700' }}>
                          {item.rating?.toFixed(1) ?? '—'}
                        </AppText>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── Near You ── */}
        {(() => {
          if (nearbyBusinesses.length === 0) return null;
          // Use actual user location if available, otherwise Tunisia center as fallback
          const refLat = userLocation?.latitude ?? 36.8;
          const refLng = userLocation?.longitude ?? 10.18;
          // Sort nearby businesses by distance from user
          const withDistance = nearbyBusinesses
            .filter((b) => b.latitude != null && b.longitude != null)
            .map((b) => ({
              business: b,
              distance: haversineDistanceKm(
                refLat,
                refLng,
                b.latitude!,
                b.longitude!,
              ),
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 8);
          if (withDistance.length === 0) return null;

          const formatDistance = (km: number) =>
            km < 1 ? `${Math.round(km * 1000)}m` : `${km.toFixed(1)}km`;

          return (
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="map-marker-radius" size={18} color={colors.pink} />
                  <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                    {t('home.nearYou')}
                  </AppText>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {withDistance.map(({ business: item, distance }, idx) => {
                  const remote = categoryDefaults[item.categoryId];
                  const imgSrc = item.coverImageUrl
                    ? { uri: item.coverImageUrl }
                    : item.logoUrl
                      ? { uri: item.logoUrl }
                      : remote?.profileImageUrl
                        ? { uri: remote.profileImageUrl }
                        : null;
                  return (
                    <Pressable
                      key={`near_${item.id}`}
                      onPress={() => handleBusinessPress(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      style={({ pressed }) => ({
                        marginRight: idx === withDistance.length - 1 ? 0 : 12,
                        opacity: pressed ? 0.88 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 160, height: 130, borderRadius: 20,
                          overflow: 'hidden', backgroundColor: theme.card,
                        }}
                      >
                        {imgSrc ? (
                          <Image source={imgSrc} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="store" size={40} color={theme.textMuted} />
                          </View>
                        )}
                        <View
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 55,
                            backgroundColor: theme.isDark ? 'rgba(15,23,42,0.85)' : 'rgba(15,23,42,0.65)',
                            paddingHorizontal: 10, paddingBottom: 8, justifyContent: 'flex-end',
                          }}
                        >
                          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }} numberOfLines={1}>
                            {item.name}
                          </AppText>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <MaterialCommunityIcons name="map-marker" size={11} color={colors.pink} />
                            <AppText style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }} numberOfLines={1}>
                              {formatDistance(distance)}
                            </AppText>
                          </View>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })()}

        {/* ── Popular in [Category] ── */}
        {(() => {
          if (!mostViewedCategoryId || popularCategoryBusinesses.length === 0) return null;
          const cat = categories.find((c) => c.id === mostViewedCategoryId);
          if (!cat) return null;
          const popular = popularCategoryBusinesses;
          return (
            <View style={{ marginBottom: 32 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="fire" size={18} color={colors.orange} />
                  <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                    {t('home.popularInCategory', { category: cat.name })}
                  </AppText>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {popular.map((item, idx) => {
                  const remote = categoryDefaults[item.categoryId];
                  const imgSrc = item.coverImageUrl
                    ? { uri: item.coverImageUrl }
                    : item.logoUrl
                      ? { uri: item.logoUrl }
                      : remote?.profileImageUrl
                        ? { uri: remote.profileImageUrl }
                        : null;
                  return (
                    <Pressable
                      key={`pop_${item.id}`}
                      onPress={() => handleBusinessPress(item)}
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      style={({ pressed }) => ({
                        marginRight: idx === popular.length - 1 ? 0 : 12,
                        opacity: pressed ? 0.88 : 1,
                      })}
                    >
                      <View
                        style={{
                          width: 150, height: 130, borderRadius: 20,
                          overflow: 'hidden', backgroundColor: theme.card,
                        }}
                      >
                        {imgSrc ? (
                          <Image source={imgSrc} style={{ position: 'absolute', width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <MaterialCommunityIcons name="store" size={40} color={theme.textMuted} />
                          </View>
                        )}
                        <View
                          style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 52,
                            backgroundColor: theme.isDark ? 'rgba(15,23,42,0.82)' : 'rgba(15,23,42,0.62)',
                            paddingHorizontal: 10, paddingBottom: 10, justifyContent: 'flex-end',
                          }}
                        >
                          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }} numberOfLines={1}>
                            {item.name}
                          </AppText>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 3 }}>
                            <MaterialCommunityIcons name="star" size={11} color={colors.ratingGold} />
                            <AppText style={{ fontSize: 11, color: colors.ratingGold, fontWeight: '700' }}>
                              {item.rating?.toFixed(1) ?? '—'}
                            </AppText>
                          </View>
                        </View>
                        <View
                          style={{
                            position: 'absolute', top: 8, left: 8,
                            backgroundColor: colors.orange, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 10,
                          }}
                        >
                          <MaterialCommunityIcons name="fire" size={12} color={colors.white} />
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          );
        })()}

        {/* ── Deals & Promotions ── */}
        {deals.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <MaterialCommunityIcons name="tag-heart" size={18} color={colors.pink} />
              <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                {t('home.dealsAndPromotions')}
              </AppText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {deals.map((deal, idx) => (
                <Pressable
                  key={deal.id}
                  onPress={() => router.push(`/(main)/(feed)/business/${deal.businessId}`)}
                  accessibilityRole="button"
                  accessibilityLabel={deal.title}
                  style={({ pressed }) => ({
                    marginRight: idx === deals.length - 1 ? 0 : 12,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 220, height: 150, borderRadius: 20,
                      overflow: 'hidden', backgroundColor: theme.card,
                    }}
                  >
                    {deal.businessCoverUrl ? (
                      <Image
                        source={{ uri: deal.businessCoverUrl }}
                        style={{ position: 'absolute', width: '100%', height: '100%' }}
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        style={{
                          position: 'absolute', width: '100%', height: '100%',
                          backgroundColor: `${colors.pink}22`,
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <MaterialCommunityIcons name="tag-heart" size={40} color={colors.pink} />
                      </View>
                    )}
                    <View
                      style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
                        backgroundColor: theme.isDark ? 'rgba(15,23,42,0.88)' : 'rgba(15,23,42,0.68)',
                        paddingHorizontal: 12, paddingBottom: 10, justifyContent: 'flex-end',
                      }}
                    >
                      <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }} numberOfLines={1}>
                        {deal.businessName}
                      </AppText>
                      <AppText style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 2 }} numberOfLines={1}>
                        {deal.dealCount > 1 ? t('home.dealItems', { count: deal.dealCount }) : deal.title}
                      </AppText>
                    </View>
                    {deal.maxDiscountPercent > 0 && (
                      <View
                        style={{
                          position: 'absolute', top: 10, right: 10,
                          backgroundColor: colors.pink, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
                        }}
                      >
                        <AppText style={{ fontSize: 11, fontWeight: '800', color: colors.white }}>
                          {t('home.upToOff', { percent: deal.maxDiscountPercent })}
                        </AppText>
                      </View>
                    )}
                    <View
                      style={{
                        position: 'absolute', top: 10, left: 10,
                        backgroundColor: colors.emerald, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                      }}
                    >
                      <AppText style={{ fontSize: 9, fontWeight: '800', color: colors.white, letterSpacing: 0.8 }}>
                        {t('home.dealBadge')}
                      </AppText>
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Weekly Picks ── */}
        {weeklyPicks.length > 0 && (
          <View style={{ marginBottom: 32 }}>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="crown-outline" size={18} color={colors.ratingGold} />
                <AppText style={{ fontSize: 20, fontWeight: '800', color: theme.text, letterSpacing: -0.3 }}>
                  {t('home.weeklyPicks')}
                </AppText>
              </View>
              <AppText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2, marginLeft: 26 }}>
                {t('home.weeklyPicksSubtitle')}
              </AppText>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {weeklyPicks.map((pick, idx) => (
                <Pressable
                  key={pick.id}
                  onPress={() => router.push(`/(main)/(feed)/business/${pick.businessId}`)}
                  accessibilityRole="button"
                  accessibilityLabel={pick.businessName}
                  style={({ pressed }) => ({
                    marginRight: idx === weeklyPicks.length - 1 ? 0 : 12,
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <View
                    style={{
                      width: 200, borderRadius: 20,
                      overflow: 'hidden', backgroundColor: theme.card,
                      borderWidth: 1, borderColor: `${colors.ratingGold}30`,
                    }}
                  >
                    <View style={{ height: 110, overflow: 'hidden' }}>
                      {pick.businessCoverUrl ? (
                        <Image
                          source={{ uri: pick.businessCoverUrl }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: '100%', height: '100%',
                            backgroundColor: `${colors.ratingGold}15`,
                            alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <MaterialCommunityIcons name="crown-outline" size={36} color={colors.ratingGold} />
                        </View>
                      )}
                      <View
                        style={{
                          position: 'absolute', top: 8, left: 8,
                          backgroundColor: colors.ratingGold, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
                        }}
                      >
                        <AppText style={{ fontSize: 9, fontWeight: '800', color: '#1a1a1a', letterSpacing: 0.8 }}>
                          {t('home.pickBadge')}
                        </AppText>
                      </View>
                    </View>
                    <View style={{ padding: 12 }}>
                      <AppText style={{ fontSize: 14, fontWeight: '700', color: theme.text }} numberOfLines={1}>
                        {pick.businessName}
                      </AppText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                        <MaterialCommunityIcons name="star" size={12} color={colors.ratingGold} />
                        <AppText style={{ fontSize: 12, color: colors.ratingGold, fontWeight: '700' }}>
                          {pick.businessRating?.toFixed(1) ?? '—'}
                        </AppText>
                        <AppText style={{ fontSize: 11, color: theme.textSecondary }}>
                          ({pick.businessReviewCount})
                        </AppText>
                        <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: theme.textMuted }} />
                        <AppText style={{ fontSize: 11, color: theme.textSecondary }} numberOfLines={1}>
                          {pick.categoryName}
                        </AppText>
                      </View>
                      {pick.pickReason ? (
                        <AppText style={{ fontSize: 11, color: theme.textMuted, marginTop: 6, fontStyle: 'italic' }} numberOfLines={2}>
                          "{pick.pickReason}"
                        </AppText>
                      ) : null}
                    </View>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Add Business CTA ── */}
        <Pressable
          onPress={() => router.push('/(main)/(feed)/add-business')}
          accessibilityRole="button"
          accessibilityLabel={t('home.addBusinessCtaTitle')}
          style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
        >
          <View
            style={{
              backgroundColor: theme.card,
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
            <MaterialCommunityIcons name="chevron-right" size={22} color={theme.textMuted} />
          </View>
        </Pressable>

      </View>
    );
  }, [
    t, theme, categories, banners, newBusinesses, businesses, nearbyBusinesses, topRatedBusinesses, popularCategoryBusinesses, recentReviews, recentSearches,
    deals, weeklyPicks, userLocation, mostViewedCategoryId, homeStats,
    isNewBusinessesLoading, isSectionsLoading, handleBannerPress, handleBusinessPress,
    toggleWishlist, isWishlisted, router, categoryDefaults, categoryTileWidth,
    user, handleAvatarPress, searchSectionHeight,
  ]);

  // Minimal header shown when searching (spacer ensures content is below the sticky search bar)
  const searchResultsHeader = useMemo(() => (
    <View>
      <View style={{ height: searchSectionHeight }} />
      <View style={{ paddingTop: 16, paddingBottom: 12 }}>
        <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
          {t('home.searchResultsSection')}
        </AppText>
      </View>
    </View>
  ), [t, theme, searchSectionHeight]);

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
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);
  const [activeLocationFilter, setActiveLocationFilter] = useState<LocationFilter>({ governorates: [], municipalities: [] });

  const isSearching = searchQuery.trim().length > 0;
  const isFilterActive = activeFilters.categories.length > 0 || activeFilters.minRating > 0;
  const isSortActive = activeSort !== null;
  const isLocationActive = activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0;

  // When searching, search bar stays at top (offset=0); when browsing, it follows scroll
  const stickyOffset = isSearching ? 0 : preSearchHeight;
  const searchBarTranslateY = scrollY.interpolate({
    inputRange: [0, Math.max(stickyOffset, 1)],
    outputRange: [stickyOffset, 0],
    extrapolate: 'clamp',
  });

  const handleListScroll = useMemo(
    () => Animated.event(
      [{ nativeEvent: { contentOffset: { y: scrollY } } }],
      { useNativeDriver: false },
    ),
    [scrollY],
  );

  const availableCategories = useMemo(
    () => categories.map((c) => ({ id: c.id, name: c.name })),
    [categories],
  );

  const filteredAndSorted = useMemo(() => {
    if (!isSearching) return businesses;
    let data = [...businesses];
    if (activeLocationFilter.municipalities.length > 0) {
      data = data.filter((b) => {
        const loc = b.location?.toLowerCase() ?? '';
        return activeLocationFilter.municipalities.some((mun) => loc.includes(mun.toLowerCase()));
      });
    } else if (activeLocationFilter.governorates.length > 0) {
      data = data.filter((b) => {
        const loc = b.location?.toLowerCase() ?? '';
        return activeLocationFilter.governorates.some((gov) => {
          if (loc.includes(gov.toLowerCase())) return true;
          return getMunicipalitiesForGovernorate(gov).some((m) => loc.includes(m.toLowerCase()));
        });
      });
    }
    if (activeFilters.categories.length > 0) {
      data = data.filter((b) => activeFilters.categories.includes(b.categoryId));
    }
    if (activeFilters.platforms.length > 0) {
      data = data.filter((b) =>
        activeFilters.platforms.some((p) => b.platforms?.includes(p)),
      );
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
  }, [isSearching, businesses, activeFilters, activeLocationFilter, activeSort]);

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

  const showSuggestions = isFocused && suggestionItems.length > 0;
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
         * Sticky search bar — absolutely positioned, moves with scroll via Animated translateY.
         * Starts at its natural position (below logo+greeting), sticks at top when scrolled past.
         */}
        <Animated.View
          onLayout={(e) => setSearchSectionHeight(e.nativeEvent.layout.height)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            zIndex: 10, elevation: 10,
            transform: [{ translateY: searchBarTranslateY }],
            paddingHorizontal: 16,
            paddingTop: 10,
            paddingBottom: 14,
            backgroundColor: theme.background,
          }}
        >
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
                    borderColor: isSortActive ? colors.neonPurple : theme.border,
                    backgroundColor: isSortActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? (theme.isDark ? 'rgba(51,65,85,0.6)' : theme.border) : theme.card,
                  })}
                >
                  <MaterialCommunityIcons
                    name="swap-vertical" size={15}
                    color={isSortActive ? colors.neonPurple : theme.textSecondary}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isSortActive ? '600' : '500', color: isSortActive ? colors.neonPurple : theme.textSecondary }}>
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
                    borderColor: isFilterActive ? colors.neonPurple : theme.border,
                    backgroundColor: isFilterActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? (theme.isDark ? 'rgba(51,65,85,0.6)' : theme.border) : theme.card,
                  })}
                >
                  <MaterialCommunityIcons
                    name="tune-variant" size={15}
                    color={isFilterActive ? colors.neonPurple : theme.textSecondary}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isFilterActive ? '600' : '500', color: isFilterActive ? colors.neonPurple : theme.textSecondary }}>
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
                    borderColor: isLocationActive ? colors.neonPurple : theme.border,
                    backgroundColor: isLocationActive
                      ? 'rgba(168,85,247,0.18)'
                      : pressed ? (theme.isDark ? 'rgba(51,65,85,0.6)' : theme.border) : theme.card,
                  })}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline" size={15}
                    color={isLocationActive ? colors.neonPurple : theme.textSecondary}
                  />
                  <AppText style={{ fontSize: 13, fontWeight: isLocationActive ? '600' : '500', color: isLocationActive ? colors.neonPurple : theme.textSecondary }}>
                    {t('home.location')}
                  </AppText>
                  {isLocationActive && (
                    <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.neonPurple, marginLeft: 2 }} />
                  )}
                </Pressable>
              </ScrollView>

              <LocationFilterSheet
                visible={showLocation}
                initialFilter={activeLocationFilter}
                onApply={(filter) => {
                  setActiveLocationFilter(filter);
                  setShowLocation(false);
                }}
              />
            </>
          )}

          {/* ── Suggestions dropdown (inside sticky container so it follows) ── */}
          {showSuggestions && (
            <View style={{ marginTop: 4 }}>
              <SearchSuggestions
                items={suggestionItems}
                sectionTitle={suggestionsTitle}
                onSelect={handleSuggestionSelect}
              />
            </View>
          )}
        </Animated.View>

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
          onScroll={handleListScroll}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={isNewBusinessesLoading}
              onRefresh={refresh}
              tintColor={colors.neonPurple}
              colors={[colors.neonPurple]}
            />
          }
        />
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
