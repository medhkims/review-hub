import React, { useState } from 'react';
import { View, Pressable, Image, ScrollView, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
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
  imageUri?: string;
  items: MenuItem[];
}

interface PriceListCardProps {
  isEditMode?: boolean;
  onAddCategory?: () => void;
  onAddItem?: (categoryId: string) => void;
  onEditCategory?: (categoryId: string) => void;
  onEditItem?: (categoryId: string, itemId: string) => void;
  populated?: boolean;
  categories?: MenuCategory[];
}

export const PriceListCard: React.FC<PriceListCardProps> = ({
  isEditMode = false,
  onAddCategory,
  onAddItem,
  onEditCategory,
  onEditItem,
  populated = false,
  categories = [],
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

  const header = (
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
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
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.neonPurple}
        />
      </View>
    </Pressable>
  );

  const cardStyle = {
    backgroundColor: colors.cardDark,
    borderRadius: 24,
    overflow: 'hidden' as const,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  };

  const itemDetailModal = (
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
          <View style={{ backgroundColor: colors.cardDark, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
            {/* Image container */}
            <View style={{ width: '100%', height: 200, backgroundColor: `${colors.neonPurple}10`, alignItems: 'center', justifyContent: 'center' }}>
              {detailItem.imageUri ? (
                <Image
                  source={{ uri: detailItem.imageUri }}
                  style={{ width: '70%', height: '90%' }}
                  resizeMode="contain"
                  accessibilityLabel={detailItem.name}
                />
              ) : (
                <MaterialCommunityIcons name="food" size={64} color={`${colors.neonPurple}66`} />
              )}
            </View>

            <View style={{ padding: 24, gap: 12, paddingBottom: 36 }}>
              {/* Name + close */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white, flex: 1 }}>
                  {detailItem.name}
                </AppText>
                <Pressable
                  onPress={() => setDetailItem(null)}
                  accessibilityLabel={t('common.cancel')}
                  accessibilityRole="button"
                >
                  <MaterialCommunityIcons name="close" size={20} color={colors.textSlate400} />
                </Pressable>
              </View>

              {/* Price */}
              <AppText style={{ fontSize: 22, fontWeight: '800', color: colors.neonPurple }}>
                {detailItem.price}
              </AppText>

              {/* Description */}
              {!!detailItem.description && (
                <>
                  <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />
                  <AppText style={{ fontSize: 14, color: colors.textSlate400, lineHeight: 22 }}>
                    {detailItem.description}
                  </AppText>
                </>
              )}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  if (populated && categories.length > 0) {
    const filterOptions = [
      { id: 'all', label: t('businessOwner.companyProfile.all') },
      ...categories.map((cat) => ({ id: cat.id, label: cat.name })),
    ];

    const filteredCategories = selectedFilter === 'all'
      ? categories
      : categories.filter((cat) => cat.id === selectedFilter);

    return (
      <View style={cardStyle}>
        {itemDetailModal}
        {header}

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      {category.imageUri ? (
                        <Image
                          source={{ uri: category.imageUri }}
                          style={{ width: 32, height: 32, borderRadius: 8 }}
                          resizeMode="cover"
                          accessibilityLabel={category.name}
                        />
                      ) : (
                        <View style={{ width: 4, height: 16, backgroundColor: colors.neonPurple, borderRadius: 2 }} />
                      )}
                      <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white }}>
                        {category.name}
                      </AppText>
                    </View>
                    {isEditMode && (
                      <Pressable
                        onPress={() => onEditCategory?.(category.id)}
                        accessibilityLabel={`Edit ${category.name}`}
                        accessibilityRole="button"
                      >
                        <MaterialCommunityIcons name="pencil" size={14} color={colors.textSlate500} />
                      </Pressable>
                    )}
                  </View>

                  {/* Menu Items */}
                  <View style={{ gap: 0 }}>
                    {category.items.map((item, index) => (
                      <Pressable
                        key={item.id}
                        onPress={() => isEditMode ? onEditItem?.(category.id, item.id) : setDetailItem(item)}
                        accessibilityLabel={item.name}
                        accessibilityRole="button"
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          paddingVertical: 10,
                          borderBottomWidth: index < category.items.length - 1 ? 1 : 0,
                          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
                          opacity: pressed ? 0.75 : 1,
                        })}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          {item.imageUri ? (
                            <Image
                              source={{ uri: item.imageUri }}
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
                          <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.white, flex: 1 }}>
                            {item.name}
                          </AppText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.neonPurple }}>
                            {item.price}
                          </AppText>
                          {isEditMode && (
                            <MaterialCommunityIcons name="pencil" size={14} color={colors.textSlate500} />
                          )}
                        </View>
                      </Pressable>
                    ))}
                  </View>

                  {/* Add Item Button — edit mode only */}
                  {isEditMode && (
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
                  )}
                </View>
              ))}
            </View>

            {/* Add Category button — edit mode only */}
            {isEditMode && (
              <Pressable
                onPress={onAddCategory}
                accessibilityLabel={t('businessOwner.companyProfile.addCategory')}
                accessibilityRole="button"
                style={{
                  marginTop: 20,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 13,
                  borderWidth: 1,
                  borderStyle: 'dashed',
                  borderColor: colors.neonPurple,
                  borderRadius: 12,
                  backgroundColor: `${colors.neonPurple}0D`,
                }}
              >
                <MaterialCommunityIcons name="plus-circle-outline" size={18} color={colors.neonPurple} />
                <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
                  {t('businessOwner.companyProfile.addCategory')}
                </AppText>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  }

  // Empty state — same purple header style
  return (
    <View style={cardStyle}>
      {header}

      {expanded && (
        <View style={{ padding: 24 }}>
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
            <MaterialCommunityIcons name="food-fork-drink" size={36} color={colors.textSlate500} style={{ marginBottom: 12 }} />
            <AppText style={{ fontSize: 14, color: colors.textSlate400, marginBottom: 16, textAlign: 'center' }}>
              {t('businessOwner.companyProfile.catalogEmpty')}
            </AppText>
            {isEditMode && (
              <Pressable
                onPress={onAddCategory}
                accessibilityLabel={t('businessOwner.companyProfile.addCategory')}
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingHorizontal: 20,
                  paddingVertical: 11,
                  borderRadius: 9999,
                  backgroundColor: colors.neonPurple,
                }}
              >
                <MaterialCommunityIcons name="plus" size={16} color={colors.white} />
                <AppText style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>
                  {t('businessOwner.companyProfile.addCategory')}
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
