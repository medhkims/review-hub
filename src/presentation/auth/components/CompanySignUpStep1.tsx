import React, { useMemo, useRef, useState } from 'react';
import { View, Pressable, TextInput, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { SubcategoryPickerModal } from '@/presentation/shared/components/ui/SubcategoryPickerModal';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';

interface CompanySignUpStep1Props {
  onNext: () => void;
  onBack: () => void;
  isLoading?: boolean;
  formData: CompanyStep1Data;
  onFormChange: (updates: Partial<CompanyStep1Data>) => void;
}

export interface CompanyStep1Data {
  businessName: string;
  category: string;
  subCategories: string[];
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// --- Reusable icon text field ---

interface IconInputFieldProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  autoComplete?: TextInput['props']['autoComplete'];
  textContentType?: TextInput['props']['textContentType'];
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
}

const IconInputField: React.FC<IconInputFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  textContentType,
  rightIcon,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View>
      <AppText
        style={{
          color: theme.text,
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
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.textSecondary}
          style={{ marginRight: 12 }}
        />
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          placeholderTextColor={theme.textMuted}
          accessibilityLabel={label}
          style={{
            flex: 1,
            color: theme.text,
            fontSize: 16,
            paddingVertical: 0,
          }}
        />
        {isPassword && (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
            hitSlop={8}
            style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <MaterialCommunityIcons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>
        )}
        {rightIcon && !isPassword && (
          <MaterialCommunityIcons name={rightIcon} size={20} color={theme.textMuted} />
        )}
      </View>
    </View>
  );
};

// --- Searchable select dropdown ---

interface SearchableSelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  disabled?: boolean;
}

const SearchableSelectField: React.FC<SearchableSelectFieldProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  icon,
  disabled = false,
}) => {
  const theme = useTheme();
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
    if (!disabled) {
      setSearchText('');
      setIsOpen(true);
    }
  };

  // Delay close so an option tap registers before the dropdown disappears
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

  // While open, show what the user is typing; while closed, show the selected label
  const displayValue = isOpen ? searchText : (selectedLabel ?? '');

  return (
    <View style={{ opacity: disabled ? 0.6 : 1 }}>
      <AppText
        style={{
          color: theme.text,
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
          backgroundColor: theme.card,
          borderWidth: 1,
          borderColor: isOpen ? colors.neonPurple : theme.border,
          borderRadius: 16,
          paddingHorizontal: 16,
          height: 52,
        }}
      >
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={theme.textSecondary}
          style={{ marginRight: 12 }}
        />
        <TextInput
          ref={inputRef}
          value={displayValue}
          onChangeText={setSearchText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          editable={!disabled}
          accessibilityLabel={label}
          style={{
            flex: 1,
            color: theme.text,
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
            <MaterialCommunityIcons name="close-circle" size={18} color={theme.textMuted} />
          </Pressable>
        ) : (
          <MaterialCommunityIcons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.textMuted}
          />
        )}
      </View>
      {isOpen && (
        <View
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.border,
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
                  borderBottomColor: theme.border,
                }}
              >
                <AppText
                  style={{
                    fontSize: 15,
                    color: value === option.value ? colors.neonPurple : theme.text,
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

// (MultiSelectField removed — subcategory selection now uses SubcategoryPickerModal popup)

// --- Section header ---

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const theme = useTheme();
  return (
    <AppText
      style={{
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        marginLeft: 4,
      }}
    >
      {title}
    </AppText>
  );
};

const Divider: React.FC = () => {
  const theme = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 4,
        opacity: 0.5,
      }}
    />
  );
};

// --- Constants derived from canonical category data ---

const CATEGORY_OPTIONS = CATEGORIES_DATA.map((c) => ({ label: c.name, value: c.id }));

const SUB_CATEGORY_OPTIONS: Record<string, { label: string; value: string }[]> =
  Object.fromEntries(
    CATEGORIES_DATA.map((c) => [
      c.id,
      c.subcategories.map((s) => ({ label: s.name, value: s.id })),
    ]),
  );

// --- Main Component ---

