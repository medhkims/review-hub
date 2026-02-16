import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';

export default function EditProfileScreen() {
  return (
    <ScreenLayout withKeyboardAvoid>
      <View className="flex-1 items-center justify-center">
        <AppText className="text-xl font-bold">Edit Profile</AppText>
        {/* TODO: Implement edit profile form */}
      </View>
    </ScreenLayout>
  );
}
