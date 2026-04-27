import React, { useCallback, useMemo, useState } from 'react';
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
import { SubcategoryPickerModal } from '@/presentation/shared/components/ui/SubcategoryPickerModal';
import { FilterBySheet, FilterState, DEFAULT_FILTER_STATE } from '@/presentation/shared/components/FilterBySheet';
import { SortBySheet, SortOption } from '@/presentation/shared/components/SortBySheet';
import { LocationFilterSheet, LocationFilter } from '@/presentation/shared/components/LocationFilterSheet';
import { getMunicipalitiesForGovernorate } from '@/core/constants/tunisiaLocations';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { useHomeStore } from '../store/homeStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';
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

const SubCategoryTab: React.FC<SubCategoryTabProps> = ({ label, isSelected, onPress }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 18,
        paddingVertical: 9,
        borderRadius: 20,
        backgroundColor: isSelected ? colors.neonPurple : theme.card,
        borderWidth: 1,
        borderColor: isSelected ? colors.neonPurple : theme.border,
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
          color: isSelected ? colors.white : theme.textSecondary,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SubCategoryBrowserScreen() {
  useAnalyticsScreen(AnalyticsScreens.SUB_CATEGORY_BROWSER);
  const { t } = useTranslation();
  const theme = useTheme();
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
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [showSubCategoryPicker, setShowSubCategoryPicker] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showLocation, setShowLocation] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [activeSort, setActiveSort] = useState<SortOption | null>(null);
  const [activeLocationFilter, setActiveLocationFilter] = useState<LocationFilter>({ governorates: [], municipalities: [] });

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

  // Show subcategories from the store (active ones with businesses).
  // If the store has none, extract unique subcategory values directly from
  // the loaded businesses so the filter still works.
  const subCategories = useMemo(() => {
    const storeCat = storeCategories.find((c) => c.id === resolvedCategoryId);
    const storeSubs = storeCat?.subcategories ?? [];
    if (storeSubs.length > 0) return storeSubs;

    // Derive from loaded businesses as fallback
    const seen = new Set<string>();
    const derived: { id: string; name: string; categoryId: string }[] = [];
    for (const b of businesses) {
      const subs = b.subCategories ?? (b.subCategory ? [b.subCategory] : []);
      for (const s of subs) {
        if (s && !seen.has(s)) {
          seen.add(s);
          derived.push({ id: s, name: s, categoryId: resolvedCategoryId });
        }
      }
    }
    return derived;
  }, [storeCategories, resolvedCategoryId, businesses]);

  // Build a list of selected subcategory names so we can match businesses
  // that store the subcategory name instead of the id in their sub_category field.
  const selectedSubNames = useMemo(() => {
    return selectedSubCategories.map((id) => {
      const sub = subCategories.find((s) => s.id === id);
      return sub?.name ?? id;
    });
  }, [selectedSubCategories, subCategories]);

  const filteredData = useMemo(() => {
    let data = businesses;
    if (selectedSubCategories.length > 0) {
      data = data.filter((b) =>
        selectedSubCategories.some(
          (subId) => b.subCategory === subId || b.subCategories?.includes(subId),
        ) ||
        selectedSubNames.some(
          (name) => b.subCategory === name || b.subCategories?.includes(name),
        ),
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter((b) => b.name.toLowerCase().includes(query));
    }
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
    if (activeFilters.platforms.length > 0) {
      data = data.filter((b) =>
        activeFilters.platforms.some((p) => b.platforms?.includes(p)),
      );
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
  }, [businesses, selectedSubCategories, selectedSubNames, searchQuery, activeFilters, activeLocationFilter, activeSort]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSubCategoryPickerConfirm = useCallback(
    (values: string[]) => {
      setSelectedSubCategories(values);
      setShowSubCategoryPicker(false);
      values.forEach((subId) => {
        const sub = subCategories.find((s) => s.id === subId);
        const subName = sub?.name ?? subId;
        businesses
          .filter((b) => b.subCategory === subId || b.subCategories?.includes(subId))
          .forEach((b) => trackSubcategoryEvent(b.id, subName, false));
      });
    },
    [businesses, subCategories],
  );


  const handleItemPress = useCallback(
    (id: string) => {
      if (selectedSubCategories.length > 0) {
        selectedSubCategories.forEach((subId) => {
          const sub = subCategories.find((s) => s.id === subId);
          trackSubcategoryEvent(id, sub?.name ?? subId, true);
        });
      }
      router.push({ pathname: '/(main)/(feed)/business/[businessId]', params: { businessId: id } });
    },
    [router, selectedSubCategories, subCategories],
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

  const selectedSubCategoryNames = selectedSubCategories
    .map((id) => subCategories.find((s) => s.id === id)?.name ?? id)
    .join(', ');

  const emptyMessage =
    selectedSubCategories.length > 0
      ? t('subCategory.emptySubCategory', {
          subCategory: selectedSubCategoryNames,
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
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : theme.isDark ? 'rgba(30,41,59,0.5)' : 'rgba(148,163,184,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
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
            marginLeft: 16,
            letterSpacing: -0.3,
          }}
        >
          {categoryDisplayName}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 10 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
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
            style={{ flex: 1, color: theme.text, fontSize: 15, padding: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={searchPlaceholder}
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={searchPlaceholder}
            accessibilityRole="search"
          />
        </View>
      </View>

      {/* Sort / Filter / Location row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, height: 44, marginBottom: 12 }}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, alignItems: 'center' }}
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
            borderColor: activeSort ? colors.neonPurple : colors.borderDark,
            backgroundColor: activeSort ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="swap-vertical"
            size={16}
            color={activeSort ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: activeSort ? '600' : '500',
              color: activeSort ? colors.neonPurple : theme.textSecondary,
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
            borderColor: (activeFilters.minRating > 0 || selectedSubCategories.length > 0) ? colors.neonPurple : colors.borderDark,
            backgroundColor: (activeFilters.minRating > 0 || selectedSubCategories.length > 0) ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="tune-variant"
            size={16}
            color={(activeFilters.minRating > 0 || selectedSubCategories.length > 0) ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: (activeFilters.minRating > 0 || selectedSubCategories.length > 0) ? '600' : '500',
              color: (activeFilters.minRating > 0 || selectedSubCategories.length > 0) ? colors.neonPurple : theme.textSecondary,
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
            borderColor: activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0 ? colors.neonPurple : colors.borderDark,
            backgroundColor: activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0 ? 'rgba(168,85,247,0.15)' : theme.card,
          }}
        >
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0 ? colors.neonPurple : theme.textSecondary}
          />
          <AppText
            style={{
              fontSize: 13,
              fontWeight: activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0 ? '600' : '500',
              color: activeLocationFilter.governorates.length > 0 || activeLocationFilter.municipalities.length > 0 ? colors.neonPurple : theme.textSecondary,
            }}
          >
            {t('home.location')}
          </AppText>
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

      {/* Sub-Category Tabs — shown whenever the category has defined subcategories */}
      {subCategories.length > 0 && (
        <>
          {/* See All row — sits between search bar and tabs */}
          <Pressable
            onPress={() => setShowSubCategoryPicker(true)}
            style={({ pressed }) => ({
              alignSelf: 'flex-end',
              paddingHorizontal: 24,
              paddingBottom: 8,
              opacity: pressed ? 0.7 : 1,
            })}
            accessibilityRole="button"
            accessibilityLabel={t('subCategory.seeAll')}
          >
            <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
              {t('subCategory.seeAll')}
            </AppText>
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 14, alignItems: 'center' }}
          >
            <SubCategoryTab
              label={t('subCategory.all')}
              isSelected={selectedSubCategories.length === 0}
              onPress={() => setSelectedSubCategories([])}
            />
            {subCategories.map((sub) => (
              <SubCategoryTab
                key={sub.id}
                label={sub.name}
                isSelected={selectedSubCategories.includes(sub.id)}
                onPress={() => setSelectedSubCategories([sub.id])}
              />
            ))}
          </ScrollView>
        </>
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
      <SubcategoryPickerModal
        visible={showSubCategoryPicker}
        title={t('subCategory.selectTitle')}
        options={subCategories.map((s) => ({ label: s.name, value: s.id }))}
        values={selectedSubCategories}
        minSelect={1}
        onClose={() => setShowSubCategoryPicker(false)}
        onConfirm={handleSubCategoryPickerConfirm}
      />
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
              color={theme.textMuted}
            />
            <AppText
              style={{
                color: theme.textSecondary,
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

      <FilterBySheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={(filters) => {
          setActiveFilters(filters);
          setSelectedSubCategories(filters.subcategories);
          setShowFilter(false);
        }}
        initialFilters={{ ...activeFilters, subcategories: selectedSubCategories }}
        showCategories={false}
        showSubcategories={subCategories.length > 0}
        availableSubcategories={subCategories.map((s) => ({ id: s.id, name: s.name }))}
        showPlatforms={resolvedCategoryId === 'influencer'}
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
