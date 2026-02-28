import React, { useMemo, useState } from 'react';
import { View, Pressable, TextInput, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';
import { CATEGORIES_DATA } from '@/core/constants/categoriesData';

interface CompanySignUpStep1Props {
  onNext: (data: CompanyStep1Data) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export interface CompanyStep1Data {
  businessName: string;
  category: string;
  subCategory: string;
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
  const [visible, setVisible] = useState(false);
  const isPassword = secureTextEntry !== undefined;

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
          borderColor: colors.borderDark,
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
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          placeholderTextColor={colors.textSlate500}
          accessibilityLabel={label}
          style={{
            flex: 1,
            color: colors.textWhite,
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
          >
            <MaterialCommunityIcons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSlate500}
            />
          </Pressable>
        )}
        {rightIcon && !isPassword && (
          <MaterialCommunityIcons name={rightIcon} size={20} color={colors.textSlate500} />
        )}
      </View>
    </View>
  );
};

// --- Custom select dropdown ---

interface SelectFieldProps {
  label: string;
  placeholder: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  dimmed?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  placeholder,
  value,
  options,
  onSelect,
  icon,
  dimmed = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <View style={{ opacity: dimmed && !value ? 0.6 : 1 }}>
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
      <Pressable
        onPress={() => {
          if (!dimmed || value) setIsOpen(!isOpen);
        }}
        accessibilityRole="button"
        accessibilityLabel={label}
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
        <AppText
          style={{
            flex: 1,
            fontSize: 16,
            color: selectedLabel ? colors.textWhite : colors.textSlate500,
          }}
        >
          {selectedLabel || placeholder}
        </AppText>
        <MaterialCommunityIcons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSlate500}
        />
      </Pressable>
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
        >
          {options.map((option, index) => (
            <Pressable
              key={option.value}
              onPress={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
              accessibilityRole="menuitem"
              accessibilityLabel={option.label}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor:
                  value === option.value ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                borderBottomWidth: index < options.length - 1 ? 1 : 0,
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
        </View>
      )}
    </View>
  );
};

// --- Section header ---

interface SectionHeaderProps {
  title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => (
  <AppText
    style={{
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSlate400,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 16,
      marginLeft: 4,
    }}
  >
    {title}
  </AppText>
);

const Divider: React.FC = () => (
  <View
    style={{
      height: 1,
      backgroundColor: colors.borderDark,
      marginVertical: 4,
      opacity: 0.5,
    }}
  />
);

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
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [businessName, setBusinessName] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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
    if (!email.trim()) {
      setFormError(t('auth.companySignUp.emailRequired'));
      return;
    }
    if (!phone.trim()) {
      setFormError(t('auth.companySignUp.phoneRequired'));
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

    onNext({
      businessName: businessName.trim(),
      category,
      subCategory,
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
    });
  };

  const isFormValid =
    businessName.trim().length > 0 &&
    category.length > 0 &&
    email.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.length >= 6 &&
    confirmPassword === password;

  return (
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
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.textWhite} />
        </Pressable>

        <View
          style={{
            backgroundColor: colors.cardDark,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 9999,
            borderWidth: 1,
            borderColor: colors.borderDark,
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
        style={{ fontSize: 28, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}
      >
        {t('auth.companySignUp.step1Title')}
      </AppText>
      <AppText style={{ fontSize: 14, color: colors.textSlate400, marginBottom: 20 }}>
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
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.borderDark }} />
        <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.borderDark }} />
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
            onChangeText={setBusinessName}
            autoCapitalize="words"
            rightIcon="magnify"
          />

          <SelectField
            label="Category"
            placeholder="Select industry"
            value={category}
            options={CATEGORY_OPTIONS}
            onSelect={(val) => {
              setCategory(val);
              setSubCategory('');
            }}
            icon="shape-outline"
          />

          <SelectField
            label="Sub-Category"
            placeholder="Select specific field"
            value={subCategory}
            options={availableSubCategories}
            onSelect={setSubCategory}
            icon="subdirectory-arrow-right"
            dimmed={!category}
          />
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
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
          />

          {/* Phone with +216 prefix */}
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
              Phone Number
            </AppText>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.cardDark,
                borderWidth: 1,
                borderColor: colors.borderDark,
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
                  color={colors.textSlate400}
                  style={{ marginRight: 12 }}
                />
                <AppText
                  style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: colors.textSlate400,
                    marginRight: 8,
                  }}
                >
                  +216
                </AppText>
                <View
                  style={{
                    width: 1,
                    height: 24,
                    backgroundColor: colors.borderDark,
                    marginRight: 8,
                  }}
                />
              </View>
              <TextInput
                placeholder="XX XXX XXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor={colors.textSlate500}
                accessibilityLabel="Phone Number"
                style={{
                  flex: 1,
                  color: colors.textWhite,
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
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
          />

          <IconInputField
            label="Confirm Password"
            icon="lock-reset"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
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
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          borderTopWidth: 1,
          borderTopColor: 'rgba(51, 65, 85, 0.5)',
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
            <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
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
  );
};
