import React, { useState, useCallback } from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ImageCropModal } from '@/presentation/shared/components/ui/ImageCropModal';
import { useImagePickerWithPreview } from '@/presentation/shared/hooks/useImagePickerWithPreview';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface CompanySignUpStep3Props {
  onFinish: (data: CompanyStep3Data) => void;
  onBack: () => void;
  isLoading?: boolean;
  error?: string | null;
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
}) => {
  const theme = useTheme();
  return (
    <View>
      <AppText
        style={{
          color: theme.text,
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
        accessibilityLabel={selectText}
        style={{
          width: '100%',
          height,
          borderWidth: 2,
          borderStyle: 'dashed',
          borderColor: theme.border,
          borderRadius: 16,
          backgroundColor: theme.card,
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
                backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(148,163,184,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <MaterialCommunityIcons name={icon} size={24} color={theme.textMuted} />
            </View>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: theme.text }}>
              {selectText}
            </AppText>
            <AppText style={{ fontSize: 12, color: theme.textMuted, marginTop: 4 }}>
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
};

// --- Main Component ---

export const CompanySignUpStep3: React.FC<CompanySignUpStep3Props> = ({
  onFinish,
  onBack,
  isLoading = false,
  error,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  const logoPicker = useImagePickerWithPreview({
    aspect: [1, 1],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setLogoUri(uri); }, []),
  });

  const coverPicker = useImagePickerWithPreview({
    aspect: [16, 9],
    quality: 0.8,
    onSelected: useCallback((uri: string) => { setCoverUri(uri); }, []),
  });

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
            backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(148,163,184,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
        </Pressable>

        <View style={{ alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>
            {t('auth.companySignUp.step3Title')}
          </AppText>
          <AppText
            style={{ fontSize: 12, fontWeight: '500', color: theme.textSecondary, marginTop: 2 }}
          >
            {t('auth.companySignUp.stepOf', { current: 3, total: 3 })}
          </AppText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar - full */}
      <View
        style={{
          height: 6,
          backgroundColor: theme.border,
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
        style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 8 }}
      >
        {t('auth.companySignUp.step3Subtitle')}
      </AppText>
      <AppText
        style={{ fontSize: 15, color: theme.textSecondary, marginBottom: 28, lineHeight: 22 }}
      >
        {t('auth.companySignUp.step3Description')}
      </AppText>

      {/* Upload fields */}
      <View style={{ gap: 24 }}>
        <ImageCropModal
          visible={logoPicker.isPreviewVisible}
          imageUri={logoPicker.pendingUri}
          onConfirm={logoPicker.confirmImage}
          onRetake={logoPicker.retakeImage}
          onCancel={logoPicker.cancelPreview}
          originalWidth={logoPicker.pendingWidth}
          originalHeight={logoPicker.pendingHeight}
          aspect={logoPicker.aspect}
        />
        <ImageCropModal
          visible={coverPicker.isPreviewVisible}
          imageUri={coverPicker.pendingUri}
          onConfirm={coverPicker.confirmImage}
          onRetake={coverPicker.retakeImage}
          onCancel={coverPicker.cancelPreview}
          originalWidth={coverPicker.pendingWidth}
          originalHeight={coverPicker.pendingHeight}
          aspect={coverPicker.aspect}
        />

        <ImageUploadBox
          label="Business Logo"
          icon="image-outline"
          selectText="Select logo"
          hintText="PNG, JPG up to 2MB"
          imageUri={logoUri}
          onPick={logoPicker.pickImage}
          onRemove={() => setLogoUri(null)}
          height={160}
        />

        <ImageUploadBox
          label="Cover Photo"
          icon="camera-outline"
          selectText="Select cover photo"
          hintText="16:9 ratio recommended"
          imageUri={coverUri}
          onPick={coverPicker.pickImage}
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
          backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241,245,249,0.95)',
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        }}
      >
        {error && (
          <View
            style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
            }}
          >
            <AppText style={{ color: '#F87171', fontSize: 14 }}>{error}</AppText>
          </View>
        )}
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
