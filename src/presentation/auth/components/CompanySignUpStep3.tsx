import React, { useState } from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

interface CompanySignUpStep3Props {
  onFinish: (data: CompanyStep3Data) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface CompanyStep3Data {
  logoUri: string | null;
  coverUri: string | null;
}

// --- Image Picker Upload Box ---

interface ImageUploadBoxProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  selectText: string;
  hintText: string;
  imageUri: string | null;
  onPick: () => void;
  onRemove: () => void;
  height: number;
}

const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label,
  icon,
  selectText,
  hintText,
  imageUri,
  onPick,
  onRemove,
  height,
}) => (
  <View>
    <AppText
      style={{
        color: colors.textSlate200,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 8,
        marginLeft: 4,
      }}
    >
      {label}
    </AppText>
    <Pressable
      onPress={onPick}
      accessibilityRole="button"
      accessibilityLabel={selectText}
      style={{
        width: '100%',
        height,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: colors.borderDark,
        borderRadius: 16,
        backgroundColor: colors.cardDark,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          accessibilityLabel={label}
        />
      ) : (
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons name={icon} size={24} color={colors.textSlate500} />
          </View>
          <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate200 }}>
            {selectText}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate500, marginTop: 4 }}>
            {hintText}
          </AppText>
        </View>
      )}
    </Pressable>
    {imageUri && (
      <Pressable
        onPress={onRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${label.toLowerCase()}`}
        style={{
          position: 'absolute',
          top: 36,
          right: 8,
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="close" size={18} color={colors.textWhite} />
      </Pressable>
    )}
  </View>
);

// --- Main Component ---

export const CompanySignUpStep3: React.FC<CompanySignUpStep3Props> = ({
  onFinish,
  onBack,
  isLoading = false,
}) => {
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const pickImage = async (
    setter: (uri: string | null) => void,
    aspect: [number, number],
  ) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const handleFinish = () => {
    onFinish({ logoUri, coverUri });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header: Back button + Title + Step */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textWhite} />
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite }}>
            Business Branding
          </AppText>
          <AppText
            style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400, marginTop: 2 }}
          >
            Step 3 of 3
          </AppText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar - full */}
      <View
        style={{
          height: 6,
          backgroundColor: colors.borderDark,
          borderRadius: 3,
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: colors.neonPurple,
            borderRadius: 3,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 3,
          }}
        />
      </View>

      {/* Title & subtitle */}
      <AppText
        style={{ fontSize: 28, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}
      >
        Connect visually
      </AppText>
      <AppText
        style={{ fontSize: 15, color: colors.textSlate400, marginBottom: 28, lineHeight: 22 }}
      >
        Upload your brand assets to make your profile stand out to potential customers.
      </AppText>

      {/* Upload fields */}
      <View style={{ gap: 24 }}>
        <ImageUploadBox
          label="Business Logo"
          icon="image-outline"
          selectText="Select logo"
          hintText="PNG, JPG up to 2MB"
          imageUri={logoUri}
          onPick={() => pickImage(setLogoUri, [1, 1])}
          onRemove={() => setLogoUri(null)}
          height={160}
        />

        <ImageUploadBox
          label="Cover Photo"
          icon="camera-outline"
          selectText="Select cover photo"
          hintText="16:9 ratio recommended"
          imageUri={coverUri}
          onPick={() => pickImage(setCoverUri, [16, 9])}
          onRemove={() => setCoverUri(null)}
          height={192}
        />
      </View>

      {/* Spacer so content isn't hidden behind fixed bottom bar */}
      <View style={{ height: 140 }} />

      {/* ===== BOTTOM FIXED BUTTON ===== */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -24,
          right: -24,
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(51, 65, 85, 0.5)',
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        }}
      >
        <AppButton
          title="Finish"
          onPress={handleFinish}
          isLoading={isLoading}
          size="lg"
          shape="pill"
          style={{
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Finish"
        />
      </View>
    </View>
  );
};
