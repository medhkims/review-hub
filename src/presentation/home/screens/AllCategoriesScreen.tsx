import React, { useCallback, useState } from 'react';
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

export default function AllCategoriesScreen() {
  useAnalyticsScreen(AnalyticsScreens.ALL_CATEGORIES);
  const { t } = useTranslation();
  const router = useRouter();
  const { categories, isCategoryLoading, selectCategory } = useHome();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = searchQuery.trim()
    ? categories.filter((cat) =>
        cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : categories;

  const handleCategoryPress = useCallback(
    (categoryId: string) => {
      selectCategory(categoryId);
      router.back();
    },
    [selectCategory, router],
  );

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
          <CategoryCard category={item} onPress={handleCategoryPress} />
        </View>
      );
    },
    [handleCategoryPress],
  );

  const keyExtractor = useCallback((item: CategoryEntity) => item.id, []);

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
          accessibilityLabel={t('common.cancel')}
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
          {t('home.allCategories.title')}
        </AppText>
      </View>

      {/* Search */}
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
            placeholder={t('home.allCategories.searchPlaceholder')}
            placeholderTextColor={colors.textSlate500}
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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ paddingVertical: 40, alignItems: 'center' }}>
              <AppText style={{ color: colors.textSlate500, fontSize: 16 }}>
                {t('home.allCategories.empty')}
              </AppText>
            </View>
          }
        />
      )}
    </ScreenLayout>
  );
}
