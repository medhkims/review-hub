import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  FlatList,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { container } from '@/core/di/container';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

// ── Business Card ─────────────────────────────────────────────────────────────

interface BusinessCardProps {
  item: BusinessEntity;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
}

const BusinessCard = React.memo<BusinessCardProps>(({ item, onPress, onFavorite }) => {
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
          <AppText style={{ fontSize: 10, fontWeight: '700', color: colors.white, marginLeft: 2 }}>
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
});

BusinessCard.displayName = 'BusinessCard';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function MultiCategoryResultsScreen() {
  useAnalyticsScreen(AnalyticsScreens.MULTI_CATEGORY_RESULTS);
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuthStore();
  const { categoryIds, categoryNames } = useLocalSearchParams<{
    categoryIds: string;
    categoryNames: string;
  }>();

  const parsedIds = useMemo(
    () => (categoryIds ? categoryIds.split(',').filter(Boolean) : []),
    [categoryIds],
  );

  const title = useMemo(() => {
    if (!categoryNames) return t('home.allCategories.title');
    const names = categoryNames.split(',').filter(Boolean);
    if (names.length <= 2) return names.join(' & ');
    return `${names.slice(0, 2).join(', ')} +${names.length - 2}`;
  }, [categoryNames, t]);

  const [businesses, setBusinesses] = useState<BusinessEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBusinesses = useCallback(async () => {
    if (parsedIds.length === 0) {
      setIsLoading(false);
      return;
    }
    setError(null);

    const results = await Promise.all(
      parsedIds.map((id) => container.getBusinessesByCategoryUseCase.execute(id)),
    );

    const merged: BusinessEntity[] = [];
    const seen = new Set<string>();

    results.forEach((result) => {
      result.fold(
        () => {},
        (data) => {
          data.forEach((b) => {
            if (!seen.has(b.id)) {
              seen.add(b.id);
              merged.push(b);
            }
          });
        },
      );
    });

    if (merged.length === 0 && results.every((r) => r.isLeft())) {
      setError(t('common.error'));
    }

    setBusinesses(merged);
    setIsLoading(false);
    setIsRefreshing(false);
  }, [parsedIds, t]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadBusinesses();
  }, [loadBusinesses]);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return businesses;
    const query = searchQuery.toLowerCase();
    return businesses.filter((b) => b.name.toLowerCase().includes(query));
  }, [businesses, searchQuery]);

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

  const renderItem = useCallback(
    ({ item }: { item: BusinessEntity }) => (
      <BusinessCard item={item} onPress={handleItemPress} onFavorite={handleFavorite} />
    ),
    [handleItemPress, handleFavorite],
  );

  const keyExtractor = useCallback((item: BusinessEntity) => item.id, []);

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
          numberOfLines={1}
        >
          {title}
        </AppText>
      </View>

      {/* Search Bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 12 }}>
        <View
          style={{
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
            placeholder={t('home.searchPlaceholder')}
            placeholderTextColor={colors.textSlate500}
            accessibilityLabel={t('home.searchPlaceholder')}
            accessibilityRole="search"
          />
        </View>
      </View>

      {/* Loading */}
      {isLoading && businesses.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : (
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
                {error ?? t('home.noResults')}
              </AppText>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}
