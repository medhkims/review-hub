import React, { useMemo } from 'react';
import { View, Pressable, FlatList } from 'react-native';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface DateSelectorProps {
  availableDays: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

interface DateItem {
  key: string;
  dayShort: string;
  dayNum: number;
  monthShort: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({ availableDays, selectedDate, onSelectDate }) => {
  const theme = useTheme();

  const dates = useMemo(() => {
    const result: DateItem[] = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = DAY_NAMES[d.getDay()];
      if (availableDays.includes(dayName)) {
        result.push({
          key: formatDateKey(d),
          dayShort: SHORT_DAYS[d.getDay()],
          dayNum: d.getDate(),
          monthShort: MONTHS_SHORT[d.getMonth()],
        });
      }
    }
    return result;
  }, [availableDays]);

  const renderItem = ({ item }: { item: DateItem }) => {
    const isSelected = item.key === selectedDate;
    return (
      <Pressable
        onPress={() => onSelectDate(item.key)}
        accessibilityRole="button"
        accessibilityLabel={`${item.dayShort} ${item.monthShort} ${item.dayNum}`}
        style={{
          width: 68,
          paddingVertical: 12,
          marginRight: 10,
          borderRadius: 14,
          alignItems: 'center',
          backgroundColor: isSelected ? colors.primary : theme.card,
          borderWidth: isSelected ? 0 : 1,
          borderColor: theme.border,
        }}
      >
        <AppText style={{ fontSize: 12, color: isSelected ? colors.white : theme.textMuted, marginBottom: 4 }}>
          {item.dayShort}
        </AppText>
        <AppText style={{ fontSize: 20, fontWeight: '700', color: isSelected ? colors.white : theme.text }}>
          {item.dayNum}
        </AppText>
        <AppText style={{ fontSize: 12, color: isSelected ? colors.white : theme.textSecondary, marginTop: 2 }}>
          {item.monthShort}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View>
      <FlatList
        data={dates}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    </View>
  );
};
