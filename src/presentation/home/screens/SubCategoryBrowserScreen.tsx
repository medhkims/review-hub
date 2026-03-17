import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
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
import { CATEGORY_MAP } from '@/core/constants/categoriesData';
import { BusinessCard } from '../components/BusinessCard';
import { trackSubcategoryEvent } from '@/core/utils/premiumTracking';

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

  // Reload on focus so stale Firestore query-cache (e.g. after image uploads)
  // is bypassed and the latest business data is always shown.
  useFocusEffect(
    useCallback(() => {
      loadBusinesses();
    }, [loadBusinesses]),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBusinesses();
  }, [loadBusinesses]);

  // Use subcategories from the store when it has entries, otherwise fall back
  // to the bundled CATEGORY_MAP (store may filter them all out when no business
  // has a matching sub_category field yet).
  const subCategories = useMemo(() => {
    const storeCat = storeCategories.find((c) => c.id === resolvedCategoryId);
    if (storeCat && storeCat.subcategories.length > 0) return storeCat.subcategories;
    const fallback = CATEGORY_MAP[resolvedCategoryId];
    if (!fallback) return [];
    return fallback.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      categoryId: resolvedCategoryId,
    }));
  }, [storeCategories, resolvedCategoryId]);

  const filteredData = useMemo(() => {
    let data = businesses;
    if (selectedSubCategory) {
      data = data.filter(
        (b) =>
          b.subCategory === selectedSubCategory ||
          b.subCategories?.includes(selectedSubCategory),
      );
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

  const handleSubCategorySelect = useCallback(
    (subId: string | null) => {
      setSelectedSubCategory(subId);
      if (subId && businesses.length > 0) {
        const sub = subCategories.find((s) => s.id === subId);
        const subName = sub?.name ?? subId;
        businesses
          .filter((b) => b.subCategory === subId || b.subCategories?.includes(subId))
          .forEach((b) => trackSubcategoryEvent(b.id, subName, false));
      }
    },
    [businesses, subCategories],
  );

  const handleItemPress = useCallback(
    (id: string) => {
      if (selectedSubCategory) {
        const sub = subCategories.find((s) => s.id === selectedSubCategory);
        trackSubcategoryEvent(id, sub?.name ?? selectedSubCategory, true);
      }
      router.push({ pathname: '/(main)/(feed)/business/[businessId]', params: { businessId: id } });
    },
    [router, selectedSubCategory, subCategories],
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
      <BusinessCard
        business={item}
        onPress={() => handleItemPress(item.id)}
        onWishlistPress={() => handleFavorite(item.id)}
        isWishlisted={item.isFavorite}
        variant="compact"
      />
    ),
    [handleItemPress, handleFavorite],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

  const selectedSubCategoryName = selectedSubCategory
    ? (subCategories.find((s) => s.id === selectedSubCategory)?.name ?? selectedSubCategory)
    : null;

  const emptyMessage = selectedSubCategoryName
    ? t('subCategory.emptySubCategory', {
        subCategory: selectedSubCategoryName,
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
            onPress={() => handleSubCategorySelect(null)}
          />
          {subCategories.map((sub) => (
            <SubCategoryTab
              key={sub.id}
              label={sub.name}
              isSelected={selectedSubCategory === sub.id}
              onPress={() => handleSubCategorySelect(sub.id)}
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
