import React, { useState, useEffect } from 'react';
import { View, Modal, Pressable, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { SectionHeader } from './ui/SectionHeader';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export interface FilterState {
  locations: string[];
  categories: string[];
  minRating: number;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  locations: [],
  categories: [],
  minRating: 0,
};

interface FilterBySheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
  showCategories?: boolean;
  availableCategories?: { id: string; name: string }[];
}

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

const RATING_OPTIONS = [
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

// ── Reusable Dropdown ─────────────────────────────────────────────────────────

interface DropdownProps {
  icon: string;
  placeholder: string;
  valueLabel: string;
  hasSelection: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  children: React.ReactNode;
}

const Dropdown: React.FC<DropdownProps> = ({
  icon,
  placeholder,
  valueLabel,
  hasSelection,
  isOpen,
  onToggle,
  onConfirm,
  confirmLabel,
  children,
}) => {
  const theme = useTheme();
  return (
  <View>
    {/* Trigger */}
    <Pressable
      onPress={onToggle}
      accessibilityLabel={valueLabel}
      accessibilityRole="button"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: isOpen ? colors.neonPurple : theme.border,
        borderRadius: 14,
        borderBottomLeftRadius: isOpen ? 0 : 14,
        borderBottomRightRadius: isOpen ? 0 : 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: 'rgba(255,255,255,0.04)',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
        <MaterialCommunityIcons
          name={icon as 'map-marker-outline'}
          size={18}
          color={hasSelection ? colors.neonPurple : theme.textMuted}
        />
        <AppText
          style={{
            fontSize: 14,
            color: hasSelection ? theme.text : theme.textMuted,
            flex: 1,
          }}
          numberOfLines={1}
        >
          {valueLabel || placeholder}
        </AppText>
      </View>
      <MaterialCommunityIcons
        name={isOpen ? 'chevron-up' : 'chevron-down'}
        size={20}
        color={theme.textSecondary}
      />
    </Pressable>

    {/* List */}
    {isOpen && (
      <View
        style={{
          borderWidth: 1,
          borderTopWidth: 0,
          borderColor: colors.neonPurple,
          borderBottomLeftRadius: 14,
          borderBottomRightRadius: 14,
          overflow: 'hidden',
          maxHeight: 260,
        }}
      >
        <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>

        {/* Confirm button inside dropdown */}
        <Pressable
          onPress={onConfirm}
          accessibilityLabel={confirmLabel}
          accessibilityRole="button"
          style={{
            backgroundColor: colors.neonPurple,
            paddingVertical: 13,
            alignItems: 'center',
          }}
        >
          <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.textWhite }}>
            {confirmLabel}
          </AppText>
        </Pressable>
      </View>
    )}
  </View>
  );
};

// ── Checkbox Row ──────────────────────────────────────────────────────────────

const CheckRow: React.FC<{
  label: string;
  isSelected: boolean;
  onPress: () => void;
  isLast?: boolean;
  altBg?: boolean;
}> = ({ label, isSelected, onPress, isLast = false, altBg = false }) => {
  const theme = useTheme();
  return (
  <Pressable
    onPress={onPress}
    accessibilityLabel={label}
    accessibilityRole="checkbox"
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 13,
      backgroundColor: isSelected
        ? 'rgba(168,85,247,0.08)'
        : altBg
          ? 'rgba(255,255,255,0.02)'
          : 'transparent',
      borderBottomWidth: isLast ? 0 : 1,
      borderBottomColor: theme.border,
    }}
  >
    <AppText
      style={{
        fontSize: 14,
        color: isSelected ? colors.neonPurple : theme.text,
        fontWeight: isSelected ? '600' : '400',
      }}
    >
      {label}
    </AppText>
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
};

// ── Main Component ────────────────────────────────────────────────────────────

