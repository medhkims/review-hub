import React, { useState, useEffect } from 'react';
import { View, Modal, ScrollView, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface SubcategoryPickerModalProps {
  visible: boolean;
  title: string;
  options: { label: string; value: string }[];
  values: string[];
  onClose: () => void;
  onConfirm: (values: string[]) => void;
  minSelect?: number;
}

export const SubcategoryPickerModal: React.FC<SubcategoryPickerModalProps> = ({
  visible,
  title,
  options,
  values,
  onClose,
  onConfirm,
  minSelect = 0,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
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
            backgroundColor: theme.card,
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
              borderBottomColor: theme.border,
            }}
          >
            <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
              {title}
            </AppText>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
            >
              <MaterialCommunityIcons name="close" size={22} color={theme.textSecondary} />
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
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.neonPurple : theme.border,
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
                      color: isSelected ? theme.text : theme.textSecondary,
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
              borderTopColor: theme.border,
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
                borderColor: theme.border,
                alignItems: 'center',
              }}
            >
              <AppText style={{ color: theme.textSecondary, fontWeight: '600' }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(selected)}
              disabled={minSelect > 0 && selected.length < minSelect}
              accessibilityRole="button"
              accessibilityLabel={t('common.confirm')}
              style={{
                flex: 1,
                paddingVertical: 13,
                borderRadius: 12,
                backgroundColor:
                  minSelect > 0 && selected.length < minSelect
                    ? theme.border
                    : colors.neonPurple,
                alignItems: 'center',
              }}
            >
              <AppText
                style={{
                  color:
                    minSelect > 0 && selected.length < minSelect
                      ? theme.textMuted
                      : colors.white,
                  fontWeight: '600',
                }}
              >
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