export const CompanySignUpStep1: React.FC<CompanySignUpStep1Props> = ({
  onNext,
  onBack,
  isLoading = false,
  formData,
  onFormChange,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { businessName, category, subCategories, email, phone, password, confirmPassword } = formData;
  const [subcategoryPickerVisible, setSubcategoryPickerVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [subcategoryError, setSubcategoryError] = useState<string | null>(null);

  const availableSubCategories = useMemo(
    () => (category ? SUB_CATEGORY_OPTIONS[category] ?? [] : []),
    [category],
  );

  const handleNext = () => {
    setFormError(null);

    if (!businessName.trim()) {
      setFormError(t('auth.companySignUp.businessNameRequired'));
      return;
    }
    if (!category) {
      setFormError(t('auth.companySignUp.categoryRequired'));
      return;
    }
    if (availableSubCategories.length > 0 && subCategories.length === 0) {
      setSubcategoryError(t('businessOwner.companyProfile.subcategoryRequired'));
      return;
    }
    setSubcategoryError(null);
    if (!email.trim()) {
      setFormError(t('auth.companySignUp.emailRequired'));
      return;
    }
    if (!phone.trim()) {
      setFormError(t('auth.companySignUp.phoneRequired'));
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setFormError(t('auth.companySignUp.phoneMinLength'));
      return;
    }
    if (password.length < 6) {
      setFormError(t('auth.passwordMinLength'));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(t('auth.passwordsDoNotMatch'));
      return;
    }

    onNext();
  };

  const isFormValid =
    businessName.trim().length > 0 &&
    category.length > 0 &&
    (availableSubCategories.length === 0 || subCategories.length > 0) &&
    email.trim().length > 0 &&
    phone.replace(/\D/g, '').length >= 8 &&
    password.length >= 6 &&
    confirmPassword === password;

  return (
    <>
    <View style={{ flex: 1 }}>
      {/* Header: Back button + Step badge */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
        }}
      >
        <Pressable
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(148,163,184,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={theme.text} />
        </Pressable>

        <View
          style={{
            backgroundColor: theme.card,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
            {t('auth.companySignUp.stepOf', { current: 1, total: 3 })}
          </AppText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Title & subtitle */}
      <AppText
        style={{ fontSize: 28, fontWeight: '700', color: theme.text, marginBottom: 8 }}
      >
        {t('auth.companySignUp.step1Title')}
      </AppText>
      <AppText style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 20 }}>
        {t('auth.companySignUp.step1Subtitle')}
      </AppText>

      {/* Progress bar */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 28 }}>
        <View
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.neonPurple,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 3,
          }}
        />
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.border }} />
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.border }} />
      </View>

      {/* Error */}
      {formError && (
        <View
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <AppText style={{ color: '#F87171', fontSize: 14 }}>{formError}</AppText>
        </View>
      )}

      {/* ===== BUSINESS DETAILS ===== */}
      <View style={{ marginBottom: 20 }}>
        <SectionHeader title={t('auth.companySignUp.businessDetails')} />
        <View style={{ gap: 16 }}>
          <IconInputField
            label="Business Name"
            icon="storefront-outline"
            placeholder="Search or type new name"
            value={businessName}
            onChangeText={(val) => onFormChange({ businessName: val })}
            autoCapitalize="words"
            rightIcon="magnify"
          />

          <SearchableSelectField
            label="Category"
            placeholder="Select industry"
            value={category}
            options={CATEGORY_OPTIONS}
            onSelect={(val) => {
              onFormChange({ category: val, subCategories: [] });
              setSubcategoryError(null);
            }}
            icon="shape-outline"
          />

          {availableSubCategories.length > 0 && (
            <View>
              <AppText
                style={{
                  color: theme.text,
                  fontSize: 14,
                  fontWeight: '500',
                  marginBottom: 6,
                  marginLeft: 4,
                }}
              >
                Sub-Category
              </AppText>
              <Pressable
                onPress={() => setSubcategoryPickerVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Sub-Category"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: theme.card,
                  borderWidth: 1,
                  borderColor: subcategoryError ? '#EF4444' : theme.border,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  height: 52,
                }}
              >
                <MaterialCommunityIcons
                  name="subdirectory-arrow-right"
                  size={20}
                  color={theme.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <AppText
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: subCategories.length > 0 ? theme.text : theme.textMuted,
                  }}
                >
                  {subCategories.length === 0
                    ? 'Select one or more sub-categories'
                    : subCategories.length === 1
                    ? availableSubCategories.find((o) => o.value === subCategories[0])?.label ?? ''
                    : `${subCategories.length} sub-categories selected`}
                </AppText>
                <MaterialCommunityIcons name="chevron-down" size={20} color={theme.textMuted} />
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
      </View>

      <Divider />

      {/* ===== OWNER CONTACT ===== */}
      <View style={{ marginBottom: 20, marginTop: 16 }}>
        <SectionHeader title={t('auth.companySignUp.ownerContact')} />
        <View style={{ gap: 16 }}>
          <IconInputField
            label="Personal Email"
            icon="email-outline"
            placeholder="name@example.com"
            value={email}
            onChangeText={(val) => onFormChange({ email: val })}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          {/* Phone with +216 prefix */}
          <View>
            <AppText
              style={{
                color: theme.text,
                fontSize: 14,
                fontWeight: '500',
                marginBottom: 6,
                marginLeft: 4,
              }}
            >
              Phone Number
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: theme.card,
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 16,
                height: 52,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingLeft: 16,
                }}
              >
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={20}
                  color={theme.textSecondary}
                  style={{ marginRight: 12 }}
                />
                <AppText
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: theme.textSecondary,
                    marginRight: 8,
                  }}
                >
                  +216
                </AppText>
                <View
                  style={{
                    width: 1,
                    height: 24,
                    backgroundColor: theme.border,
                    marginRight: 8,
                  }}
                />
              </View>
              <TextInput
                placeholder="XX XXX XXX"
                value={phone}
                onChangeText={(val) => onFormChange({ phone: val })}
                keyboardType="phone-pad"
                placeholderTextColor={theme.textMuted}
                accessibilityLabel="Phone Number"
                style={{
                  flex: 1,
                  color: theme.text,
                  fontSize: 16,
                  paddingRight: 16,
                  paddingVertical: 0,
                }}
              />
            </View>
          </View>
        </View>
      </View>

      <Divider />

      {/* ===== SECURITY ===== */}
      <View style={{ marginBottom: 24, marginTop: 16 }}>
        <SectionHeader title={t('auth.companySignUp.security')} />
        <View style={{ gap: 16 }}>
          <IconInputField
            label="Password"
            icon="lock-outline"
            placeholder="Create a strong password"
            value={password}
            onChangeText={(val) => onFormChange({ password: val })}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <IconInputField
            label="Confirm Password"
            icon="lock-reset"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={(val) => onFormChange({ confirmPassword: val })}
            secureTextEntry
          />
        </View>
      </View>

      {/* Spacer so content isn't hidden behind fixed bottom bar */}
      <View style={{ height: 120 }} />

      {/* ===== BOTTOM FIXED BUTTON ===== */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: -24,
          right: -24,
          backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(241,245,249,0.95)',
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: Platform.OS === 'ios' ? 36 : 24,
        }}
      >
        <AppButton
          title="Next Step"
          onPress={handleNext}
          isLoading={isLoading}
          disabled={!isFormValid}
          size="lg"
          shape="pill"
          icon={
            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textWhite} />
          }
          style={{
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Next Step"
        />

        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <AppText style={{ fontSize: 14, color: theme.textSecondary }}>
              {t('auth.companySignUp.hasAccount')}{' '}
            </AppText>
            <Pressable
              onPress={() => router.push('/(auth)/sign-in')}
              accessibilityRole="link"
              accessibilityLabel={t('auth.companySignUp.logIn')}
            >
              <AppText
                style={{
                  fontSize: 14,
                  color: colors.neonPurple,
                  fontWeight: '600',
                  textDecorationLine: 'underline',
                }}
              >
                {t('auth.companySignUp.logIn')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>

    <SubcategoryPickerModal
      visible={subcategoryPickerVisible}
      title="Sub-Category"
      options={availableSubCategories}
      values={subCategories}
      onClose={() => setSubcategoryPickerVisible(false)}
      onConfirm={(vals) => {
        onFormChange({ subCategories: vals });
        if (vals.length > 0) setSubcategoryError(null);
        setSubcategoryPickerVisible(false);
      }}
    />
    </>
  );
};
