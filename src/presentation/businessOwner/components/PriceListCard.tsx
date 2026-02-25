import React, { useState } from 'react';
import { View, Pressable, Image, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUri?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface PriceListCardProps {
  onAddCategory?: () => void;
  onAddItem?: (categoryId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  populated?: boolean;
  categories?: MenuCategory[];
}

export const PriceListCard: React.FC<PriceListCardProps> = ({
  onAddCategory,
  onAddItem,
  onEditCategory,
  populated = false,
  categories = [],
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  if (populated && categories.length > 0) {
    const filterOptions = [
      { id: 'all', label: t('businessOwner.companyProfile.all') },
      ...categories.map((cat) => ({ id: cat.id, label: cat.name })),
    ];

    const filteredCategories = selectedFilter === 'all'
      ? categories
      : categories.filter((cat) => cat.id === selectedFilter);

    return (
      <View
        style={{
          backgroundColor: colors.cardDark,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityLabel={t('businessOwner.companyProfile.priceListMenu')}
          accessibilityRole="button"
          style={{
            backgroundColor: `${colors.neonPurple}08`,
            paddingHorizontal: 24,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeftWidth: 6,
            borderLeftColor: colors.neonPurple,
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.neonPurple, letterSpacing: 0.5 }}>
            {t('businessOwner.companyProfile.priceListMenu')}
          </AppText>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.neonPurple}
          />
        </Pressable>

        {expanded && (
          <View style={{ padding: 24 }}>
            {/* Category Filter Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 24 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {filterOptions.map((option) => {
                const isActive = selectedFilter === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setSelectedFilter(option.id)}
                    accessibilityLabel={option.label}
                    accessibilityRole="button"
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 9999,
                      backgroundColor: isActive ? colors.neonPurple : colors.midnight,
                      borderWidth: 1,
                      borderColor: isActive ? colors.neonPurple : 'rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: isActive ? colors.white : colors.textSlate400 }}>
                      {option.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Menu Sections */}
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
                  {/* Category Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 4, height: 16, backgroundColor: colors.neonPurple, borderRadius: 2, marginRight: 12 }} />
                      <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                        {category.name}
                      </AppText>
                    </View>
                    <Pressable
                      onPress={() => onEditCategory?.(category.id)}
                      accessibilityLabel={`Edit ${category.name}`}
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons name="pencil" size={14} color={colors.textSlate500} />
                    </Pressable>
                  </View>

                  {/* Menu Items */}
                  <View style={{ gap: 0 }}>
                    {category.items.map((item, index) => (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                          borderBottomWidth: index < category.items.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          {item.imageUri ? (
                            <Image
                              source={{ uri: item.imageUri }}
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
                                backgroundColor: `${colors.neonPurple}1A`,
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <MaterialCommunityIcons name="food" size={20} color={colors.neonPurple} />
                            </View>
                          )}
                          <View style={{ flex: 1 }}>
                            <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.white }}>
                              {item.name}
                            </AppText>
                            <AppText style={{ fontSize: 10, color: colors.textSlate500, marginTop: 2 }}>
                              {item.description}
                            </AppText>
                          </View>
                        </View>
                        <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
                          {item.price}
                        </AppText>
                      </View>
                    ))}
                  </View>

                  {/* Add Item Button */}
                  <Pressable
                    onPress={() => onAddItem?.(category.id)}
                    accessibilityLabel={t('businessOwner.companyProfile.addItem')}
                    accessibilityRole="button"
                    style={{
                      width: '100%',
                      marginTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      paddingVertical: 10,
                      borderWidth: 1,
                      borderStyle: 'dashed',
                      borderColor: colors.textSlate500,
                      borderRadius: 8,
                    }}
                  >
                    <MaterialCommunityIcons name="plus" size={14} color={colors.textSlate400} />
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400 }}>
                      {t('businessOwner.companyProfile.addItem')}
                    </AppText>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  }

  // Empty state (original)
  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: `${colors.borderDark}50`,
      }}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
          {t('businessOwner.companyProfile.priceList')}
        </AppText>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 6,
            backgroundColor: `${colors.success}33`,
          }}
        >
          <AppText style={{ fontSize: 10, fontWeight: '700', color: colors.success }}>
            {t('businessOwner.companyProfile.visible')}
          </AppText>
        </View>
      </View>

      {/* Empty State */}
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          borderRadius: 16,
          backgroundColor: `${colors.midnight}80`,
          borderWidth: 1,
          borderStyle: 'dashed',
          borderColor: colors.borderDark,
        }}
      >
        <AppText style={{ fontSize: 14, color: colors.textSlate400, marginBottom: 12 }}>
          {t('businessOwner.companyProfile.catalogEmpty')}
        </AppText>
        <AppButton
          title={t('businessOwner.companyProfile.addCategory')}
          onPress={onAddCategory}
          shape="pill"
          size="sm"
          accessibilityLabel={t('businessOwner.companyProfile.addCategory')}
        />
      </View>
    </View>
  );
};
