import React, { useCallback, useMemo, useState } from 'react';
import { View, FlatList, TextInput, ScrollView, Pressable, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

// ── Types ────────────────────────────────────────────────────────────────────

interface BusinessItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  type: string;
  imageUrl: string | null;
  isOpen: boolean;
}

interface ProfessionalItem {
  id: string;
  name: string;
  specialty: string;
  location: string;
  distance: string;
  rating: number;
  avatarUrl: string | null;
}

type SubCategoryItem = BusinessItem | ProfessionalItem;

// ── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESTAURANTS: BusinessItem[] = [
  { id: '1', name: 'Restaurant El Ali', location: 'Medina, Tunis', rating: 4.5, reviewCount: 535, type: 'Tunisian', imageUrl: null, isOpen: true },
  { id: '2', name: 'Le Golfe', location: 'La Marsa', rating: 4.3, reviewCount: 310, type: 'Seafood', imageUrl: null, isOpen: true },
  { id: '3', name: 'Pasta House', location: 'Lac 2, Tunis', rating: 4.1, reviewCount: 220, type: 'Italian', imageUrl: null, isOpen: false },
  { id: '4', name: 'Burger Town', location: 'Sousse Centre', rating: 4.0, reviewCount: 180, type: 'Fast Food', imageUrl: null, isOpen: true },
  { id: '5', name: 'Dar El Jeld', location: 'Medina, Tunis', rating: 4.7, reviewCount: 620, type: 'Tunisian', imageUrl: null, isOpen: true },
  { id: '6', name: 'La Closerie', location: 'Gammarth', rating: 4.4, reviewCount: 405, type: 'French', imageUrl: null, isOpen: false },
];

const MOCK_DOCTORS: ProfessionalItem[] = [
  { id: '1', name: 'Dr. Ahmed Ben Salem', specialty: 'Cardiologist', location: 'Sousse, Tunisia', distance: '1.2km', rating: 4.9, avatarUrl: null },
  { id: '2', name: 'Dr. Leyla Abidi', specialty: 'Dermatologist', location: 'Tunis, Tunisia', distance: '5.4km', rating: 4.8, avatarUrl: null },
  { id: '3', name: 'Dr. Mohamed Trabelsi', specialty: 'Dentist', location: 'Sfax, Tunisia', distance: '2.1km', rating: 4.7, avatarUrl: null },
  { id: '4', name: 'Dr. Sana Gharbi', specialty: 'Pediatrics', location: 'Monastir, Tunisia', distance: '3.8km', rating: 4.6, avatarUrl: null },
  { id: '5', name: 'Dr. Khaled Mansouri', specialty: 'Psychology', location: 'Tunis, Tunisia', distance: '4.5km', rating: 4.5, avatarUrl: null },
  { id: '6', name: 'Dr. Amira Jouini', specialty: 'Ophthalmologist', location: 'Bizerte, Tunisia', distance: '6.2km', rating: 4.8, avatarUrl: null },
];

const PROFESSIONAL_CATEGORIES = ['doctors', 'lawyers', 'consultants', 'therapists'];

const BUSINESS_FILTERS: Record<string, string[]> = {
  restaurants: ['Tunisian', 'Italian', 'Fast Food', 'Seafood', 'French'],
  hotels: ['Luxury', 'Budget', 'Resort', 'Boutique'],
  gyms: ['CrossFit', 'Yoga', 'Boxing', 'General'],
  default: ['Popular', 'New', 'Trending'],
};

const PROFESSIONAL_FILTERS: Record<string, string[]> = {
  doctors: ['Dentist', 'Pediatrics', 'Psychology', 'Cardiologist', 'Dermatologist'],
  lawyers: ['Civil', 'Criminal', 'Corporate', 'Family'],
  default: ['Popular', 'New', 'Trending'],
};

// ── Helper ───────────────────────────────────────────────────────────────────

const isProfessionalCategory = (categoryId: string): boolean => {
  return PROFESSIONAL_CATEGORIES.includes(categoryId.toLowerCase());
};

const isBusiness = (item: SubCategoryItem): item is BusinessItem => {
  return 'reviewCount' in item;
};

const getFiltersForCategory = (categoryId: string): string[] => {
  const key = categoryId.toLowerCase();
  if (isProfessionalCategory(key)) {
    return PROFESSIONAL_FILTERS[key] ?? PROFESSIONAL_FILTERS.default;
  }
  return BUSINESS_FILTERS[key] ?? BUSINESS_FILTERS.default;
};

