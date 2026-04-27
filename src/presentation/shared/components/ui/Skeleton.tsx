import React, { useEffect, useRef } from 'react';
import { Animated, View, ViewStyle } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';

const useSkeletonAnimation = (): Animated.Value => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return opacity;
};

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  width,
  height,
  borderRadius = 8,
  style,
}) => {
  const opacity = useSkeletonAnimation();
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: theme.isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(148, 163, 184, 0.3)',
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCircleProps {
  size: number;
  style?: ViewStyle;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size, style }) => {
  const opacity = useSkeletonAnimation();
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(148, 163, 184, 0.3)',
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonLineProps {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}

export const SkeletonLine: React.FC<SkeletonLineProps> = ({
  width = '100%',
  height = 14,
  style,
}) => {
  const opacity = useSkeletonAnimation();
  const theme = useTheme();

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: height / 2,
          backgroundColor: theme.isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(148, 163, 184, 0.3)',
          opacity,
        },
        style,
      ]}
    />
  );
};

/** A row of skeleton elements with a gap */
export const SkeletonRow: React.FC<{ gap?: number; children: React.ReactNode; style?: ViewStyle }> = ({
  gap = 8,
  children,
  style,
}) => (
  <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>
    {children}
  </View>
);
