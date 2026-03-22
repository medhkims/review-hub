import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, TextInput, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { CategoryCard } from '../components/CategoryCard';
import { useHome } from '../hooks/useHome';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useRoleStore } from '@/presentation/auth/store/roleStore';
import { AdminMenuButton } from '@/presentation/admin/components/AdminMenuButton';

export default function AllCategoriesScreen() {
  useAnalyticsScreen(AnalyticsScreens.ALL_CATEGORIES);
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { categories, isCategoryLoading } = useHome();
  const role = useRoleStore((s) => s.role);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      router.replace('/(main)/(settings)/manage-categories');
    }
  }, [role, router]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredCategories = searchQuery.trim()
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : categories;

  const handleCategoryPress = useCallback((categoryId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const ids = Array.from(selectedIds);
    const names = ids.map((id) => categories.find((c) => c.id === id)?.name ?? id);
    router.push({
      pathname: '/(main)/(feed)/multi-category',
      params: {
        categoryIds: ids.join(','),
        categoryNames: names.join(','),
      },
    });
  }, [selectedIds, categories, router]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const renderItem = useCallback(
    ({ item, index }: { item: CategoryEntity; index: number }) => {
      const isLeftItem = index % 2 === 0;
      return (
        <View
          style={{
            flex: 1,
            paddingLeft: isLeftItem ? 0 : 6,
            paddingRight: isLeftItem ? 6 : 0,
            marginBottom: 12,
          }}
        >
          <CategoryCard
            category={item}
            onPress={handleCategoryPress}
            isSelected={selectedIds.has(item.id)}
          />
        </View>
      );
    },
    [handleCategoryPress, selectedIds],
  );

  const keyExtractor = useCallback((item: CategoryEntity) => item.id, []);

  const hasSelection = selectedIds.size > 0;

  if (role === 'admin') return null;

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
        {role === 'admin' ? (
          <AdminMenuButton />
        ) : (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: pressed
                ? 'rgba(255,255,255,0.1)'
                : theme.isDark ? 'rgba(30,41,59,0.5)' : 'rgba(148,163,184,0.2)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="chevron-left"
              size={28}
              color={theme.text}
            />
          </Pressable>
        )}
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
          {t('home.allCategories.title')}
        </AppText>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
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
            style={{ flex: 1, color: theme.text, fontSize: 16, padding: 0 }}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('home.allCategories.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            accessibilityLabel={t('home.allCategories.searchPlaceholder')}
            accessibilityRole="search"
          />
        </View>
      </View>

      {/* Categories Grid */}
      {isCategoryLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      ) : (
        <FlatList
          data={filteredCategories}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: hasSelection ? 120 : 100,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <AppText style={{ color: theme.textMuted, fontSize: 16 }}>
                {t('home.allCategories.empty')}
              </AppText>
            </View>
          }
        />
      )}

      {/* Confirm button — appears when at least one category is selected */}
      {hasSelection && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingHorizontal: 24,
            paddingVertical: 20,
            paddingBottom: 32,
            backgroundColor: theme.background,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Pressable
            onPress={handleConfirm}
            style={({ pressed }) => ({
              backgroundColor: pressed ? 'rgba(168,85,247,0.85)' : colors.neonPurple,
              borderRadius: 16,
              paddingVertical: 16,
              alignItems: 'center',
              justifyContent: 'center',
            })}
            accessibilityLabel={t('common.confirm')}
            accessibilityRole="button"
          >
            <AppText
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.white,
                letterSpacing: 0.3,
              }}
            >
              {t('common.confirm')}
            </AppText>
          </Pressable>
        </View>
      )}
    </ScreenLayout>
  );
}
