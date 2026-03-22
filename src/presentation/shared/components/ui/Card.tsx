import React from 'react';
import { View, ViewProps } from 'react-native';
import { useTheme } from '@/core/theme/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, ...props }) => {
  const theme = useTheme();
  return (
    <View
      className={`rounded-2xl overflow-hidden ${className}`}
      style={[{
        backgroundColor: theme.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: theme.isDark ? 0.3 : 0.08,
        shadowRadius: 12,
        elevation: 6,
      }, style]}
      {...props}
    >
      {children}
    </View>
  );
};
