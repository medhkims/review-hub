import React, { useState, useCallback } from 'react';
import { View, Image, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { SectionCard } from './SectionCard';
import { MenuCategory, MenuItem } from '@/domain/business/entities/businessDetailEntity';

interface MenuSectionProps {
  menuCategories: MenuCategory[];
}

const MenuItemRow: React.FC<{ item: MenuItem }> = React.memo(({ item }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    }}
  >
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
          resizeMode="cover"
          accessibilityLabel={item.name}
        />
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            backgroundColor: colors.cardDark,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <AppText style={{ fontSize: 16 }}>🍽</AppText>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.white }}>
          {item.name}
        </AppText>
        {item.description ? (
          <AppText style={{ fontSize: 10, color: colors.textSlate500, marginTop: 2 }} numberOfLines={1}>
            {item.description}
          </AppText>
        ) : null}
      </View>
    </View>
    <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
      {item.currency}{item.price.toFixed(2)}
    </AppText>
  </View>
));

export const MenuSection: React.FC<MenuSectionProps> = ({ menuCategories }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const allCategoryNames = menuCategories.map((mc) => mc.name);

  const filteredCategories = selectedCategory
    ? menuCategories.filter((mc) => mc.name === selectedCategory)
    : menuCategories;

  const handleCategoryPress = useCallback((name: string | null) => {
    setSelectedCategory(name);
  }, []);

  if (menuCategories.length === 0) return null;

  return (
    <SectionCard title={t('businessDetail.menu')} defaultExpanded={false}>
      {/* Category Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 4, marginBottom: 24 }}
      >
        <Pressable
          onPress={() => handleCategoryPress(null)}
          accessibilityLabel={t('businessDetail.allCategories')}
          accessibilityRole="button"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: selectedCategory === null ? colors.neonPurple : colors.midnight,
            borderWidth: 1,
            borderColor: selectedCategory === null ? colors.neonPurple : 'rgba(255, 255, 255, 0.1)',
            ...(selectedCategory === null && {
              shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 5,
            }),
          }}
        >
          <AppText
            style={{
              fontSize: 12,
              fontWeight: '500',
              color: selectedCategory === null ? colors.white : colors.textSlate400,
            }}
          >
            {t('businessDetail.all')}
          </AppText>
        </Pressable>

        {allCategoryNames.map((name) => (
          <Pressable
            key={name}
            onPress={() => handleCategoryPress(name)}
            accessibilityLabel={name}
            accessibilityRole="button"
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              borderRadius: 20,
              backgroundColor: selectedCategory === name ? colors.neonPurple : colors.midnight,
              borderWidth: 1,
              borderColor: selectedCategory === name ? colors.neonPurple : 'rgba(255, 255, 255, 0.1)',
              ...(selectedCategory === name && {
                shadowColor: colors.neonPurple,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 5,
              }),
            }}
          >
            <AppText
              style={{
                fontSize: 12,
                fontWeight: '500',
                color: selectedCategory === name ? colors.white : colors.textSlate400,
              }}
            >
              {name}
            </AppText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Menu Items by Category */}
      <View style={{ gap: 24 }}>
        {filteredCategories.map((category) => (
          <View
            key={category.id}
            style={{
              backgroundColor: colors.midnight,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 4, height: 16, backgroundColor: colors.neonPurple, borderRadius: 2, marginRight: 12 }} />
              <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                {category.name}
              </AppText>
            </View>

            <View style={{ gap: 4 }}>
              {category.items.map((item) => (
                <MenuItemRow key={item.id} item={item} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};
