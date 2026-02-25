import React from 'react';
import { View, Image, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Card } from '@/presentation/shared/components/ui/Card';
import { colors } from '@/core/theme/colors';
import { BusinessEntity } from '@/domain/business/entities/businessEntity';

interface BusinessCardProps {
  business: BusinessEntity;
  onPress: () => void;
  onFavoritePress: () => void;
  onWishlistPress: () => void;
  isWishlisted: boolean;
}

const BusinessCardComponent: React.FC<BusinessCardProps> = ({
  business,
  onPress,
  onFavoritePress,
  onWishlistPress,
  isWishlisted,
}) => {
  return (
    <Pressable
      onPress={onPress}
      className="active:opacity-95"
      accessibilityLabel={business.name}
      accessibilityRole="button"
    >
      <Card className="mb-4">
        {/* Cover Image */}
        <View style={{ height: 192, width: '100%', overflow: 'hidden' }}>
          {business.coverImageUrl ? (
            <Image
              source={{ uri: business.coverImageUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full h-full bg-slate-700 items-center justify-center"
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: '#334155',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="store" size={48} color={colors.textSlate500} />
            </View>
          )}

          {/* Gradient overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 80,
              backgroundColor: 'transparent',
            }}
          />

          {/* Rating badge */}
          <View
            className="absolute top-3 right-3 flex-row items-center rounded-lg px-2.5 py-1"
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }}
          >
            <MaterialCommunityIcons
              name="star"
              size={14}
              color={colors.ratingGold}
              style={{ marginRight: 4 }}
            />
            <AppText
              className="text-white text-xs font-bold"
              style={{ color: colors.white, fontSize: 12, fontWeight: '700' }}
            >
              {business.rating.toFixed(1)}
            </AppText>
          </View>
        </View>

        {/* Card Body */}
        <View className="p-4" style={{ padding: 16 }}>
          <View
            className="flex-row justify-between items-start mb-2"
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <AppText
                className="text-lg font-bold text-white"
                style={{ fontSize: 18, fontWeight: '700', color: colors.white }}
              >
                {business.name}
              </AppText>
              <AppText
                className="text-xs text-slate-400 mt-1"
                style={{ fontSize: 12, color: colors.textSlate400, marginTop: 4 }}
              >
                {business.location} • {business.categoryName}
              </AppText>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                onPress={onWishlistPress}
                className="active:opacity-70"
                hitSlop={8}
                accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={isWishlisted ? 'bookmark' : 'bookmark-outline'}
                  size={24}
                  color={isWishlisted ? '#A855F7' : colors.textSlate500}
                />
              </Pressable>

              <Pressable
                onPress={onFavoritePress}
                className="active:opacity-70"
                hitSlop={8}
                accessibilityLabel={business.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name={business.isFavorite ? 'heart' : 'heart-outline'}
                  size={24}
                  color={business.isFavorite ? colors.red : colors.textSlate500}
                />
              </Pressable>
            </View>
          </View>

          <AppText
            className="text-sm text-slate-400 leading-relaxed"
            style={{ fontSize: 14, color: colors.textSlate400, lineHeight: 20 }}
            numberOfLines={2}
          >
            {business.description}
          </AppText>
        </View>
      </Card>
    </Pressable>
  );
};

export const BusinessCard = React.memo(BusinessCardComponent);
