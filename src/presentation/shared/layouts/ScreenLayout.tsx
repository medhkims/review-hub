import React from 'react';
import { View, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NetworkBanner } from '../components/NetworkBanner';

interface ScreenLayoutProps {
  children: React.ReactNode;
  withKeyboardAvoid?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  children,
  withKeyboardAvoid = false,
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <NetworkBanner />
      {children}
    </View>
  );

  if (withKeyboardAvoid) {
    return (
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};
