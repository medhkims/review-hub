import React, { useState, useEffect } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export type SortOption = 'top_rating' | 'top_result' | 'new_businesses';

interface SortBySheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (option: SortOption | null) => void;
  initialValue?: SortOption | null;
}

const SORT_OPTIONS: { key: SortOption; labelKey: string; icon: string }[] = [
  { key: 'top_rating', labelKey: 'sortBy.topRating', icon: 'star' },
  { key: 'top_result', labelKey: 'sortBy.topResult', icon: 'trophy' },
  { key: 'new_businesses', labelKey: 'sortBy.newBusinesses', icon: 'new-box' },
];

export const SortBySheet: React.FC<SortBySheetProps> = ({
  visible,
  onClose,
  onApply,
  initialValue,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selected, setSelected] = useState<SortOption | null>(initialValue ?? null);

  useEffect(() => {
    if (visible) {
      setSelected(initialValue ?? null);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel={t('common.close')}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: theme.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingBottom: 40,
            paddingTop: 12,
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.textMuted,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
              {t('sortBy.title')}
            </AppText>
            <Pressable onPress={onClose} accessibilityLabel={t('common.close')} accessibilityRole="button">
              <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Options */}
          {SORT_OPTIONS.map((option, index) => {
            const isSelected = selected === option.key;
            return (
              <React.Fragment key={option.key}>
                <Pressable
                  onPress={() => setSelected(isSelected ? null : option.key)}
                  accessibilityLabel={t(option.labelKey)}
                  accessibilityRole="radio"
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 16,
                    paddingHorizontal: 16,
                    borderRadius: 16,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: isSelected ? colors.neonPurple : 'transparent',
                    backgroundColor: isSelected ? 'rgba(168,85,247,0.08)' : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <MaterialCommunityIcons
                      name={option.icon as 'star'}
                      size={20}
                      color={isSelected ? colors.neonPurple : theme.textSecondary}
                    />
                    <AppText
                      style={{
                        fontSize: 16,
                        fontWeight: isSelected ? '600' : '400',
                        color: isSelected ? theme.text : theme.textSecondary,
                      }}
                    >
                      {t(option.labelKey)}
                    </AppText>
                  </View>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.neonPurple : theme.border,
                      backgroundColor: isSelected ? colors.neonPurple : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={14} color={colors.textWhite} />
                    )}
                  </View>
                </Pressable>
                {index < SORT_OPTIONS.length - 1 && (
                  <View style={{ height: 1, backgroundColor: theme.border, opacity: 0.5, marginHorizontal: 16 }} />
                )}
              </React.Fragment>
            );
          })}

          {/* Apply button */}
          <View style={{ marginTop: 24 }}>
            <AppButton
              title={t('sortBy.apply')}
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() => onApply(selected)}
              accessibilityLabel={t('sortBy.apply')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
