import React, { useState, useEffect, useMemo, useRef } from 'react';
import { View, Modal, ScrollView, Pressable, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { SubcategoryPickerModal } from '@/presentation/shared/components/ui/SubcategoryPickerModal';
import { colors } from '@/core/theme/colors';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';

// ─── Searchable single-select ────────────────────────────────────────────────

interface SearchableSelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}

const SearchableSelectField: React.FC<SearchableSelectFieldProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  icon,
}) => {
  const inputRef = useRef<TextInput>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const selectedLabel = options.find((o) => o.value === value)?.label;

  const filteredOptions = useMemo(() => {
    const otherOption = options.find((o) => o.value === 'other');
    const mainOptions = options.filter((o) => o.value !== 'other');
    if (!searchText.trim()) {
      return otherOption ? [...mainOptions, otherOption] : mainOptions;
    }
    const lower = searchText.toLowerCase();
    const matches = mainOptions.filter((o) => o.label.toLowerCase().includes(lower));
    return otherOption ? [...matches, otherOption] : matches;
  }, [options, searchText]);

  const handleFocus = () => {
    setSearchText('');
    setIsOpen(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setSearchText('');
      setIsOpen(false);
    }, 200);
  };

  const handleSelect = (optionValue: string) => {
    onSelect(optionValue);
    setSearchText('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const displayValue = isOpen ? searchText : (selectedLabel ?? '');

  return (
    <View>
      <AppText
        style={{
          color: colors.textSlate200,
          fontSize: 14,
          fontWeight: '500',
          marginBottom: 6,
          marginLeft: 4,
        }}
      >
        {label}
      </AppText>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.cardDark,
          borderWidth: 1,
          borderColor: isOpen ? colors.neonPurple : colors.borderDark,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.textSlate400}
          style={{ marginRight: 12 }}
        />
        <TextInput
          ref={inputRef}
          value={displayValue}
          onChangeText={setSearchText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={colors.textSlate500}
          accessibilityLabel={label}
          style={{
            flex: 1,
            color: colors.textWhite,
            fontSize: 16,
            paddingVertical: 0,
          }}
        />
        {isOpen && searchText.length > 0 ? (
          <Pressable
            onPress={() => setSearchText('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear"
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons name="close-circle" size={18} color={colors.textSlate500} />
          </Pressable>
        ) : (
          <MaterialCommunityIcons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textSlate500}
          />
        )}
      </View>
      {isOpen && (
        <View
          style={{
            backgroundColor: colors.cardDark,
            borderWidth: 1,
            borderColor: colors.borderDark,
            borderRadius: 12,
            marginTop: 4,
            overflow: 'hidden',
          }}
          // @ts-expect-error: web-only — prevents TextInput blur before onPress fires
          onMouseDown={(e: { preventDefault: () => void }) => e.preventDefault()}
        >
          <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled">
            {filteredOptions.map((option, index) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                accessibilityRole="menuitem"
                accessibilityLabel={option.label}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  backgroundColor:
                    value === option.value ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                  borderBottomWidth: index < filteredOptions.length - 1 ? 1 : 0,
                  borderBottomColor: colors.borderDark,
                }}
              >
                <AppText
                  style={{
                    fontSize: 15,
                    color: value === option.value ? colors.neonPurple : colors.textSlate200,
                    fontWeight: value === option.value ? '600' : '400',
                  }}
                >
                  {option.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

// ─── Category / sub-category options ─────────────────────────────────────────

const CATEGORY_OPTIONS = CATEGORIES_DATA.map((c) => ({ label: c.name, value: c.id }));

const SUB_CATEGORY_OPTIONS: Record<string, { label: string; value: string }[]> =
  Object.fromEntries(
    CATEGORIES_DATA.map((c) => [
      c.id,
      c.subcategories.map((s) => ({ label: s.name, value: s.id })),
    ]),
  );

// ─── Modal ───────────────────────────────────────────────────────────────────

interface CategoryPickerModalProps {
  visible: boolean;
  currentCategoryId?: string;
  currentSubcategoryIds?: string[];
  onClose: () => void;
  onSave: (categoryId: string, categoryName: string, subcategoryIds: string[]) => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  currentCategoryId,
  currentSubcategoryIds,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();
  const [selectedCategoryId, setSelectedCategoryId] = useState(currentCategoryId ?? '');
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>(currentSubcategoryIds ?? []);
  const [subcategoryPickerVisible, setSubcategoryPickerVisible] = useState(false);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setSelectedCategoryId(currentCategoryId ?? '');
      setSelectedSubcategoryIds(currentSubcategoryIds ?? []);
      setSubcategoryError(null);
    }
  }, [visible, currentCategoryId, currentSubcategoryIds]);

  const availableSubCategories = useMemo(
    () => (selectedCategoryId ? SUB_CATEGORY_OPTIONS[selectedCategoryId] ?? [] : []),
    [selectedCategoryId],
  );

  const subcategoryDisplayText = useMemo(() => {
    if (selectedSubcategoryIds.length === 0) return '';
    if (selectedSubcategoryIds.length === 1) {
      return availableSubCategories.find((o) => o.value === selectedSubcategoryIds[0])?.label ?? '';
    }
    return `${selectedSubcategoryIds.length} ${t('businessOwner.companyProfile.subcategory').toLowerCase()} selected`;
  }, [selectedSubcategoryIds, availableSubCategories, t]);

  const handleSave = () => {
    const cat = CATEGORIES_DATA.find((c) => c.id === selectedCategoryId);
    if (!cat) return;
    if (availableSubCategories.length > 0 && selectedSubcategoryIds.length === 0) {
      setSubcategoryError(t('businessOwner.companyProfile.subcategoryRequired'));
      return;
    }
    setSubcategoryError(null);
    onSave(cat.id, cat.name, selectedSubcategoryIds);
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' }}>
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
              backgroundColor: colors.midnight,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 24,
              paddingTop: 16,
              paddingBottom: 40,
              maxHeight: '85%',
            }}
          >
            {/* Drag handle */}
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.borderDark,
                alignSelf: 'center',
                marginBottom: 20,
              }}
            />

            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
                {t('businessOwner.companyProfile.changeCategory')}
              </AppText>
              <Pressable
                onPress={onClose}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons name="close" size={22} color={colors.textSlate400} />
              </Pressable>
            </View>

            {/* Fields */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={{ gap: 16, paddingBottom: 24 }}>
                {/* Category searchable dropdown */}
                <SearchableSelectField
                  label={t('businessOwner.companyProfile.changeCategory')}
                  placeholder="Select category"
                  value={selectedCategoryId}
                  options={CATEGORY_OPTIONS}
                  onSelect={(val) => {
                    setSelectedCategoryId(val);
                    setSelectedSubcategoryIds([]);
                    setSubcategoryError(null);
                  }}
                  icon="shape-outline"
                />

                {/* Sub-category — tappable field that opens a popup */}
                {availableSubCategories.length > 0 && (
                  <View>
                    <AppText
                      style={{
                        color: colors.textSlate200,
                        fontSize: 14,
                        fontWeight: '500',
                        marginBottom: 6,
                        marginLeft: 4,
                      }}
                    >
                      {t('businessOwner.companyProfile.subcategory')}
                    </AppText>
                    <Pressable
                      onPress={() => setSubcategoryPickerVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel={t('businessOwner.companyProfile.subcategory')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.cardDark,
                        borderWidth: 1,
                        borderColor: subcategoryError ? '#EF4444' : colors.borderDark,
                        borderRadius: 16,
                        paddingHorizontal: 16,
                        height: 52,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="subdirectory-arrow-right"
                        size={20}
                        color={colors.textSlate400}
                        style={{ marginRight: 12 }}
                      />
                      <AppText
                        style={{
                          flex: 1,
                          fontSize: 16,
                          color: subcategoryDisplayText ? colors.white : colors.textSlate500,
                        }}
                      >
                        {subcategoryDisplayText || 'Select sub-categories'}
                      </AppText>
                      <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={colors.textSlate500}
                      />
                    </Pressable>
                    {subcategoryError && (
                      <AppText
                        style={{
                          color: '#EF4444',
                          fontSize: 12,
                          marginTop: 6,
                          marginLeft: 4,
                        }}
                      >
                        {subcategoryError}
                      </AppText>
                    )}
                  </View>
                )}
              </View>
            </ScrollView>

            {/* Action buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={onClose}
                accessibilityLabel={t('common.cancel')}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 14,
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
                onPress={handleSave}
                accessibilityLabel={t('businessOwner.companyProfile.saveChanges')}
                accessibilityRole="button"
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: 12,
                  backgroundColor: selectedCategoryId ? colors.neonPurple : colors.borderDark,
                  alignItems: 'center',
                }}
              >
                <AppText style={{ color: colors.white, fontWeight: '600' }}>
                  {t('businessOwner.companyProfile.saveChanges')}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subcategory popup — separate modal rendered outside the category sheet */}
      <SubcategoryPickerModal
        visible={subcategoryPickerVisible}
        title={t('businessOwner.companyProfile.subcategory')}
        options={availableSubCategories}
        values={selectedSubcategoryIds}
        onClose={() => setSubcategoryPickerVisible(false)}
        onConfirm={(vals) => {
          setSelectedSubcategoryIds(vals);
          if (vals.length > 0) setSubcategoryError(null);
          setSubcategoryPickerVisible(false);
        }}
      />
    </>
  );
};
