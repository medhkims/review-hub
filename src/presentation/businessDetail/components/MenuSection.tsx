import React, { useState, useCallback } from 'react';
import { View, Image, ScrollView, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { SectionCard } from './SectionCard';
import { MenuCategory, MenuItem } from '@/domain/business/entities/businessDetailEntity';
import { trackMenuItemClick } from '@/core/utils/premiumTracking';

interface MenuSectionProps {
  menuCategories: MenuCategory[];
  businessId?: string;
}

const MenuItemRow: React.FC<{ item: MenuItem; onPress: (item: MenuItem) => void }> = React.memo(
  ({ item, onPress }) => {
    const theme = useTheme();
    return (
      <Pressable
        onPress={() => onPress(item)}
        accessibilityLabel={item.name}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
          opacity: pressed ? 0.75 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
              }}
              resizeMode="cover"
              accessibilityLabel={item.name}
            />
          ) : (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 10,
                backgroundColor: `${colors.neonPurple}1A`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="food" size={24} color={colors.neonPurple} />
            </View>
          )}
          <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.text, flex: 1 }}>
            {item.name}
          </AppText>
        </View>
        {item.isDeal && item.dealDiscountPercent ? (
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppText style={{ fontSize: 11, color: colors.textSlate400, textDecorationLine: 'line-through' }}>
                {item.currency}{item.price.toFixed(2)}
              </AppText>
              <View style={{ backgroundColor: colors.pink, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 }}>
                <AppText style={{ fontSize: 9, fontWeight: '800', color: colors.white }}>
                  -{item.dealDiscountPercent}%
                </AppText>
              </View>
            </View>
            <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.emerald }}>
              {item.currency}{(item.price * (1 - item.dealDiscountPercent / 100)).toFixed(2)}
            </AppText>
          </View>
        ) : (
          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
            {item.currency}{item.price.toFixed(2)}
          </AppText>
        )}
      </Pressable>
    );
  },
);

export const MenuSection: React.FC<MenuSectionProps> = ({ menuCategories, businessId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const handleItemPress = useCallback((item: MenuItem, categoryName: string) => {
    if (businessId) trackMenuItemClick(businessId, item.id, item.name, categoryName);
    setDetailItem(item);
  }, [businessId]);

  const allCategoryNames = menuCategories.map((mc) => mc.name);

  const filteredCategories = selectedCategory
    ? menuCategories.filter((mc) => mc.name === selectedCategory)
    : menuCategories;

  const handleCategoryPress = useCallback((name: string | null) => {
    setSelectedCategory(name);
  }, []);

  if (menuCategories.length === 0) return null;

  return (
    <>
      <Modal
        visible={!!detailItem}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailItem(null)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' }}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setDetailItem(null)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
          />
          {detailItem && (
            <View style={{ backgroundColor: theme.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
              {/* Image container */}
              <View style={{ width: '100%', height: 200, backgroundColor: `${colors.neonPurple}10`, alignItems: 'center', justifyContent: 'center' }}>
                {detailItem.imageUrl ? (
                  <Image
                    source={{ uri: detailItem.imageUrl }}
                    style={{ width: '70%', height: '90%' }}
                    resizeMode="contain"
                    accessibilityLabel={detailItem.name}
                  />
                ) : (
                  <MaterialCommunityIcons name="food" size={64} color={`${colors.neonPurple}66`} />
                )}
              </View>
              <View style={{ padding: 24, gap: 12, paddingBottom: 36 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text, flex: 1 }}>
                    {detailItem.name}
                  </AppText>
                  <Pressable
                    onPress={() => setDetailItem(null)}
                    accessibilityLabel={t('common.cancel')}
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
                  </Pressable>
                </View>
                {detailItem.isDeal && detailItem.dealDiscountPercent ? (
                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <AppText style={{ fontSize: 16, color: colors.textSlate400, textDecorationLine: 'line-through' }}>
                        {detailItem.currency}{detailItem.price.toFixed(2)}
                      </AppText>
                      <View style={{ backgroundColor: colors.pink, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                        <AppText style={{ fontSize: 12, fontWeight: '800', color: colors.white }}>
                          -{detailItem.dealDiscountPercent}%
                        </AppText>
                      </View>
                    </View>
                    <AppText style={{ fontSize: 22, fontWeight: '800', color: colors.emerald }}>
                      {detailItem.currency}{(detailItem.price * (1 - detailItem.dealDiscountPercent / 100)).toFixed(2)}
                    </AppText>
                  </View>
                ) : (
                  <AppText style={{ fontSize: 22, fontWeight: '800', color: colors.neonPurple }}>
                    {detailItem.currency}{detailItem.price.toFixed(2)}
                  </AppText>
                )}
                {!!detailItem.description && (
                  <>
                    <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                    <AppText style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>
                      {detailItem.description}
                    </AppText>
                  </>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      <SectionCard title={t('businessDetail.menu')} defaultExpanded={true}>
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
            backgroundColor: selectedCategory === null ? colors.neonPurple : theme.background,
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
              color: selectedCategory === null ? '#FFFFFF' : theme.textSecondary,
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
              backgroundColor: selectedCategory === name ? colors.neonPurple : theme.background,
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
                color: selectedCategory === name ? '#FFFFFF' : theme.textSecondary,
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
              backgroundColor: theme.background,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)',
              padding: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 4, height: 16, backgroundColor: colors.neonPurple, borderRadius: 2, marginRight: 12 }} />
              <AppText style={{ fontSize: 14, fontWeight: '600', color: theme.text }}>
                {category.name}
              </AppText>
            </View>

            <View style={{ gap: 4 }}>
              {category.items.map((item) => (
                <MenuItemRow key={item.id} item={item} onPress={(i) => handleItemPress(i, category.name)} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
    </>
  );
};
