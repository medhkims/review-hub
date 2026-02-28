import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { ErrorView } from '@/presentation/shared/components/ui/ErrorView';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useHomeStore } from '../store/homeStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

// ── Helper ───────────────────────────────────────────────────────────────────

const getCategoryDisplayName = (categoryId: string): string => {
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

// ── Sub-Category Tab ──────────────────────────────────────────────────────────

interface SubCategoryTabProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const SubCategoryTab: React.FC<SubCategoryTabProps> = ({ label, isSelected, onPress }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      paddingHorizontal: 18,
      paddingVertical: 9,
      borderRadius: 20,
      backgroundColor: isSelected ? colors.neonPurple : colors.cardDark,
      borderWidth: 1,
      borderColor: isSelected ? colors.neonPurple : colors.borderDark,
      marginRight: 10,
      opacity: pressed ? 0.8 : 1,
    })}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <AppText
      style={{
        fontSize: 14,
        fontWeight: isSelected ? '600' : '400',
        color: isSelected ? colors.white : colors.textSlate400,
      }}
    >
      {label}
    </AppText>
  </Pressable>
);

// ── Business Card ─────────────────────────────────────────────────────────────

interface BusinessCardProps {
  item: BusinessEntity;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
}

const BusinessCard: React.FC<BusinessCardProps> = React.memo(
  ({ item, onPress, onFavorite }) => {
    const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
    const handleFavorite = useCallback(() => onFavorite(item.id), [item.id, onFavorite]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          marginBottom: 14,
          borderRadius: 16,
          backgroundColor: colors.cardDark,
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
              backgroundColor: colors.borderDark,
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
              <MaterialCommunityIcons name="store" size={32} color={colors.textSlate500} />
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
            <AppText
              style={{ fontSize: 10, fontWeight: '700', color: colors.white, marginLeft: 2 }}
            >
              {item.rating.toFixed(1)}
            </AppText>
          </View>
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <AppText
            style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 3 }}
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
              color={colors.textSlate400}
            />
            <AppText
              style={{ fontSize: 12, color: colors.textSlate400, marginLeft: 3 }}
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
            color={item.isFavorite ? colors.neonPurple : colors.textSlate400}
          />
        </Pressable>
      </Pressable>
    );
  },
);

BusinessCard.displayName = 'BusinessCard';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SubCategoryBrowserScreen() {
  useAnalyticsScreen(AnalyticsScreens.SUB_CATEGORY_BROWSER);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName?: string;
  }>();

  const { categories: storeCategories } = useHomeStore();

  const resolvedCategoryId = categoryId ?? 'restaurant';
  const categoryDisplayName = categoryName ?? getCategoryDisplayName(resolvedCategoryId);

  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    setError(null);
    const result = await container.getBusinessesByCategoryUseCase.execute(resolvedCategoryId);
    result.fold(
      (failure) => setError(failure.message),
      (data) => setBusinesses(data),
    );
    setIsLoading(false);
    setIsRefreshing(false);
  }, [resolvedCategoryId]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBusinesses();
  }, [loadBusinesses]);

  // Use subcategories from the category entity definition (not derived from business data)
  const subCategories = useMemo(() => {
    const cat = storeCategories.find((c) => c.id === resolvedCategoryId);
    return cat?.subcategories ?? [];
  }, [storeCategories, resolvedCategoryId]);

  const filteredData = useMemo(() => {
    let data = businesses;
    if (selectedSubCategory) {
      data = data.filter((b) => b.categoryName === selectedSubCategory);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((b) => b.name.toLowerCase().includes(query));
    }
    return data;
  }, [businesses, selectedSubCategory, searchQuery]);

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

  const searchPlaceholder = t('subCategory.searchBusinesses', {
    category: categoryDisplayName.toLowerCase(),
  });

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <BusinessCard item={item} onPress={handleItemPress} onFavorite={handleFavorite} />
    ),
    [handleItemPress, handleFavorite],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  const emptyMessage = selectedSubCategory
    ? t('subCategory.emptySubCategory', {
        subCategory: selectedSubCategory,
        category: categoryDisplayName,
      })
    : t('subCategory.emptyCategory', { category: categoryDisplayName });

  // ── Shared Header ──────────────────────────────────────────────────────────

  const renderHeader = () => (
    <>
      {/* Title Row */}
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
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'rgba(30,41,59,0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.white} />
        </Pressable>
        <AppText
          style={{
            fontSize: 20,
            fontWeight: '700',
            color: colors.white,
            flex: 1,
            marginLeft: 16,
            letterSpacing: -0.3,
          }}
        >
          {categoryDisplayName}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
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
              style={{ flex: 1, color: colors.textWhite, fontSize: 15, padding: 0 }}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textSlate500}
              accessibilityLabel={searchPlaceholder}
              accessibilityRole="search"
            />
          </View>

          {/* Sort Button */}
          <Pressable
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 10,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel={t('sortBy.title')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="sort-variant"
              size={20}
              color={colors.textSlate400}
            />
          </Pressable>

          {/* Filter Button */}
          <Pressable
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: colors.cardDark,
              borderWidth: 1,
              borderColor: colors.borderDark,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 8,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityLabel={t('filterBy.title')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="filter-variant"
              size={20}
              color={colors.textSlate400}
            />
          </Pressable>
        </View>
      </View>

      {/* Sub-Category Tabs — shown whenever the category has defined subcategories */}
      {subCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 14, alignItems: 'center' }}
        >
          <SubCategoryTab
            label={t('subCategory.all')}
            isSelected={selectedSubCategory === null}
            onPress={() => setSelectedSubCategory(null)}
          />
          {subCategories.map((sub) => (
            <SubCategoryTab
              key={sub.id}
              label={sub.name}
              isSelected={selectedSubCategory === sub.name}
              onPress={() => setSelectedSubCategory(sub.name)}
            />
          ))}
        </ScrollView>
      )}
    </>
  );

  // ── Loading / Error states ─────────────────────────────────────────────────

  if (isLoading && businesses.length === 0) {
    return (
      <ScreenLayout>
        {renderHeader()}
        <LoadingIndicator />
      </ScreenLayout>
    );
  }

  if (error && businesses.length === 0) {
    return (
      <ScreenLayout>
        {renderHeader()}
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ErrorView message={error} onRetry={loadBusinesses} />
        </View>
      </ScreenLayout>
    );
  }

  // ── Main Content ───────────────────────────────────────────────────────────

  return (
    <ScreenLayout>
      {renderHeader()}
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
              color={colors.textSlate500}
            />
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 16,
                fontWeight: '600',
                marginTop: 16,
                textAlign: 'center',
              }}
            >
              {emptyMessage}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
}