export const FilterBySheet: React.FC<FilterBySheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  showCategories = false,
  availableCategories = [],
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [locationOpen, setLocationOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedLocations(initialFilters?.locations ?? []);
      setSelectedCategories(initialFilters?.categories ?? []);
      setMinRating(initialFilters?.minRating ?? 0);
      setLocationOpen(false);
      setCategoryOpen(false);
    }
  }, [visible]);

  const toggleLocation = (city: string) => {
    setSelectedLocations((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    );
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const handleReset = () => {
    setSelectedLocations([]);
    setSelectedCategories([]);
    setMinRating(0);
    setLocationOpen(false);
    setCategoryOpen(false);
  };

  const locationLabel =
    selectedLocations.length === 0
      ? t('filterBy.allCities')
      : selectedLocations.length === 1
        ? selectedLocations[0]
        : t('filterBy.citiesSelected', { count: selectedLocations.length });

  const categoryLabel =
    selectedCategories.length === 0
      ? t('filterBy.allCategories')
      : selectedCategories.length === 1
        ? (availableCategories.find((c) => c.id === selectedCategories[0])?.name ?? '')
        : t('filterBy.categoriesSelected', { count: selectedCategories.length });

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
            paddingBottom: 40,
            paddingTop: 12,
            maxHeight: '85%',
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.textMuted,
              borderRadius: 2,
              alignSelf: 'center',
              marginBottom: 16,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 24,
              marginBottom: 20,
            }}
          >
            <AppText style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
              {t('filterBy.title')}
            </AppText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Pressable
                onPress={handleReset}
                accessibilityLabel={t('filterBy.reset')}
                accessibilityRole="button"
              >
                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.neonPurple }}>
                  {t('filterBy.reset')}
                </AppText>
              </Pressable>
              <Pressable
                onPress={onClose}
                accessibilityLabel={t('common.close')}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            {/* Location Dropdown */}
            <View style={{ marginBottom: 24 }}>
              <SectionHeader title={t('filterBy.location')} />
              <Dropdown
                icon="map-marker-outline"
                placeholder={t('filterBy.allCities')}
                valueLabel={locationLabel}
                hasSelection={selectedLocations.length > 0}
                isOpen={locationOpen}
                onToggle={() => {
                  setLocationOpen((prev) => !prev);
                  setCategoryOpen(false);
                }}
                onConfirm={() => setLocationOpen(false)}
                confirmLabel={t('common.confirm')}
              >
                {TUNISIA_CITIES.map((city, index) => (
                  <CheckRow
                    key={city}
                    label={city}
                    isSelected={selectedLocations.includes(city)}
                    onPress={() => toggleLocation(city)}
                    isLast={index === TUNISIA_CITIES.length - 1}
                    altBg={index % 2 === 0}
                  />
                ))}
              </Dropdown>
            </View>

            {/* Categories Dropdown (only shown on non-category screens) */}
            {showCategories && availableCategories.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <SectionHeader title={t('filterBy.categories')} />
                <Dropdown
                  icon="shape-outline"
                  placeholder={t('filterBy.allCategories')}
                  valueLabel={categoryLabel}
                  hasSelection={selectedCategories.length > 0}
                  isOpen={categoryOpen}
                  onToggle={() => {
                    setCategoryOpen((prev) => !prev);
                    setLocationOpen(false);
                  }}
                  onConfirm={() => setCategoryOpen(false)}
                  confirmLabel={t('common.confirm')}
                >
                  {availableCategories.map((cat, index) => (
                    <CheckRow
                      key={cat.id}
                      label={cat.name}
                      isSelected={selectedCategories.includes(cat.id)}
                      onPress={() => toggleCategory(cat.id)}
                      isLast={index === availableCategories.length - 1}
                      altBg={index % 2 === 0}
                    />
                  ))}
                </Dropdown>
              </View>
            )}

            {/* Minimum Rating */}
            <View style={{ marginBottom: 8 }}>
              <SectionHeader title={t('filterBy.minRating')} />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {RATING_OPTIONS.map((opt) => {
                  const isActive = minRating === opt.value;
                  return (
                    <Pressable
                      key={opt.value}
                      onPress={() => setMinRating(isActive ? 0 : opt.value)}
                      accessibilityLabel={`${opt.label} stars minimum`}
                      accessibilityRole="button"
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        paddingVertical: 14,
                        borderRadius: 14,
                        borderWidth: 1,
                        borderColor: isActive ? colors.ratingGold : theme.border,
                        backgroundColor: isActive ? 'rgba(251,191,36,0.1)' : 'transparent',
                      }}
                    >
                      <MaterialCommunityIcons
                        name="star"
                        size={16}
                        color={isActive ? colors.ratingGold : theme.textMuted}
                      />
                      <AppText
                        style={{
                          fontSize: 15,
                          fontWeight: '700',
                          color: isActive ? colors.ratingGold : theme.textSecondary,
                        }}
                      >
                        {opt.label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Apply */}
          <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
            <AppButton
              title={t('filterBy.apply')}
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() =>
                onApply({ locations: selectedLocations, categories: selectedCategories, minRating })
              }
              accessibilityLabel={t('filterBy.apply')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
