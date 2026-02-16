import React from 'react';
import { Text, TextProps } from 'react-native';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
}

export const AppText: React.FC<AppTextProps> = ({ children, className, ...props }) => {
  return (
    <Text className={`text-base text-gray-900 ${className ?? ''}`} {...props}>
      {children}
    </Text>
  );
};
