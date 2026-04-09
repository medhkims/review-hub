import React from 'react';
import {
  Modal,
  View,
  Image,
  Pressable,
  Dimensions,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewModalProps {
  visible: boolean;
  imageUri: string | null;
  onConfirm: () => void;
  onRetake: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUri,
  onConfirm,
  onRetake,
  onCancel,
  isLoading = false,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent={Platform.OS !== 'web'}
      onRequestClose={onCancel}
    >
      {Platform.OS !== 'web' && <StatusBar barStyle="light-content" backgroundColor="#000" />}
      <View style={{ flex: 1, backgroundColor: '#000' }}>

        {/* Top bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'web' ? 16 : 52,
            paddingBottom: 12,
          }}
        >
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            hitSlop={8}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="close" size={22} color="#fff" />
          </Pressable>

          <AppText
            style={{ fontSize: 16, fontWeight: '600', color: '#fff', letterSpacing: 0.2 }}
          >
            {t('imagePreview.title')}
          </AppText>

          <View style={{ width: 40 }} />
        </View>

        {/* Image preview — pointerEvents none so the image doesn't absorb taps */}
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          pointerEvents="none"
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT * 0.62 }}
              resizeMode="contain"
              accessibilityLabel={t('imagePreview.title')}
            />
          ) : (
            <View
              style={{
                width: SCREEN_WIDTH,
                height: SCREEN_HEIGHT * 0.62,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size="large" color={colors.neonPurple} />
            </View>
          )}
        </View>

        {/* Bottom action panel */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: Platform.OS === 'web' ? 24 : 40,
            backgroundColor: 'rgba(15,23,42,0.96)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(255,255,255,0.08)',
            gap: 12,
          }}
        >
          <AppText
            style={{
              fontSize: 13,
              color: colors.textSlate400,
              textAlign: 'center',
              marginBottom: 4,
            }}
          >
            {t('imagePreview.hint')}
          </AppText>

          {/* Use Photo — plain Pressable to avoid web event propagation issues */}
          <Pressable
            onPress={onConfirm}
            disabled={isLoading || !imageUri}
            accessibilityRole="button"
            accessibilityLabel={t('imagePreview.usePhoto')}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 16,
              borderRadius: 14,
              backgroundColor: isLoading || !imageUri
                ? `${colors.neonPurple}80`
                : colors.neonPurple,
              opacity: pressed ? 0.85 : 1,
              shadowColor: colors.neonPurple,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.45,
              shadowRadius: 14,
              elevation: 8,
            })}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <AppText style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>
                {t('imagePreview.usePhoto')}
              </AppText>
            )}
          </Pressable>

          <Pressable
            onPress={onRetake}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel={t('imagePreview.retake')}
            style={({ pressed }) => ({
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.15)',
              opacity: pressed || isLoading ? 0.6 : 1,
              backgroundColor: 'rgba(255,255,255,0.05)',
              flexDirection: 'row',
              gap: 8,
            })}
          >
            <MaterialCommunityIcons name="crop-rotate" size={18} color={colors.textSlate100} />
            <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.textSlate100 }}>
              {t('imagePreview.retake')}
            </AppText>
          </Pressable>
        </View>

      </View>
    </Modal>
  );
};
