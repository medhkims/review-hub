import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { useTheme } from '@/core/theme/useTheme';

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
  const theme = useTheme();
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
    <View style={{ width: container, height: container }}>
      {/* Avatar container */}
      <Animated.View
        style={[
          {
            width: container,
            height: container,
            borderRadius: container / 2,
            borderWidth: 2,
            borderColor: '#A855F7',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
          glowStyle,
        ]}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: container, height: container, borderRadius: container / 2 }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: container,
              height: container,
              borderRadius: container / 2,
              backgroundColor: theme.card,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials ? (
              <AppText style={{ fontSize: container * 0.28, fontWeight: '700', color: theme.text }}>
                {initials}
              </AppText>
            ) : (
              <MaterialCommunityIcons name="account" size={container * 0.6} color={theme.textSecondary} />
            )}
          </View>
        )}
      </Animated.View>

      {/* Edit button */}
      {onEditPress && (
        <Pressable
          onPress={onEditPress}
          style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            backgroundColor: '#A855F7',
            borderRadius: 9999,
            padding: 6,
            borderWidth: 3,
            borderColor: theme.background,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit profile photo"
        >
          <MaterialCommunityIcons name="pencil" size={14} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
};