const getDataForCategory = (categoryId: string): SubCategoryItem[] => {
  if (isProfessionalCategory(categoryId.toLowerCase())) {
    return MOCK_DOCTORS;
  }
  return MOCK_RESTAURANTS;
};

const getCategoryDisplayName = (categoryId: string): string => {
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
};

// ── Business Card ────────────────────────────────────────────────────────────

interface BusinessCardProps {
  item: BusinessItem;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
  openLabel: string;
  closedLabel: string;
  reviewsLabel: string;
}

const BusinessCard: React.FC<BusinessCardProps> = React.memo(
  ({ item, onPress, onFavorite, openLabel, closedLabel, reviewsLabel }) => {
    const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
    const handleFavorite = useCallback(() => onFavorite(item.id), [item.id, onFavorite]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          marginBottom: 16,
          borderRadius: 16,
          backgroundColor: colors.cardDark,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
        })}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        {/* Cover Image */}
        <View
          style={{
            height: 160,
            backgroundColor: colors.borderDark,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{ width: '100%', height: '100%' }}
              accessibilityLabel={item.name}
            />
          ) : (
            <MaterialCommunityIcons
              name="image-outline"
              size={48}
              color={colors.textSlate500}
            />
          )}

          {/* Favorite button */}
          <Pressable
            onPress={handleFavorite}
            style={({ pressed }) => ({
              position: 'absolute',
              top: 12,
              right: 12,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: pressed ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            accessibilityLabel={`Favorite ${item.name}`}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="heart-outline"
              size={20}
              color={colors.white}
            />
          </Pressable>

          {/* Open/Closed badge */}
          <View
            style={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              backgroundColor: item.isOpen ? colors.success : colors.error,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
            }}
          >
            <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.white }}>
              {item.isOpen ? openLabel : closedLabel}
            </AppText>
          </View>
        </View>

        {/* Card Content */}
        <View style={{ padding: 14 }}>
          <AppText
            style={{ fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 6 }}
            numberOfLines={1}
          >
            {item.name}
          </AppText>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <MaterialCommunityIcons
              name="map-marker-outline"
              size={14}
              color={colors.textSlate400}
            />
            <AppText
              style={{ fontSize: 13, color: colors.textSlate400, marginLeft: 4 }}
              numberOfLines={1}
            >
              {item.location}
            </AppText>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.ratingGold}
            />
            <AppText style={{ fontSize: 13, color: colors.white, marginLeft: 4, fontWeight: '600' }}>
              {item.rating.toFixed(1)}
            </AppText>
            <AppText style={{ fontSize: 13, color: colors.textSlate400, marginLeft: 4 }}>
              {item.reviewCount}+ {reviewsLabel}
            </AppText>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: colors.textSlate500,
                marginHorizontal: 8,
              }}
            />
            <AppText style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '500' }}>
              {item.type}
            </AppText>
          </View>
        </View>
      </Pressable>
    );
  },
);

BusinessCard.displayName = 'BusinessCard';

// ── Professional Card ────────────────────────────────────────────────────────

interface ProfessionalCardProps {
  item: ProfessionalItem;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
  kmLabel: string;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = React.memo(
  ({ item, onPress, onFavorite, kmLabel }) => {
    const handlePress = useCallback(() => onPress(item.id), [item.id, onPress]);
    const handleFavorite = useCallback(() => onFavorite(item.id), [item.id, onFavorite]);

    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          marginBottom: 14,
          borderRadius: 16,
          backgroundColor: colors.cardDark,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          opacity: pressed ? 0.9 : 1,
        })}
        accessibilityLabel={item.name}
        accessibilityRole="button"
      >
        {/* Avatar */}
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            borderWidth: 2,
            borderColor: colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.borderDark,
            marginRight: 14,
          }}
        >
          {item.avatarUrl ? (
            <Image
              source={{ uri: item.avatarUrl }}
              style={{ width: 56, height: 56, borderRadius: 28 }}
              accessibilityLabel={item.name}
            />
          ) : (
            <MaterialCommunityIcons
              name="account"
              size={30}
              color={colors.textSlate500}
            />
          )}
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
            style={{ fontSize: 13, color: colors.neonPurple, fontWeight: '500', marginBottom: 5 }}
          >
            {item.specialty}
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
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: colors.textSlate500,
                marginHorizontal: 6,
              }}
            />
            <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
              {item.distance}
            </AppText>
          </View>
        </View>

        {/* Rating Badge */}
        <View
          style={{
            backgroundColor: colors.success,
            borderRadius: 10,
            paddingHorizontal: 8,
            paddingVertical: 4,
            marginRight: 8,
          }}
        >
          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.white }}>
            {item.rating.toFixed(1)}
          </AppText>
        </View>

        {/* Favorite */}
        <Pressable
          onPress={handleFavorite}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: pressed ? 'rgba(255,255,255,0.1)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={`Favorite ${item.name}`}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="heart-outline"
            size={22}
            color={colors.textSlate400}
          />
        </Pressable>
      </Pressable>
    );
  },
);

