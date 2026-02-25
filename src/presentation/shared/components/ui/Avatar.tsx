import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';

interface AvatarProps {
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withGlow?: boolean;
  onEditPress?: () => void;
  initials?: string;
}

const sizeMap = {
  sm: { container: 48, image: 44 },
  md: { container: 64, image: 60 },
  lg: { container: 96, image: 92 },
  xl: { container: 112, image: 108 },
};

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  size = 'xl',
  withGlow = false,
  onEditPress,
  initials,
}) => {
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (withGlow) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1500,
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [withGlow, glowAnim]);

  const glowStyle = withGlow
    ? {
        shadowColor: '#A855F7',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 0.9],
        }),
        shadowRadius: glowAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [25, 35],
        }),
        elevation: 20,
      }
    : {};

  const { container, image } = sizeMap[size];

  return (
    <View className="relative" style={{ width: container, height: container }}>
      {/* Outer glow container */}
      {withGlow && (
        <View className="absolute inset-0 rounded-full bg-neon-purple/20 blur-3xl scale-150" />
      )}

      {/* Avatar container with border */}
      <Animated.View
        className="relative bg-midnight rounded-full border-2 border-neon-purple p-1 items-center justify-center"
        style={[{ width: container, height: container }, glowStyle]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="rounded-full"
            style={{ width: image, height: image }}
            resizeMode="cover"
          />
        ) : (
          <View
            className="rounded-full bg-slate-700 items-center justify-center"
            style={{ width: image, height: image }}
          >
            {initials ? (
              <AppText className="text-2xl font-bold text-white">{initials}</AppText>
            ) : (
              <MaterialCommunityIcons name="account" size={image * 0.6} color="#94A3B8" />
            )}
          </View>
        )}
      </Animated.View>

      {/* Edit button */}
      {onEditPress && (
        <Pressable
          onPress={onEditPress}
          className="absolute bottom-1 right-1 bg-primary rounded-full p-1.5 border-4 border-midnight active:bg-blue-600"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4 }}
        >
          <MaterialCommunityIcons name="pencil" size={16} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
};
