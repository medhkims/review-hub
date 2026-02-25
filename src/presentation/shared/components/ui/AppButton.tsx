import React from 'react';
import { Pressable, PressableProps, ActivityIndicator, View } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

interface AppButtonProps extends PressableProps {
  title?: string;
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'large';
  shape?: 'rounded' | 'pill';
  isLoading?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

const variantBgColors = {
  primary: colors.neonPurple,
  secondary: colors.cardDark,
  danger: colors.error,
  ghost: 'transparent',
};

const variantTextColors = {
  primary: colors.textWhite,
  secondary: colors.textSlate200,
  danger: colors.textWhite,
  ghost: colors.primary,
};

const sizePadding = {
  sm: { paddingHorizontal: 12, paddingVertical: 8 },
  md: { paddingHorizontal: 16, paddingVertical: 12 },
  lg: { paddingHorizontal: 24, paddingVertical: 16 },
};

const sizeFontSize = {
  sm: 14,
  md: 16,
  lg: 18,
};

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  children,
  variant = 'primary',
  size = 'md',
  shape = 'rounded',
  isLoading = false,
  className = '',
  icon,
  disabled,
  ...props
}) => {
  const normalizedSize = size === 'large' ? 'lg' : size;
  const isPill = shape === 'pill';

  const content = children || title;

  return (
    <Pressable
      className={`items-center justify-center ${disabled ? 'opacity-50' : ''} ${className}`}
      style={{
        borderRadius: isPill ? 9999 : 12,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        backgroundColor: variantBgColors[variant],
        opacity: disabled ? 0.5 : 1,
        height: isPill && normalizedSize === 'lg' ? 56 : undefined,
        ...sizePadding[normalizedSize],
        ...(variant === 'secondary' ? { borderWidth: 1, borderColor: colors.borderDark } : {}),
      }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.primary : colors.textWhite} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {typeof content === 'string' ? (
            <AppText
              style={{
                fontWeight: '700',
                fontSize: sizeFontSize[normalizedSize],
                color: variantTextColors[variant],
              }}
            >
              {content}
            </AppText>
          ) : (
            content
          )}
          {icon}
        </View>
      )}
    </Pressable>
  );
};
