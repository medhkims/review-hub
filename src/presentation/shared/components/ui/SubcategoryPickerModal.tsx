import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';

interface SubcategoryPickerModalProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string }[];
  values: string[];
  onClose: () => void;
  onConfirm: (values: string[]) => void;
}

export const SubcategoryPickerModal: React.FC<SubcategoryPickerModalProps> = ({
  visible,
  title,
  options,
  values,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string[]>(values);

  useEffect(() => {
    if (visible) setSelected(values);
  }, [visible]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        {/* Backdrop tap-to-close — absolute, avoids nested <button> on web */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
          accessibilityLabel={t('common.cancel')}
          accessibilityRole="button"
        />
        {/* Content — View (not Pressable) to avoid nested <button> on web */}
        <View
          style={{
            backgroundColor: colors.cardDark,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.borderDark,
            }}
          >
            <AppText style={{ fontSize: 17, fontWeight: '700', color: colors.white }}>
              {title}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
            </Pressable>
          </View>

          {/* Options list */}
          <ScrollView style={{ maxHeight: 340 }} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const isSelected = selected.includes(option.value);
              return (
                <Pressable
                  key={option.value}
                  onPress={() => toggle(option.value)}
                  accessibilityRole="checkbox"
                  accessibilityLabel={option.label}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 14,
                    backgroundColor: isSelected ? 'rgba(168,85,247,0.08)' : 'transparent',
                    borderBottomWidth: index < options.length - 1 ? 1 : 0,
                    borderBottomColor: colors.borderDark,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.neonPurple : colors.borderDark,
                      backgroundColor: isSelected ? colors.neonPurple : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 14,
                    }}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={13} color={colors.white} />
                    )}
                  </View>
                  <AppText
                    style={{
                      flex: 1,
                      fontSize: 15,
                      color: isSelected ? colors.white : colors.textSlate200,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Buttons */}
          <View
            style={{
              flexDirection: 'row',
              gap: 12,
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.borderDark,
            }}
          >
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.borderDark,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.textSlate400, fontWeight: '600' }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(selected)}
              accessibilityRole="button"
              accessibilityLabel={t('common.confirm')}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor: colors.neonPurple,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: colors.white, fontWeight: '600' }}>
                {selected.length > 1
                  ? `${t('common.confirm')} (${selected.length})`
                  : t('common.confirm')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};
