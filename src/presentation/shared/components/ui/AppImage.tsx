import React, { useState } from 'react';
import { Image, ImageProps, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '@/core/theme/colors';

interface AppImageProps extends Omit<ImageProps, 'onLoadStart' | 'onLoadEnd' | 'onError'> {
  /** Show a loading spinner while the image loads (default: true) */
  showLoading?: boolean;
  /** Fallback icon name to show on error (default: 'image-off-outline') */
  fallbackIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Size of the fallback icon (default: 24) */
  fallbackIconSize?: number;
  /** Color of the fallback icon */
  fallbackIconColor?: string;
  /** Background color for error state */
  fallbackBackground?: string;
}

/**
 * Image component with loading and error states.
 * Shows a spinner while loading and a fallback icon on error.
 */
export const AppImage: React.FC<AppImageProps> = ({
  showLoading = true,
  fallbackIcon = 'image-off-outline',
  fallbackIconSize = 24,
  fallbackIconColor = colors.textSlate400,
  fallbackBackground = 'rgba(100,116,139,0.1)',
  style,
  ...rest
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View
        style={[
          { alignItems: 'center', justifyContent: 'center', backgroundColor: fallbackBackground },
          style as object,
        ]}
        accessibilityLabel={rest.accessibilityLabel ?? 'Image unavailable'}
      >
        <MaterialCommunityIcons name={fallbackIcon} size={fallbackIconSize} color={fallbackIconColor} />
      </View>
    );
  }

  return (
    <View style={[style as object, { overflow: 'hidden' }]}>
      <Image
        {...rest}
        style={[{ width: '100%', height: '100%' }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => { setHasError(true); setLoading(false); }}
      />
      {loading && showLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: fallbackBackground,
          }}
        >
          <ActivityIndicator size="small" color={colors.textSlate400} />
        </View>
      )}
    </View>
  );
};
