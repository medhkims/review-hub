import React, { useCallback, useState } from 'react';
import { View, FlatList, Pressable, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
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

// ── Compact Row Card ─────────────────────────────────────────────────────────

interface BusinessRowProps {
  business: BusinessEntity;
  onPress: () => void;
  onWishlistPress: () => void;
  isWishlisted: boolean;
}

const BusinessRow = React.memo(({ business, onPress, onWishlistPress, isWishlisted }: BusinessRowProps) => (
  <Pressable
    onPress={onPress}
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.cardDark,
      borderRadius: 16,
      padding: 12,
      marginBottom: 10,
      gap: 14,
    }}
    accessibilityLabel={business.name}
    accessibilityRole="button"
  >
    {/* Thumbnail */}
    <View
      style={{
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: colors.borderDark,
      }}
    >
      {business.coverImageUrl ? (
        <Image
          source={{ uri: business.coverImageUrl }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityLabel={business.name}
        />
      ) : (
        <View style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <MaterialCommunityIcons name="store" size={28} color={colors.textSlate500} />
        </View>
      )}
    </View>

    {/* Info */}
    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
      <AppText
        style={{ fontSize: 15, fontWeight: '700', color: colors.textWhite }}
        numberOfLines={1}
      >
        {business.name}
      </AppText>

      {/* Rating row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <MaterialCommunityIcons name="star" size={14} color={colors.ratingGold} />
        <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textWhite }}>
          {business.rating.toFixed(1)}
        </AppText>
        <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
          ({business.reviewCount})
        </AppText>
      </View>

      {/* Location + Category */}
      <AppText
        style={{ fontSize: 12, color: colors.textSlate400 }}
        numberOfLines={1}
      >
        {business.location} {business.categoryName ? `• ${business.categoryName}` : ''}
      </AppText>
    </View>

    {/* Wishlist heart */}
    <Pressable
      onPress={onWishlistPress}
      hitSlop={8}
      accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      accessibilityRole="button"
    >
      <MaterialCommunityIcons
        name={isWishlisted ? 'heart' : 'heart-outline'}
        size={22}
        color={isWishlisted ? colors.red : colors.textSlate500}
      />
    </Pressable>
  </Pressable>
));

BusinessRow.displayName = 'BusinessRow';

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function AllBusinessesScreen() {
  useAnalyticsScreen(AnalyticsScreens.ALL_BUSINESSES);
  const { t } = useTranslation();
  const router = useRouter();

  const {
    businesses,
    searchQuery,
    isLoading,
    error,
    isWishlisted,
    search,
    toggleWishlist,
    refresh,
  } = useHome();

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
      <BusinessRow
        business={item}
        onPress={() => handleBusinessPress(item.id)}
        onWishlistPress={() => toggleWishlist(item)}
        isWishlisted={isWishlisted(item.id)}
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
          {t('home.allBusinesses')}
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
      </View>

      {/* Business List */}
      <FlatList
        data={businesses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !isLoading ? (
            <NoResultsView
              searchQuery={searchQuery}
              onAddNew={handleAddBusiness}
            />
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={isLoading && businesses.length > 0}
            onRefresh={refresh}
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
