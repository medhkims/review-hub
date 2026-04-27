import React from 'react';
import { View, Pressable } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { TimeSlot } from '@/domain/booking/entities/bookingConfigEntity';

interface TimeSlotGridProps {
  slots: TimeSlot[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({ slots, selectedSlot, onSelectSlot }) => {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 10 }}>
      {slots.map((slot) => {
        const label = `${slot.start} - ${slot.end}`;
        const isSelected = slot.start === selectedSlot;
        return (
          <Pressable
            key={slot.start}
            onPress={() => onSelectSlot(slot.start)}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: isSelected ? colors.primary : theme.card,
              borderWidth: isSelected ? 0 : 1,
              borderColor: theme.border,
            }}
          >
            <AppText style={{ fontSize: 14, fontWeight: isSelected ? '600' : '400', color: isSelected ? colors.white : theme.text }}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};
