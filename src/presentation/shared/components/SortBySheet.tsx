import React, { useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { colors } from '@/core/theme/colors';

type SortOption = 'recommended' | 'highest_rated' | 'most_reviewed' | 'nearest';

interface SortBySheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (option: SortOption) => void;
  initialValue?: SortOption;
}

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'recommended', label: 'Recommended' },
  { key: 'highest_rated', label: 'Highest Rated' },
  { key: 'most_reviewed', label: 'Most Reviewed' },
  { key: 'nearest', label: 'Nearest to Me' },
];

export const SortBySheet: React.FC<SortBySheetProps> = ({
  visible,
  onClose,
  onApply,
  initialValue = 'recommended',
}) => {
  const [selected, setSelected] = useState<SortOption>(initialValue);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel="Close sort options"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.cardDark,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 24,
            paddingBottom: 40,
            paddingTop: 12,
            borderTopWidth: 1,
            borderColor: colors.borderDark,
          }}
        >
          {/* Handle bar */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.textSlate500,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 20,
            }}
          />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>Sort By</AppText>
            <Pressable onPress={onClose} accessibilityLabel="Close" accessibilityRole="button">
              <MaterialCommunityIcons name="close" size={24} color={colors.textSlate400} />
            </Pressable>
          </View>

          {/* Options */}
          {SORT_OPTIONS.map((option, index) => {
            const isSelected = selected === option.key;
            return (
              <React.Fragment key={option.key}>
                <Pressable
                  onPress={() => setSelected(option.key)}
                  accessibilityLabel={`Sort by ${option.label}`}
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
                  <AppText
                    style={{
                      fontSize: 16,
                      fontWeight: isSelected ? '600' : '400',
                      color: isSelected ? colors.textWhite : colors.textSlate400,
                    }}
                  >
                    {option.label}
                  </AppText>
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.neonPurple : colors.borderDark,
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
                  <View style={{ height: 1, backgroundColor: colors.borderDark, opacity: 0.3, marginHorizontal: 16 }} />
                )}
              </React.Fragment>
            );
          })}

          {/* Apply button */}
          <View style={{ marginTop: 24 }}>
            <AppButton
              title="Apply Filters"
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() => onApply(selected)}
              accessibilityLabel="Apply sort filter"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
