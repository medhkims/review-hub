import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useHomeStore } from '../store/homeStore';
import { useHome } from '../hooks/useHome';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

const getIconForCategory = (category: CategoryEntity): keyof typeof MaterialCommunityIcons.glyphMap => {
  return (category.icon as keyof typeof MaterialCommunityIcons.glyphMap) ?? 'tag-outline';
};

interface CategoryItem {
  id: string;
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

// ── Row Component ───────────────────────────────────────────────────────────

interface CategoryRowProps {
  item: CategoryItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const CategoryRow = React.memo(({ item, isSelected, onToggle }: CategoryRowProps) => {
  const handlePress = useCallback(() => {
    onToggle(item.id);
  }, [item.id, onToggle]);

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: pressed ? 'rgba(168,85,247,0.08)' : colors.cardDark,
        borderRadius: 16,
        marginBottom: 10,
        overflow: 'hidden',
      })}
      accessibilityLabel={`${item.name}, ${isSelected ? 'selected' : 'not selected'}`}
      accessibilityRole="checkbox"
    >
      {/* Left accent bar */}
      <View
        style={{
          width: 4,
          alignSelf: 'stretch',
          backgroundColor: isSelected ? colors.neonPurple : 'transparent',
          borderTopLeftRadius: 16,
          borderBottomLeftRadius: 16,
        }}
      />

      {/* Icon circle */}
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: isSelected
            ? 'rgba(168,85,247,0.15)'
            : 'rgba(51,65,133,0.3)',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 14,
          marginVertical: 14,
        }}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={22}
          color={isSelected ? colors.neonPurple : colors.textSlate400}
        />
      </View>

      {/* Category name */}
      <AppText
        style={{
          flex: 1,
          marginLeft: 14,
          fontSize: 16,
          fontWeight: '600',
          color: isSelected ? colors.textWhite : colors.textSlate400,
        }}
      >
        {item.name}
      </AppText>

      {/* Checkmark circle */}
      <View style={{ marginRight: 18 }}>
        {isSelected ? (
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: colors.neonPurple,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="check" size={16} color={colors.white} />
          </View>
        ) : (
          <View
            style={{
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: 2,
              borderColor: colors.borderDark,
              backgroundColor: 'transparent',
            }}
          />
        )}
      </View>
    </Pressable>
  );
});

CategoryRow.displayName = 'CategoryRow';

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function CategorySelectionScreen() {
  useAnalyticsScreen(AnalyticsScreens.CATEGORY_SELECTION);
  const { t } = useTranslation();
  const router = useRouter();
  const { categories: storeCategories, isCategoryLoading, selectedCategoryId } = useHomeStore();
  const { selectCategory } = useHome();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
    return selectedCategoryId ? new Set([selectedCategoryId]) : new Set();
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Map store categories to display items with icons
  const categoryItems: CategoryItem[] = useMemo(() => {
    return storeCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: getIconForCategory(cat),
    }));
  }, [storeCategories]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categoryItems;
    return categoryItems.filter((cat) => cat.name.toLowerCase().includes(query));
  }, [searchQuery, categoryItems]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const handleFilter = useCallback(() => {
    const firstSelected = Array.from(selectedIds)[0] ?? null;
    selectCategory(firstSelected);
    if (firstSelected) {
      const selectedCategory = categoryItems.find((cat) => cat.id === firstSelected);
      router.push({
        pathname: '/(main)/(feed)/sub-category',
        params: { categoryId: firstSelected, categoryName: selectedCategory?.name ?? firstSelected },
      });
    } else {
      router.back();
    }
  }, [router, selectedIds, selectCategory, categoryItems]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderItem = useCallback(
    ({ item }: { item: CategoryItem }) => (
      <CategoryRow
        item={item}
        isSelected={selectedIds.has(item.id)}
        onToggle={handleToggle}
      />
    ),
    [selectedIds, handleToggle],
  );

  const keyExtractor = useCallback((item: CategoryItem) => item.id, []);

  const ListFooterComponent = useMemo(
    () => (
      <View style={{ alignItems: 'center', paddingVertical: 20, paddingBottom: 100 }}>
        <AppText
          style={{
            fontSize: 13,
            color: colors.neonPurple,
            fontWeight: '500',
            letterSpacing: 0.3,
          }}
        >
          {t('home.categorySelection.endOfList')}
        </AppText>
      </View>
    ),
    [t],
  );

  return (
    <ScreenLayout>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        <Pressable
          onPress={handleBack}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: pressed
              ? 'rgba(255,255,255,0.1)'
              : 'rgba(30,41,59,0.5)',
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
            textAlign: 'center',
            marginRight: 40,
            letterSpacing: -0.3,
          }}
        >
          {t('home.categorySelection.title')}
        </AppText>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
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
            style={{ flex: 1, color: colors.textWhite, fontSize: 16, padding: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.categorySelection.searchPlaceholder')}
            placeholderTextColor={colors.textSlate500}
            accessibilityLabel={t('home.categorySelection.searchPlaceholder')}
            accessibilityRole="search"
          />
        </View>
      </View>

      {/* Category list */}
      <FlatList
        data={filteredCategories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={filteredCategories.length > 0 ? ListFooterComponent : null}
      />

      {/* Bottom sticky footer */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 24,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.borderDark,
          backgroundColor: colors.midnight,
          gap: 12,
        }}
      >
        {/* Reset button */}
        <Pressable
          onPress={handleReset}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            borderWidth: 1.5,
            borderColor: colors.borderDark,
            backgroundColor: pressed ? 'rgba(255,255,255,0.05)' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={t('home.categorySelection.reset')}
          accessibilityRole="button"
        >
          <AppText
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.textSlate200,
            }}
          >
            {t('home.categorySelection.reset')}
          </AppText>
        </Pressable>

        {/* Filter button */}
        <Pressable
          onPress={handleFilter}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: 14,
            borderRadius: 14,
            backgroundColor: pressed
              ? 'rgba(168,85,247,0.8)'
              : colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
          })}
          accessibilityLabel={t('home.categorySelection.filter')}
          accessibilityRole="button"
        >
          <AppText
            style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.white,
            }}
          >
            {t('home.categorySelection.filter')}
          </AppText>
        </Pressable>
      </View>
    </ScreenLayout>
  );
}
