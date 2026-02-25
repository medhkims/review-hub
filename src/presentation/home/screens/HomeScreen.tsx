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
    categories,
    selectedCategoryId,
    searchQuery,
    isLoading,
    error,
    isWishlisted,
    selectCategory,
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

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  const ListHeader = useCallback(() => (
    <View>
      {/* Header */}
      <View
        className="flex-row justify-between items-start px-6 pt-2 pb-4"
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 24, paddingTop: 8, paddingBottom: 16 }}
      >
        <View style={{ flex: 1 }}>
          <AppText
            className="text-3xl font-bold text-white tracking-tight"
            style={{ fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 }}
          >
            {t('home.title')}
          </AppText>
          <AppText
            className="text-slate-400 mt-1 text-sm font-medium"
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
      <View className="px-6 pb-4" style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
        <SearchBar
          value={searchQuery}
          onChangeText={search}
          placeholder={t('home.searchPlaceholder')}
        />
      </View>

      {/* Categories Header */}
      <View
        className="flex-row justify-between items-center px-6 pb-2"
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 8 }}
      >
        <AppText
          className="text-xl font-bold text-white"
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
            className="text-neon-purple text-sm font-semibold"
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
            isSelected={selectedCategoryId === item.id}
            onPress={() => selectCategory(
              selectedCategoryId === item.id ? null : item.id
            )}
          />
        )}
      />

      {/* Featured Section Header */}
      <View
        className="flex-row justify-between items-center px-6 pt-4 pb-3"
        style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}
      >
        <AppText
          className="text-xl font-bold text-white"
          style={{ fontSize: 20, fontWeight: '700', color: colors.white }}
        >
          {selectedCategoryId ? t('home.businessesSection') : t('home.featuredSection')}
        </AppText>
        <Pressable accessibilityLabel="See all businesses" accessibilityRole="button">
          <AppText
            className="text-neon-purple text-sm font-semibold"
            style={{ color: colors.neonPurple, fontSize: 14, fontWeight: '600' }}
          >
            {t('home.seeAll')}
          </AppText>
        </Pressable>
      </View>
    </View>
  ), [t, user, searchQuery, search, categories, selectedCategoryId, selectCategory, handleAvatarPress]);

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
          className="text-slate-500 text-base"
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
