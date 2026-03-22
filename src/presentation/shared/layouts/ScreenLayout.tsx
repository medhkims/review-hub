import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NetworkBanner } from '../components/NetworkBanner';
import { useTheme } from '@/core/theme/useTheme';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withKeyboardAvoid?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  withKeyboardAvoid = false,
}) => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const content = (
    <View
      style={{ flex: 1, backgroundColor: theme.background, paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <NetworkBanner />
      {children}
    </View>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};
