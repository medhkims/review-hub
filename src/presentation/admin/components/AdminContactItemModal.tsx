import React, { useEffect, useState } from 'react';
import {
  View,
  Modal,
  Pressable,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AdminContactItem, VisibleTo } from '@/domain/admin/entities/adminInfoEntity';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

const ALL_ROLES: { key: VisibleTo; labelKey: string }[] = [
  { key: 'business_owner', labelKey: 'adminInfo.businessOwner' },
  { key: 'simple_user', labelKey: 'adminInfo.user' },
  { key: 'moderator', labelKey: 'adminInfo.moderator' },
];

interface Props {
  visible: boolean;
  type: 'email' | 'phone';
  initial?: AdminContactItem;
  onSave: (item: AdminContactItem) => void;
  onClose: () => void;
}

export const AdminContactItemModal: React.FC<Props> = ({
  visible,
  type,
  initial,
  onSave,
  onClose,
}) => {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [visibleTo, setVisibleTo] = useState<VisibleTo[]>([]);

  useEffect(() => {
    if (visible) {
      setLabel(initial?.label ?? '');
      setValue(initial?.value ?? '');
      setVisibleTo(initial?.visibleTo ?? []);
    }
  }, [visible, initial]);

  const toggleRole = (role: VisibleTo) => {
    setVisibleTo((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  const handleSave = () => {
    if (!value.trim()) return;
    onSave({
      id: initial?.id ?? `${type}_${Date.now()}`,
      label: label.trim(),
      value: value.trim(),
      visibleTo,
    });
    onClose();
  };

  const valuePlaceholder =
    type === 'email' ? t('adminInfo.emailPlaceholder') : t('adminInfo.phonePlaceholder');
  const title =
    initial
      ? type === 'email' ? t('adminInfo.editEmail') : t('adminInfo.editPhone')
      : type === 'email' ? t('adminInfo.addEmail') : t('adminInfo.addPhone');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, justifyContent: 'flex-end' }}
      >
        <Pressable style={{ flex: 1 }} onPress={onClose} />
        <View
          style={{
            backgroundColor: colors.cardDark,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: Platform.OS === 'ios' ? 40 : 24,
            borderTopWidth: 1,
            borderColor: colors.borderDark,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderDark,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white, marginBottom: 20 }}>
            {title}
          </AppText>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Label */}
            <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 6 }}>
              {t('adminInfo.label')}
            </AppText>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={t('adminInfo.labelPlaceholder')}
              placeholderTextColor={colors.textSlate400}
              style={{
                backgroundColor: colors.midnight,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.white,
                fontSize: 15,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: colors.borderDark,
              }}
              accessibilityLabel={t('adminInfo.label')}
            />

            {/* Value */}
            <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 6 }}>
              {type === 'email' ? t('adminInfo.emails') : t('adminInfo.phones')}
            </AppText>
            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={valuePlaceholder}
              placeholderTextColor={colors.textSlate400}
              keyboardType={type === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              style={{
                backgroundColor: colors.midnight,
                borderRadius: 12,
                paddingHorizontal: 14,
                paddingVertical: 12,
                color: colors.white,
                fontSize: 15,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: colors.borderDark,
              }}
              accessibilityLabel={valuePlaceholder}
            />

            {/* Visible To */}
            <AppText style={{ fontSize: 12, color: colors.textSlate400, marginBottom: 10 }}>
              {t('adminInfo.visibleTo')}
            </AppText>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {ALL_ROLES.map(({ key, labelKey }) => {
                const active = visibleTo.includes(key);
                return (
                  <Pressable
                    key={key}
                    onPress={() => toggleRole(key)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={t(labelKey)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: active ? colors.neonPurple : colors.borderDark,
                      backgroundColor: active ? `${colors.neonPurple}20` : 'transparent',
                    }}
                  >
                    <MaterialCommunityIcons
                      name={active ? 'check-circle' : 'circle-outline'}
                      size={16}
                      color={active ? colors.neonPurple : colors.textSlate400}
                    />
                    <AppText
                      style={{
                        fontSize: 13,
                        color: active ? colors.white : colors.textSlate400,
                        fontWeight: active ? '600' : '400',
                      }}
                    >
                      {t(labelKey)}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            {/* Actions */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel={t('common.cancel')}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.borderDark,
                  alignItems: 'center',
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>
                  {t('common.cancel')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={handleSave}
                disabled={!value.trim()}
                accessibilityRole="button"
                accessibilityLabel={t('common.save')}
                style={({ pressed }) => ({
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: value.trim() ? colors.neonPurple : colors.borderDark,
                  alignItems: 'center',
                  opacity: pressed ? 0.8 : 1,
                })}
              >
                <AppText style={{ color: colors.white, fontWeight: '700' }}>
                  {t('common.save')}
                </AppText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
