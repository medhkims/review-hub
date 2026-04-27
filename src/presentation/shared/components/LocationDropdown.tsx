import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

const TUNISIA_CITIES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba',
  'La Marsa', 'Hammamet', 'Sidi Bou Said', 'Carthage',
  'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Nabeul', 'Bizerte',
  'Kairouan', 'Kasserine', 'Sidi Bouzid',
  'Gabès', 'Medenine', 'Tataouine',
  'Gafsa', 'Tozeur', 'Kebili',
  'Béja', 'Jendouba', 'Kef', 'Siliana', 'Zaghouan',
];

interface LocationDropdownProps {
  visible: boolean;
  initialLocations?: string[];
  onApply: (locations: string[]) => void;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  visible,
  initialLocations = [],
  onApply,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selected, setSelected] = useState<string[]>(initialLocations);

  useEffect(() => {
    if (visible) setSelected(initialLocations);
  }, [visible]);

  if (!visible) return null;

  const toggle = (city: string) => {
    setSelected((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 2,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.neonPurple,
        borderRadius: 16,
        backgroundColor: theme.card,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      }}
    >
      {/* City list */}
      <ScrollView
        style={{ maxHeight: 220 }}
        showsVerticalScrollIndicator={Platform.OS === 'web'}
        nestedScrollEnabled
      >
        {TUNISIA_CITIES.map((city, index) => {
          const isSelected = selected.includes(city);
          const isLast = index === TUNISIA_CITIES.length - 1;
          return (
            <Pressable
              key={city}
              onPress={() => toggle(city)}
              accessibilityLabel={city}
              accessibilityRole="checkbox"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 16,
                paddingVertical: 13,
                backgroundColor: isSelected
                  ? 'rgba(168,85,247,0.08)'
                  : index % 2 === 0
                    ? 'rgba(255,255,255,0.02)'
                    : 'transparent',
                borderBottomWidth: isLast ? 0 : 1,
                borderBottomColor: theme.border,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={16}
                  color={isSelected ? colors.neonPurple : theme.textMuted}
                />
                <AppText
                  style={{
                    fontSize: 14,
                    fontWeight: isSelected ? '600' : '400',
                    color: isSelected ? colors.neonPurple : theme.text,
                  }}
                >
                  {city}
                </AppText>
              </View>

              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  borderWidth: 1.5,
                  borderColor: isSelected ? colors.neonPurple : theme.border,
                  backgroundColor: isSelected ? colors.neonPurple : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSelected && (
                  <MaterialCommunityIcons name="check" size={13} color={colors.textWhite} />
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => setSelected([])}
          accessibilityRole="button"
          accessibilityLabel={t('filterBy.reset')}
        >
          <AppText style={{ fontSize: 13, fontWeight: '600', color: colors.neonPurple }}>
            {t('filterBy.reset')}
          </AppText>
        </Pressable>

        <Pressable
          onPress={() => onApply(selected)}
          style={{
            backgroundColor: colors.neonPurple,
            paddingHorizontal: 20,
            paddingVertical: 8,
            borderRadius: 20,
          }}
          accessibilityRole="button"
          accessibilityLabel={t('filterBy.apply')}
        >
          <AppText style={{ fontSize: 13, fontWeight: '700', color: colors.textWhite }}>
            {t('filterBy.apply')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};
