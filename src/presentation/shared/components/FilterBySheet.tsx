import React, { useState, useEffect } from 'react';
import { View, Modal, Pressable, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { AppButton } from './ui/AppButton';
import { SectionHeader } from './ui/SectionHeader';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export interface FilterState {
  categories: string[];
  subcategories: string[];
  platforms: string[];
  minRating: number;
}

export const DEFAULT_FILTER_STATE: FilterState = {
  categories: [],
  subcategories: [],
  platforms: [],
  minRating: 0,
};

const INFLUENCER_CATEGORY_ID = 'influencer';

const PLATFORM_OPTIONS = [
  { id: 'instagram', icon: 'instagram', labelKey: 'filterBy.platformInstagram' },
  { id: 'facebook', icon: 'facebook', labelKey: 'filterBy.platformFacebook' },
  { id: 'tiktok', icon: 'music-note', labelKey: 'filterBy.platformTiktok' },
  { id: 'youtube', icon: 'youtube', labelKey: 'filterBy.platformYoutube' },
  { id: 'other', icon: 'dots-horizontal', labelKey: 'filterBy.platformOther' },
] as const;

interface FilterBySheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters?: FilterState;
  showCategories?: boolean;
  availableCategories?: { id: string; name: string }[];
  showSubcategories?: boolean;
  availableSubcategories?: { id: string; name: string }[];
  /** Force-show the platforms dropdown (e.g. when already on the influencer category page) */
  showPlatforms?: boolean;
}

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
            name={icon as 'shape-outline'}
            size={18}
            color={hasSelection ? colors.neonPurple : theme.textMuted}
          />
          <AppText
            style={{ fontSize: 14, color: hasSelection ? theme.text : theme.textMuted, flex: 1 }}
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

      {isOpen && (
        <View
          style={{
            borderWidth: 1,
            borderTopWidth: 0,
            borderColor: colors.neonPurple,
            borderBottomLeftRadius: 14,
            borderBottomRightRadius: 14,
            overflow: 'hidden',
            maxHeight: 350,
          }}
        >
          <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={Platform.OS === 'web'}>
            {children}
          </ScrollView>
          <Pressable
            onPress={onConfirm}
            accessibilityLabel={confirmLabel}
            accessibilityRole="button"
            style={{ backgroundColor: colors.neonPurple, paddingVertical: 13, alignItems: 'center' }}
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
  showSubcategories = false,
  availableSubcategories = [],
  showPlatforms = false,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [subcategoryOpen, setSubcategoryOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);

  const showPlatformFilter =
    showPlatforms ||
    (selectedCategories.length === 1 && selectedCategories[0] === INFLUENCER_CATEGORY_ID);

  useEffect(() => {
    if (visible) {
      setSelectedCategories(initialFilters?.categories ?? []);
      setSelectedSubcategories(initialFilters?.subcategories ?? []);
      setSelectedPlatforms(initialFilters?.platforms ?? []);
      setMinRating(initialFilters?.minRating ?? 0);
      setCategoryOpen(false);
      setSubcategoryOpen(false);
      setPlatformOpen(false);
    }
  }, [visible]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const toggleSubcategory = (subId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subId) ? prev.filter((s) => s !== subId) : [...prev, subId],
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId) ? prev.filter((p) => p !== platformId) : [...prev, platformId],
    );
  };

  const handleReset = () => {
    setSelectedCategories([]);
    setSelectedSubcategories([]);
    setSelectedPlatforms([]);
    setMinRating(0);
    setCategoryOpen(false);
    setSubcategoryOpen(false);
    setPlatformOpen(false);
  };

  const categoryLabel =
    selectedCategories.length === 0
      ? t('filterBy.allCategories')
      : selectedCategories.length === 1
        ? (availableCategories.find((c) => c.id === selectedCategories[0])?.name ?? '')
        : t('filterBy.categoriesSelected', { count: selectedCategories.length });

  const subcategoryLabel =
    selectedSubcategories.length === 0
      ? t('filterBy.allSubcategories')
      : selectedSubcategories.length === 1
        ? (availableSubcategories.find((s) => s.id === selectedSubcategories[0])?.name ?? '')
        : t('filterBy.subcategoriesSelected', { count: selectedSubcategories.length });

  const platformLabel =
    selectedPlatforms.length === 0
      ? t('filterBy.allPlatforms')
      : selectedPlatforms.length === 1
        ? t(PLATFORM_OPTIONS.find((p) => p.id === selectedPlatforms[0])?.labelKey ?? '')
        : t('filterBy.platformsSelected', { count: selectedPlatforms.length });

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
            showsVerticalScrollIndicator={Platform.OS === 'web'}
            nestedScrollEnabled
          >
            {/* Categories Dropdown */}
            {showCategories && availableCategories.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <SectionHeader title={t('filterBy.categories')} />
                <Dropdown
                  icon="shape-outline"
                  placeholder={t('filterBy.allCategories')}
                  valueLabel={categoryLabel}
                  hasSelection={selectedCategories.length > 0}
                  isOpen={categoryOpen}
                  onToggle={() => setCategoryOpen((prev) => !prev)}
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

            {/* Subcategories Dropdown */}
            {showSubcategories && availableSubcategories.length > 0 && (
              <View style={{ marginBottom: 24 }}>
                <SectionHeader title={t('filterBy.subcategories')} />
                <Dropdown
                  icon="tag-outline"
                  placeholder={t('filterBy.allSubcategories')}
                  valueLabel={subcategoryLabel}
                  hasSelection={selectedSubcategories.length > 0}
                  isOpen={subcategoryOpen}
                  onToggle={() => setSubcategoryOpen((prev) => !prev)}
                  onConfirm={() => setSubcategoryOpen(false)}
                  confirmLabel={t('common.confirm')}
                >
                  {availableSubcategories.map((sub, index) => (
                    <CheckRow
                      key={sub.id}
                      label={sub.name}
                      isSelected={selectedSubcategories.includes(sub.id)}
                      onPress={() => toggleSubcategory(sub.id)}
                      isLast={index === availableSubcategories.length - 1}
                      altBg={index % 2 === 0}
                    />
                  ))}
                </Dropdown>
              </View>
            )}

            {/* Platforms Dropdown (only when Influencer category is selected) */}
            {showPlatformFilter && (
              <View style={{ marginBottom: 24 }}>
                <SectionHeader title={t('filterBy.platforms')} />
                <Dropdown
                  icon="cellphone-link"
                  placeholder={t('filterBy.allPlatforms')}
                  valueLabel={platformLabel}
                  hasSelection={selectedPlatforms.length > 0}
                  isOpen={platformOpen}
                  onToggle={() => setPlatformOpen((prev) => !prev)}
                  onConfirm={() => setPlatformOpen(false)}
                  confirmLabel={t('common.confirm')}
                >
                  {PLATFORM_OPTIONS.map((platform, index) => (
                    <CheckRow
                      key={platform.id}
                      label={t(platform.labelKey)}
                      isSelected={selectedPlatforms.includes(platform.id)}
                      onPress={() => togglePlatform(platform.id)}
                      isLast={index === PLATFORM_OPTIONS.length - 1}
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
              onPress={() => onApply({ categories: selectedCategories, subcategories: selectedSubcategories, platforms: selectedPlatforms, minRating })}
              accessibilityLabel={t('filterBy.apply')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
