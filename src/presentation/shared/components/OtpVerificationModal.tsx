import React, { useRef, useState, useCallback } from 'react';
import { Modal, View, TextInput, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

const OTP_LENGTH = 6;

interface OtpVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  onResend: () => void;
}

export const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({
  visible,
  onClose,
  onVerify,
  onResend,
}) => {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const refs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

  const handleChange = useCallback((text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LENGTH - 1) {
      refs.current[index + 1]?.focus();
    }
  }, []);

  const handleKeyPress = useCallback(
    (key: string, index: number) => {
      if (key === 'Backspace' && !digits[index] && index > 0) {
        refs.current[index - 1]?.focus();
      }
    },
    [digits],
  );

  const handleVerify = useCallback(() => {
    onVerify(digits.join(''));
  }, [digits, onVerify]);

  const isFilled = digits.every((d) => d !== '');

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

          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(168,85,247,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <MaterialCommunityIcons name="lock" size={28} color={colors.neonPurple} />
            </View>
          </View>

          <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite, textAlign: 'center', marginBottom: 8 }}>
            {t('verification.otpTitle')}
          </AppText>
          <AppText style={{ fontSize: 14, color: colors.textSlate400, textAlign: 'center', marginBottom: 24 }}>
            {t('verification.otpSubtitle')}
          </AppText>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(el) => { refs.current[i] = el; }}
                value={digit}
                onChangeText={(text) => handleChange(text, i)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry={digit !== ''}
                accessibilityLabel={t('verification.otpInputLabel', { index: i + 1 })}
                style={{
                  width: 48,
                  height: 56,
                  borderRadius: 12,
                  backgroundColor: colors.cardDark,
                  borderWidth: 1,
                  borderColor: i === digits.findIndex((d) => d === '') ? colors.neonPurple : colors.borderDark,
                  color: colors.textWhite,
                  fontSize: 20,
                  fontWeight: '700',
                  textAlign: 'center',
                }}
              />
            ))}
          </View>

          <AppButton
            title={t('verification.verify')}
            size="lg"
            shape="pill"
            onPress={handleVerify}
            disabled={!isFilled}
            accessibilityLabel={t('verification.verify')}
            icon={<MaterialCommunityIcons name="arrow-right" size={20} color={colors.textWhite} />}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
              {t('verification.didntReceive')}{' '}
            </AppText>
            <Pressable onPress={onResend} accessibilityLabel={t('verification.resend')} accessibilityRole="button">
              <AppText style={{ fontSize: 14, color: colors.neonPurple, fontWeight: '600' }}>
                {t('verification.resend')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