ProfessionalCard.displayName = 'ProfessionalCard';

// ── Filter Chip ──────────────────────────────────────────────────────────────

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

const FilterChip: React.FC<FilterChipProps> = React.memo(
  ({ label, isSelected, onPress }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: isSelected ? colors.neonPurple : colors.cardDark,
        borderWidth: 1,
        borderColor: isSelected ? colors.neonPurple : colors.borderDark,
        marginRight: 10,
        opacity: pressed ? 0.8 : 1,
      })}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
    >
      <AppText
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: isSelected ? colors.white : colors.textSlate400,
        }}
      >
        {label}
      </AppText>
    </Pressable>
  ),
);

FilterChip.displayName = 'FilterChip';

// ── Main Screen ──────────────────────────────────────────────────────────────

export default function SubCategoryBrowserScreen() {
  useAnalyticsScreen(AnalyticsScreens.SUB_CATEGORY_BROWSER);
  const { t } = useTranslation();
  const router = useRouter();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();

  const resolvedCategoryId = categoryId ?? 'restaurants';
  const professionalMode = isProfessionalCategory(resolvedCategoryId);
  const categoryDisplayName = getCategoryDisplayName(resolvedCategoryId);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const filters = useMemo(() => getFiltersForCategory(resolvedCategoryId), [resolvedCategoryId]);
  const allData = useMemo(() => getDataForCategory(resolvedCategoryId), [resolvedCategoryId]);

  const filteredData = useMemo(() => {
    let result = allData;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(query));
    }

    if (selectedFilter) {
      result = result.filter((item) => {
        if (isBusiness(item)) {
          return item.type.toLowerCase() === selectedFilter.toLowerCase();
        }
        return (item as ProfessionalItem).specialty.toLowerCase() === selectedFilter.toLowerCase();
      });
    }

    return result;
  }, [allData, searchQuery, selectedFilter]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleItemPress = useCallback(
    (id: string) => {
      // Navigate to detail - placeholder for now
      router.push({ pathname: '/(main)/(feed)/business/[businessId]', params: { businessId: id } });
    },
    [router],
  );

  const handleFavorite = useCallback((_id: string) => {
    // Toggle favorite - placeholder for now
  }, []);

  const handleFilterPress = useCallback((filter: string | null) => {
    setSelectedFilter((current) => (current === filter ? null : filter));
  }, []);

  const searchPlaceholder = professionalMode
    ? t('subCategory.searchDoctors')
    : t('subCategory.searchBusinesses', { category: categoryDisplayName.toLowerCase() });

  const renderItem = useCallback(
    ({ item }: { item: SubCategoryItem }) => {
      if (isBusiness(item)) {
        return (
          <BusinessCard
            item={item}
            onPress={handleItemPress}
            onFavorite={handleFavorite}
            openLabel={t('subCategory.open')}
            closedLabel={t('subCategory.closed')}
            reviewsLabel={t('subCategory.reviews')}
          />
        );
      }
      return (
        <ProfessionalCard
          item={item as ProfessionalItem}
          onPress={handleItemPress}
          onFavorite={handleFavorite}
          kmLabel={t('subCategory.km')}
        />
      );
    },
    [handleItemPress, handleFavorite, t],
  );

  const keyExtractor = useCallback((item: SubCategoryItem) => item.id, []);

  return (
    <ScreenLayout>
      {/* Header */}
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
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={colors.white}
          />
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

      {/* Search Bar + Sort/Filter */}
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

      {/* Filter Chips */}
      <View style={{ paddingBottom: 12 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          <FilterChip
            label={t('subCategory.all')}
            isSelected={selectedFilter === null}
            onPress={() => handleFilterPress(null)}
          />
          {filters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              isSelected={selectedFilter === filter}
              onPress={() => handleFilterPress(filter)}
            />
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <MaterialCommunityIcons
              name="magnify-close"
              size={48}
              color={colors.textSlate500}
            />
            <AppText style={{ color: colors.textSlate500, fontSize: 16, marginTop: 16 }}>
              {t('home.noResults')}
            </AppText>
          </View>
        }
      />
    </ScreenLayout>
  );
}
