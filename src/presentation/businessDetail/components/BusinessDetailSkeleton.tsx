import React from 'react';
import { View, Platform } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';
import { SkeletonBox, SkeletonCircle, SkeletonLine, SkeletonRow } from '@/presentation/shared/components/ui/Skeleton';

export const BusinessDetailSkeleton: React.FC = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Cover image placeholder */}
      <SkeletonBox
        width="100%"
        height={Platform.OS === 'web' ? 320 : 256}
        borderRadius={0}
      />

      {/* Logo circle */}
      <View style={{ alignItems: 'center', marginTop: -48 }}>
        <SkeletonCircle size={96} />
      </View>

      {/* Business name */}
      <View style={{ alignItems: 'center', marginTop: 16, paddingHorizontal: 40 }}>
        <SkeletonLine width={200} height={24} />
      </View>

      {/* Category + status */}
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <SkeletonLine width={140} height={14} />
      </View>

      {/* Rating */}
      <View style={{ alignItems: 'center', marginTop: 10 }}>
        <SkeletonRow gap={6}>
          <SkeletonLine width={100} height={14} />
          <SkeletonLine width={30} height={14} />
          <SkeletonLine width={50} height={12} />
        </SkeletonRow>
      </View>

      {/* Action buttons */}
      <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
        <SkeletonRow gap={12}>
          <SkeletonBox width="48%" height={44} borderRadius={22} />
          <SkeletonBox width="48%" height={44} borderRadius={22} />
        </SkeletonRow>
      </View>

      {/* Sections */}
      <View style={{ paddingHorizontal: 20, marginTop: 32, gap: 24 }}>
        {/* Description section */}
        <View style={{ gap: 10 }}>
          <SkeletonLine width={120} height={16} />
          <SkeletonLine width="100%" height={12} />
          <SkeletonLine width="90%" height={12} />
          <SkeletonLine width="75%" height={12} />
        </View>

        {/* Reviews section */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 20,
            gap: 14,
          }}
        >
          <SkeletonLine width={100} height={16} />
          <SkeletonRow gap={12}>
            <SkeletonBox width={60} height={60} borderRadius={12} />
            <View style={{ flex: 1, gap: 8 }}>
              <SkeletonLine width="80%" height={12} />
              <SkeletonLine width="60%" height={12} />
              <SkeletonLine width="40%" height={12} />
            </View>
          </SkeletonRow>
        </View>

        {/* Information section */}
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 20,
            padding: 20,
            gap: 14,
          }}
        >
          <SkeletonLine width={120} height={16} />
          <SkeletonBox width="100%" height={140} borderRadius={16} />
          <SkeletonLine width="70%" height={12} />
          <SkeletonLine width="50%" height={12} />
        </View>
      </View>
    </View>
  );
};
