import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { Avatar } from '@/presentation/shared/components/ui/Avatar';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { useProfile } from '../hooks/useProfile';
import { useAuth } from '@/presentation/auth/hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

export default function PersonalInfoScreen() {
  useAnalyticsScreen(AnalyticsScreens.PERSONAL_INFO);
  const router = useRouter();
  const { user } = useAuth();
  const { profile, isLoading, error, isUploading, uploadProgress, updateProfile, updateEmail, uploadAvatar } = useProfile(user?.id);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setEmail(profile.email);
      setPhoneNumber(profile.phoneNumber || '');
    } else if (user) {
      setDisplayName(user.displayName);
      setEmail(user.email);
    }
  }, [profile, user]);

  const handleSaveChanges = useCallback(async () => {
    if (!user) return;

    setIsUpdating(true);

    await updateProfile(user.id, {
      displayName,
      phoneNumber: phoneNumber || null,
    });

    setIsUpdating(false);

    if (!error) {
      Alert.alert(
        'Success',
        'Your profile has been updated successfully',
        [{ text: 'OK' }]
      );
    }
  }, [user, displayName, phoneNumber, error, updateProfile]);

  const handleChangeEmail = useCallback(async () => {
    if (!user) return;

    if (email === profile?.email) {
      Alert.alert('Error', 'The email address is the same. Please enter a new email.');
      return;
    }

    Alert.alert(
      'Change email',
      'Are you sure you want to change your email? You may need to re-authenticate.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setIsUpdating(true);
            await updateEmail(user.id, email);
            setIsUpdating(false);

            if (!error) {
              Alert.alert(
                'Success',
                'Your email has been updated successfully. Please verify your new email.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  }, [user, email, profile?.email, error, updateEmail]);

  const handleEditAvatar = useCallback(async () => {
    if (!user) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to change your profile picture.',
        [{ text: 'OK' }],
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    await uploadAvatar(user.id, asset.uri, asset.mimeType || 'image/jpeg');
  }, [user, uploadAvatar]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading && !profile) {
    return (
      <ScreenLayout>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.neonPurple} />
        </View>
      </ScreenLayout>
    );
  }

  const displayUser = profile || user;
  const hasNameChanged = displayName !== (profile?.displayName || user?.displayName || '');
  const hasPhoneChanged = phoneNumber !== (profile?.phoneNumber || '');
  const hasProfileChanges = hasNameChanged || hasPhoneChanged;
  const hasEmailChanged = email !== (profile?.email || user?.email || '');

  return (
    <ScreenLayout withKeyboardAvoid>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingTop: 12,
          paddingBottom: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          style={{
            padding: 8,
            borderRadius: 9999,
            backgroundColor: 'rgba(30, 41, 59, 0.3)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textWhite} />
        </Pressable>
        <AppText
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          Personal Info
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar Section */}
        <View style={{ alignItems: 'center', paddingTop: 24, paddingBottom: 8, marginTop: 24 }}>
          {/* Neon glow background blur */}
          <View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 224,
              height: 224,
              marginLeft: -112,
              marginTop: -112,
              borderRadius: 112,
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
            }}
          />

          <View style={{ position: 'relative', marginTop: 8, zIndex: 10 }}>
            <Avatar
              imageUrl={displayUser?.avatarUrl || null}
              size="xl"
              withGlow
              onEditPress={isUploading ? undefined : handleEditAvatar}
              initials={displayUser ? getInitials(displayUser.displayName) : '??'}
            />
            {/* Upload progress overlay */}
            {isUploading && (
              <View
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 9999,
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator color="#A855F7" size="small" />
                <AppText style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>
                  {Math.round(uploadProgress * 100)}%
                </AppText>
              </View>
            )}
          </View>

          <View style={{ marginTop: 20, alignItems: 'center', zIndex: 10 }}>
            <AppText
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.textWhite,
                letterSpacing: -0.3,
              }}
            >
              {displayUser?.displayName || 'Guest'}
            </AppText>
            <AppText
              style={{
                color: colors.textSlate400,
                fontSize: 14,
                marginTop: 4,
              }}
            >
              {displayUser?.email || 'guest@reviewhub.app'}
            </AppText>
          </View>
        </View>

        {/* Form Section */}
        <View style={{ marginTop: 32, gap: 8 }}>
          {/* Full Name */}
          <AppInput
            label="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Enter your full name"
            editable={!isUpdating}
            accessibilityLabel="Full Name"
          />

          {/* E-mail */}
          <AppInput
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isUpdating}
            accessibilityLabel="E-mail"
          />

          {/* Change Email Button */}
          <AppButton
            variant="primary"
            size="lg"
            onPress={handleChangeEmail}
            disabled={isUpdating || !hasEmailChanged}
            style={{
              shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 15,
              elevation: 8,
            }}
            accessibilityRole="button"
            accessibilityLabel="Change email"
          >
            Change email
          </AppButton>

          {/* Phone Number */}
          <AppInput
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
            editable={!isUpdating}
            accessibilityLabel="Phone Number"
          />

          {/* Error Message */}
          {error && (
            <View
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.3)',
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <AppText style={{ color: '#F87171', fontSize: 14 }}>{error}</AppText>
            </View>
          )}

          {/* Save Button */}
          <AppButton
            variant="secondary"
            size="lg"
            onPress={handleSaveChanges}
            disabled={isUpdating || !hasProfileChanges}
            isLoading={isUpdating}
            accessibilityRole="button"
            accessibilityLabel="Save Changes"
          >
            Save Changes
          </AppButton>
        </View>

        {/* Bottom spacing for tab bar */}
        <View style={{ height: 96 }} />
      </ScrollView>
    </ScreenLayout>
  );
}
