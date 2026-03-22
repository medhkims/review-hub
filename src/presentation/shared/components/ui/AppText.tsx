import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export const AppText: React.FC<AppTextProps> = ({ children, className = '', style, ...props }) => {
  const theme = useTheme();
  return (
    <Text
      className={`text-base ${className}`}
      style={[{ fontSize: 16, color: theme.text }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
