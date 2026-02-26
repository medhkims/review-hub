import React, { useState } from 'react';
import { View, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { SectionHeader } from './ui/SectionHeader';
import { colors } from '@/core/theme/colors';

interface FilterState {
  location: string | null;
  categories: string[];
  minRating: number;
}

interface FilterBySheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

const LOCATIONS = ['All', 'Tunis', 'Sousse', 'La Marsa', 'Hammamet', 'Sidi Bou Said'];
const CATEGORIES = ['All', 'Food', 'Shopping', 'Services', 'Beauty', 'Hotels', 'Gym', 'Health'];
const RATINGS = [1, 2, 3, 4, 5];

const ChipButton: React.FC<{
  label: string;
  isActive: boolean;
  onPress: () => void;
}> = ({ label, isActive, onPress }) => (
  <Pressable
    onPress={onPress}
    accessibilityLabel={label}
    accessibilityRole="button"
    style={{
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isActive ? colors.neonPurple : colors.borderDark,
      backgroundColor: isActive ? 'rgba(168,85,247,0.12)' : 'transparent',
      marginRight: 8,
      marginBottom: 8,
    }}
  >
    <AppText
      style={{
        fontSize: 13,
        fontWeight: isActive ? '600' : '400',
        color: isActive ? colors.neonPurple : colors.textSlate400,
      }}
    >
      {label}
    </AppText>
  </Pressable>
);

export const FilterBySheet: React.FC<FilterBySheetProps> = ({ visible, onClose, onApply }) => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>('All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['All']);
  const [minRating, setMinRating] = useState(0);

  const toggleCategory = (cat: string) => {
    if (cat === 'All') {
      setSelectedCategories(['All']);
      return;
    }
    setSelectedCategories((prev) => {
      const filtered = prev.filter((c) => c !== 'All');
      if (filtered.includes(cat)) {
        const result = filtered.filter((c) => c !== cat);
        return result.length === 0 ? ['All'] : result;
      }
      return [...filtered, cat];
    });
  };

  const handleReset = () => {
    setSelectedLocation('All');
    setSelectedCategories(['All']);
    setMinRating(0);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}
        onPress={onClose}
        accessibilityLabel="Close filters"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.cardDark,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingBottom: 40,
            paddingTop: 12,
            maxHeight: '80%',
            borderTopWidth: 1,
            borderColor: colors.borderDark,
          }}
        >
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: colors.textSlate500, borderRadius: 2, alignSelf: 'center', marginBottom: 16 }} />

          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 20 }}>
            <AppText style={{ fontSize: 20, fontWeight: '700', color: colors.textWhite }}>Filter By</AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable onPress={handleReset} accessibilityLabel="Reset filters" accessibilityRole="button">
                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>Reset</AppText>
              </Pressable>
              <Pressable onPress={onClose} accessibilityLabel="Close" accessibilityRole="button">
                <MaterialCommunityIcons name="close" size={24} color={colors.textSlate400} />
              </Pressable>
            </View>
          </View>

          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
            {/* Location */}
            <View style={{ marginBottom: 24 }}>
              <SectionHeader title="LOCATION" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {LOCATIONS.map((loc) => (
                  <ChipButton key={loc} label={loc} isActive={selectedLocation === loc} onPress={() => setSelectedLocation(loc)} />
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={{ marginBottom: 24 }}>
              <SectionHeader title="CATEGORIES" />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {CATEGORIES.map((cat) => (
                  <ChipButton
                    key={cat}
                    label={cat}
                    isActive={selectedCategories.includes(cat)}
                    onPress={() => toggleCategory(cat)}
                  />
                ))}
              </View>
            </View>

            {/* Minimum Rating */}
            <View style={{ marginBottom: 8 }}>
              <SectionHeader title="MINIMUM RATING" />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {RATINGS.map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setMinRating(r === minRating ? 0 : r)}
                    accessibilityLabel={`${r} stars minimum`}
                    accessibilityRole="button"
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: minRating === r ? colors.ratingGold : colors.borderDark,
                      backgroundColor: minRating === r ? 'rgba(251,191,36,0.1)' : 'transparent',
                    }}
                  >
                    <MaterialCommunityIcons name="star" size={16} color={minRating >= r ? colors.ratingGold : colors.textSlate500} />
                    <AppText style={{ fontSize: 13, fontWeight: '600', color: minRating === r ? colors.ratingGold : colors.textSlate400 }}>
                      {r}+
                    </AppText>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Apply */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <AppButton
              title="Apply Filters"
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() => onApply({ location: selectedLocation, categories: selectedCategories, minRating })}
              accessibilityLabel="Apply filters"
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
