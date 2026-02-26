import React from 'react';
import { View, ScrollView, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

// Mock data matching design screenshot
const MOCK_ITEM = {
  name: 'Tiramisu',
  businessName: 'PASTA COSI',
  category: 'DESSERT',
  price: '€3.75',
  description:
    'Classic Italian dessert with layers of coffee-soaked ladyfingers and creamy mascarpone, dusted with rich cocoa powder. Perfectly balanced sweetness.',
  imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
  ingredients: [
    { name: 'Coffee', icon: 'coffee' as const },
    { name: 'Mascarpone', icon: 'cheese' as const },
    { name: 'Cocoa', icon: 'leaf' as const },
  ],
};

const IngredientChip: React.FC<{ name: string; icon: string }> = ({ name, icon }) => (
  <View
    style={{
      backgroundColor: colors.cardDark,
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: `${colors.borderDark}50`,
      minWidth: 90,
    }}
  >
    <MaterialCommunityIcons
      name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
      size={24}
      color={colors.neonPurple}
      style={{ marginBottom: 6 }}
    />
    <AppText style={{ fontSize: 12, color: colors.textSlate400, fontWeight: '500' }}>{name}</AppText>
  </View>
);

export default function MenuItemDetailScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Item Image */}
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: MOCK_ITEM.imageUrl }}
            style={{ width: '100%', height: 280 }}
            resizeMode="cover"
            accessibilityLabel={MOCK_ITEM.name}
          />
          {/* Back button overlay */}
          <Pressable
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            style={{
              position: 'absolute',
              top: 8,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.4)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="chevron-left" size={26} color={colors.textWhite} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          {/* Name & Price row */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <AppText style={{ fontSize: 28, fontWeight: '700', color: colors.textWhite, flex: 1 }}>
              {MOCK_ITEM.name}
            </AppText>
            <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.neonPurple, marginLeft: 12 }}>
              {MOCK_ITEM.price}
            </AppText>
          </View>

          {/* Business & category */}
          <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.textSlate400, letterSpacing: 1, marginBottom: 20 }}>
            {MOCK_ITEM.businessName} · {MOCK_ITEM.category}
          </AppText>

          {/* Description */}
          <AppText style={{ fontSize: 15, color: colors.textSlate400, lineHeight: 24, marginBottom: 32 }}>
            {MOCK_ITEM.description}
          </AppText>

          {/* Ingredients section */}
          <View
            style={{
              backgroundColor: colors.cardDark,
              borderRadius: 20,
              padding: 20,
              borderWidth: 1,
              borderColor: `${colors.borderDark}30`,
            }}
          >
            <AppText
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: colors.neonPurple,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              Ingredients
            </AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
              {MOCK_ITEM.ingredients.map((ingredient) => (
                <IngredientChip key={ingredient.name} name={ingredient.name} icon={ingredient.icon} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
