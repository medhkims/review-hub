import React from 'react';
import { Modal, View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

interface VerificationSuccessModalProps {
  visible: boolean;
  onClose: () => void;
  phoneNumber: string;
  onChangeDetails: () => void;
}

export const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
  visible,
  onClose,
  phoneNumber,
  onChangeDetails,
}) => {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: colors.cardDark, borderRadius: 20, padding: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }}>
          <Pressable
            onPress={onClose}
            accessibilityLabel={t('verification.close')}
            accessibilityRole="button"
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          >
            <MaterialCommunityIcons name="close" size={24} color={colors.textSlate400} />
          </Pressable>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(34,197,94,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="shield-check" size={32} color={colors.success} />
            </View>
          </View>

          <AppText style={{ fontSize: 16, color: colors.textWhite, textAlign: 'center', marginBottom: 20 }}>
            {t('verification.successMessage')}
          </AppText>

          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.midnight,
              borderRadius: 9999,
              paddingHorizontal: 20,
              paddingVertical: 12,
              gap: 10,
            }}>
              <MaterialCommunityIcons name="phone" size={18} color={colors.neonPurple} />
              <AppText style={{ fontSize: 16, fontWeight: '600', color: colors.textWhite }}>
                {phoneNumber}
              </AppText>
            </View>
          </View>

          <AppButton
            title={t('verification.changeDetails')}
            size="lg"
            shape="pill"
            onPress={onChangeDetails}
            accessibilityLabel={t('verification.changeDetails')}
          />

          <AppText style={{ fontSize: 13, color: colors.textSlate400, textAlign: 'center', marginTop: 20, lineHeight: 18 }}>
            {t('verification.contactNotice')}
          </AppText>
        </View>
      </View>
    </Modal>
  );
};
