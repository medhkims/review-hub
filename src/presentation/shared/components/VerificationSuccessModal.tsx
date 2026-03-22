import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface VerificationSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
  fullName: string;
  onGoHome: () => void;
}

export const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
  visible,
  onClose,
  phoneNumber,
  fullName,
  onGoHome,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: theme.border }}>
          <Pressable
            onPress={onClose}
            accessibilityLabel={t('verification.close')}
            accessibilityRole="button"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          >
            <MaterialCommunityIcons name="close" size={24} color={theme.textMuted} />
          </Pressable>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="shield-check" size={32} color={colors.success} />
            </View>
          </View>

          <AppText style={{ fontSize: 16, color: theme.text, textAlign: 'center', marginBottom: 20 }}>
            {t('verification.successMessage')}
          </AppText>

          <View style={{ gap: 10, marginBottom: 24 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.background,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 12,
              gap: 10,
            }}>
              <MaterialCommunityIcons name="account" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                {fullName}
              </AppText>
            </View>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.background,
              borderRadius: 12,
              paddingHorizontal: 20,
              paddingVertical: 12,
              gap: 10,
            }}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 16, fontWeight: '600', color: theme.text }}>
                {phoneNumber}
              </AppText>
            </View>
          </View>

          <AppButton
            title={t('common.goBackToHome')}
            size="lg"
            shape="pill"
            onPress={onGoHome}
            accessibilityLabel={t('common.goBackToHome')}
          />

          <AppText style={{ fontSize: 13, color: theme.textMuted, textAlign: 'center', marginTop: 16, lineHeight: 18 }}>
            {t('verification.contactNotice')}
          </AppText>
        </View>
      </View>
    </Modal>
  );
};
