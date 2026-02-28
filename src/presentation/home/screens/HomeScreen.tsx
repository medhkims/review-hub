import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { SearchBar } from '../components/SearchBar';
import { CategoryChip } from '../components/CategoryChip';
import { BusinessCard } from '../components/BusinessCard';
import { useHome } from '../hooks/useHome';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
import { colors } from '@/core/theme/colors';

export default function HomeScreen() {
  useAnalyticsScreen(AnalyticsScreens.HOME);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    businesses,
    newBusinesses,
    recentSearches,
    categories,
    searchQuery,
    isLoading,
    isNewBusinessesLoading,
    error,
    isWishlisted,
    search,
    toggleFavorite,
    toggleWishlist,
    refresh,
  } = useHome();

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

  const handleBusinessPress = useCallback((businessId: string) => {
    router.push(`/(main)/(feed)/business/${businessId}`);
  }, [router]);

  const renderBusinessCard = useCallback(({ item }: { item: BusinessEntity }) => (
    <BusinessCard
      business={item}
      onPress={() => handleBusinessPress(item.id)}
      onFavoritePress={() => toggleFavorite(item.id)}
      onWishlistPress={() => toggleWishlist(item)}
      isWishlisted={isWishlisted(item.id)}
    />
  ), [handleBusinessPress, toggleFavorite, toggleWishlist, isWishlisted]);

  const renderCompactCard = useCallback(({ item }: { item: BusinessEntity }) => (
    <Pressable
      onPress={() => handleBusinessPress(item.id)}
      accessibilityLabel={item.name}
      accessibilityRole="button"
      style={{
        width: 160,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: colors.cardBackground ?? '#1e1e2e',
        overflow: 'hidden',
      }}
    >
      {item.coverImageUrl ? (
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        <View
          style={{
            width: '100%',
            height: 90,
            backgroundColor: colors.surface ?? '#2a2a3e',
          }}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: 90,
            backgroundColor: colors.surface ?? '#2a2a3e',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 28 }}>🔍</AppText>
        </View>
      )}
      <View style={{ padding: 8 }}>
        <AppText
          numberOfLines={1}
          style={{ color: colors.white, fontSize: 13, fontWeight: '600' }}
        >
          {item.name}
        </AppText>
        <AppText
          numberOfLines={1}
          style={{ color: colors.textSlate400, fontSize: 11, marginTop: 2 }}
        >
          {item.categoryName}
        </AppText>
      </View>
    </Pressable>
  ), [handleBusinessPress]);

  const renderRecentSearchCard = renderCompactCard;

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  const ListHeader = useCallback(() => (
    <View>
      {/* Header */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}
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

      {/* Search */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={search}
          placeholder={t('home.searchPlaceholder')}
        />
      </View>

      {/* Categories Header */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 }}
      >
        <AppText
          style={{ fontSize: 20, fontWeight: '700', color: colors.white }}
        >
          {t('home.categoriesSection')}
        </AppText>
        <Pressable
          onPress={() => router.push('/(main)/(feed)/categories')}
          accessibilityLabel="See all categories"
          accessibilityRole="button"
        >
          <AppText
            style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}
          >
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>

      {/* Categories Scroll */}
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 8 }}
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

      {/* New Added Businesses Section */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
      >
        <AppText
          style={{ fontSize: 20, fontWeight: '700', color: colors.white }}
        >
          {t('home.newAddedSection')}
        </AppText>
        <Pressable
          onPress={() => router.push('/(main)/(feed)/all-businesses')}
          accessibilityLabel="See all new businesses"
          accessibilityRole="button"
        >
          <AppText
            style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}
          >
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>

      {isNewBusinessesLoading ? (
        <View style={{ paddingVertical: 20, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={colors.neonPurple} />
        </View>
      ) : (
        <FlatList
          data={newBusinesses}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
          keyExtractor={(item) => item.id}
          renderItem={renderCompactCard}
        />
      )}

      {/* Last Searches Section */}
      {recentSearches.length > 0 && (
        <>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}
          >
            <AppText
              style={{ fontSize: 20, fontWeight: '700', color: colors.white }}
            >
              {t('home.lastSearchesSection')}
            </AppText>
          </View>
          <FlatList
            data={recentSearches}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
            keyExtractor={(item) => `recent_${item.id}`}
            renderItem={renderRecentSearchCard}
          />
        </>
      )}

      {/* Businesses Section Header */}
      <View
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}
      >
        <AppText
          style={{ fontSize: 20, fontWeight: '700', color: colors.white }}
        >
          {t('home.businessesSection')}
        </AppText>
        <Pressable
          onPress={() => router.push('/(main)/(feed)/all-businesses')}
          accessibilityLabel="See all businesses"
          accessibilityRole="button"
        >
          <AppText
            style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}
          >
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>
    </View>
  ), [t, user, searchQuery, search, categories, handleAvatarPress, router, newBusinesses, isNewBusinessesLoading, recentSearches, renderCompactCard]);

  const ListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={{ paddingVertical: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      );
    }
    return (
      <View style={{ paddingVertical: 40, alignItems: 'center' }}>
        <AppText
          style={{ color: colors.textSlate500, fontSize: 16 }}
        >
          {error || t('home.noResults')}
        </AppText>
      </View>
    );
  }, [isLoading, error, t]);

  return (
    <ScreenLayout>
      <FlatList
        data={businesses}
        renderItem={renderBusinessCard}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading && businesses.length > 0}
            onRefresh={refresh}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
      />
    </ScreenLayout>
  );
}
