import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors } from '@/core/theme/colors';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export const AppText: React.FC<AppTextProps> = ({ children, className = '', style, ...props }) => {
  return (
    <Text
      className={`text-base text-slate-100 ${className}`}
      style={[{ fontSize: 16, color: colors.textSlate100 }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};
