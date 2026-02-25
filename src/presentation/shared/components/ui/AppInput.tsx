import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Pressable } from 'react-native';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'pill';
}

export const AppInput: React.FC<AppInputProps> = ({
  label,
  error,
  rightIcon,
  secureTextEntry,
  variant = 'default',
  className = '',
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;
  const isPill = variant === 'pill';

  return (
    <View className="w-full mb-4" style={{ width: '100%', marginBottom: 16 }}>
      {label && (
        <AppText
          className="text-slate-400 text-sm mb-1 font-medium"
          style={{
            color: colors.textSlate400,
            fontSize: 14,
            marginBottom: 4,
            fontWeight: '500',
            ...(isPill ? { marginLeft: 16 } : {}),
          }}
        >
          {label}
        </AppText>
      )}
      <View
        className={`flex-row items-center bg-card-dark border ${
          error ? 'border-red-500' : 'border-border-dark'
        }`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardDark,
          borderWidth: 1,
          borderColor: error ? colors.error : colors.borderDark,
          borderRadius: isPill ? 9999 : 12,
          paddingHorizontal: isPill ? 24 : 16,
          height: isPill ? 56 : undefined,
        }}
      >
        <TextInput
          className={`flex-1 text-white text-base ${className}`}
          style={{
            flex: 1,
            color: colors.textWhite,
            paddingVertical: isPill ? 0 : 12,
            fontSize: 16,
          }}
          placeholderTextColor={colors.textSlate500}
          secureTextEntry={isPassword && !isPasswordVisible}
          accessibilityLabel={label}
          {...props}
        />
        {isPassword && (
          <Pressable
            onPress={() => setIsPasswordVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            style={{ padding: 4 }}
          >
            <AppText
              className="text-slate-400 text-sm"
              style={{ color: colors.textSlate400, fontSize: 14 }}
            >
              {isPasswordVisible ? 'Hide' : 'Show'}
            </AppText>
          </Pressable>
        )}
        {!isPassword && rightIcon}
      </View>
      {error && (
        <AppText
          className="text-red-400 text-xs mt-1"
          style={{ color: '#F87171', fontSize: 12, marginTop: 4 }}
        >
          {error}
        </AppText>
      )}
    </View>
  );
};
