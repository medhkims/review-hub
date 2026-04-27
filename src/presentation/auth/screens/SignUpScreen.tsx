import React, { useCallback, useState } from 'react';
import { View, Pressable, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { BirthdayPicker } from '../components/BirthdayPicker';
import { CompanySignUpStep1, CompanyStep1Data } from '../components/CompanySignUpStep1';
import { CompanySignUpStep2, CompanyStep2Data } from '../components/CompanySignUpStep2';
import { CompanySignUpStep3, CompanyStep3Data } from '../components/CompanySignUpStep3';
import { useAuth } from '../hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

type UserType = 'simple' | 'company';

interface SocialButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  accessibilityLabel: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ onPress, icon, accessibilityLabel }) => {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={{
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Pressable>
  );
};

interface UserTypeToggleProps {
  selected: UserType;
  onSelect: (type: UserType) => void;
}

const UserTypeToggle: React.FC<UserTypeToggleProps> = ({ selected, onSelect }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        backgroundColor: theme.card,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {(['simple', 'company'] as const).map((type) => {
        const isSelected = selected === type;
        return (
          <Pressable
            key={type}
            onPress={() => onSelect(type)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={
              type === 'simple'
                ? t('auth.signUp.userTypeSimple')
                : t('auth.signUp.userTypeCompany')
            }
            style={{
              flex: 1,
              height: 40,
              borderRadius: 9999,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isSelected ? colors.neonPurple : 'transparent',
              ...(isSelected
                ? {
                    shadowColor: colors.neonPurple,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.4,
                    shadowRadius: 15,
                    elevation: 5,
                  }
                : {}),
            }}
          >
            <AppText
              style={{
                fontSize: 14,
                fontWeight: isSelected ? '700' : '500',
                color: isSelected ? colors.textWhite : theme.textSecondary,
              }}
            >
              {type === 'simple'
                ? t('auth.signUp.userTypeSimple')
                : t('auth.signUp.userTypeCompany')}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default function SignUpScreen() {
  useAnalyticsScreen(AnalyticsScreens.SIGN_UP);
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { signUp, signUpAsBusinessOwner, signInWithGoogle, continueAsGuest, isLoading, error } = useAuth();

  const [userType, setUserType] = useState<UserType>('simple');
  const [companyStep, setCompanyStep] = useState(1);
  const [maxCompanyStep, setMaxCompanyStep] = useState(1);
  const [step1Form, setStep1Form] = useState<CompanyStep1Data>({
    businessName: '',
    category: '',
    subCategories: [],
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const updateStep1Form = useCallback((updates: Partial<CompanyStep1Data>) => {
    setStep1Form((prev) => ({ ...prev, ...updates }));
  }, []);
  const [companyStep2Data, setCompanyStep2Data] = useState<CompanyStep2Data | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [showAgeGate, setShowAgeGate] = useState(false);

  const handleSignUp = () => {
    setConfirmError(null);
    if (!displayName.trim() || !email.trim() || !password) return;
    if (password.length < 6) {
      setConfirmError(t('auth.passwordMinLength'));
      return;
    }
    if (birthday) {
      const today = new Date();
      const age = today.getFullYear() - birthday.getFullYear();
      const monthDiff = today.getMonth() - birthday.getMonth();
      const isUnder13 = age < 13 || (age === 13 && (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())));
      if (isUnder13) {
        setShowAgeGate(true);
        return;
      }
    }
    signUp(email.trim(), password, displayName.trim(), gender || undefined, birthday ?? undefined);
  };

  const handleCompanyStep1Next = () => {
    setCompanyStep(2);
    setMaxCompanyStep((prev) => Math.max(prev, 2));
  };

  const handleCompanyStep2Next = (data: CompanyStep2Data) => {
    setCompanyStep2Data(data);
    setCompanyStep(3);
    setMaxCompanyStep((prev) => Math.max(prev, 3));
  };

  const handleCompanyStep2Skip = () => {
    setCompanyStep2Data(null);
    setCompanyStep(3);
    setMaxCompanyStep((prev) => Math.max(prev, 3));
  };

  const handleCompanyStep3Finish = (_data: CompanyStep3Data) => {
    signUpAsBusinessOwner(
      step1Form.email,
      step1Form.password,
      step1Form.businessName,
      {
        businessName: step1Form.businessName,
        category: step1Form.category,
        subCategories: step1Form.subCategories,
        email: step1Form.email,
        phone: step1Form.phone,
        location: companyStep2Data?.location ?? '',
        website: companyStep2Data?.website ?? '',
        facebook: companyStep2Data?.facebook ?? '',
        instagram: companyStep2Data?.instagram ?? '',
      },
    );
  };

  const isFormValid =
    displayName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    birthday !== null &&
    agreedToTerms;

  return (
    <ScreenLayout withKeyboardAvoid>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Glow Effects */}
        <View
          style={{
            position: 'absolute',
            top: -60,
            left: -80,
            width: 280,
            height: 200,
            borderRadius: 140,
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            transform: [{ scale: 1.5 }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -40,
            right: -40,
            width: 200,
            height: 150,
            borderRadius: 100,
            backgroundColor: 'rgba(168, 85, 247, 0.08)',
            transform: [{ scale: 1.5 }],
          }}
        />

        {/* Header */}
        <View
          style={{
            paddingTop: 32,
            paddingBottom: 16,
            paddingHorizontal: 24,
            alignItems: 'center',
          }}
        >
          <AppText
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: theme.text,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {t('auth.signUp.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: theme.textSecondary,
              fontWeight: '500',
              textAlign: 'center',
              maxWidth: 280,
              lineHeight: 20,
            }}
          >
            {t('auth.signUp.subtitle')}
          </AppText>
        </View>

        {/* User Type Toggle */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 8 }}>
          <UserTypeToggle selected={userType} onSelect={setUserType} />
        </View>

        {/* ===== COMPANY OWNER FORM ===== */}
        {userType === 'company' ? (
          <View style={{ paddingHorizontal: 24, paddingTop: 16, flex: 1 }}>
            {/* Steps are kept mounted once visited to preserve all entered data */}
            <View style={{ display: companyStep === 1 ? 'flex' : 'none', flex: 1 }}>
              <CompanySignUpStep1
                onNext={handleCompanyStep1Next}
                onBack={() => setUserType('simple')}
                isLoading={isLoading}
                formData={step1Form}
                onFormChange={updateStep1Form}
              />
            </View>

            {maxCompanyStep >= 2 && (
              <View style={{ display: companyStep === 2 ? 'flex' : 'none', flex: 1 }}>
                <CompanySignUpStep2
                  onNext={handleCompanyStep2Next}
                  onBack={() => setCompanyStep(1)}
                  onSkip={handleCompanyStep2Skip}
                  isLoading={isLoading}
                />
              </View>
            )}

            {maxCompanyStep >= 3 && (
              <View style={{ display: companyStep === 3 ? 'flex' : 'none', flex: 1 }}>
                <CompanySignUpStep3
                  onFinish={handleCompanyStep3Finish}
                  onBack={() => setCompanyStep(2)}
                  isLoading={isLoading}
                  error={error}
                />
              </View>
            )}
          </View>
        ) : (
          <>
            {/* ===== SIMPLE USER FORM ===== */}
            {/* Social Signup */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 24,
                alignItems: 'center',
                gap: 16,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                <SocialButton
                  onPress={signInWithGoogle}
                  accessibilityLabel="Sign up with Google"
                  icon={<MaterialCommunityIcons name="google" size={24} color="#DB4437" />}
                />
                <SocialButton
                  onPress={() => {}}
                  accessibilityLabel="Sign up with Facebook"
                  icon={<MaterialCommunityIcons name="facebook" size={24} color="#3B82F6" />}
                />
                <SocialButton
                  onPress={() => {}}
                  accessibilityLabel="Sign up with Apple"
                  icon={<MaterialCommunityIcons name="apple" size={24} color={colors.textWhite} />}
                />
              </View>

              {/* Divider */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  width: '100%',
                  marginTop: 8,
                  marginBottom: 8,
                }}
              >
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                <View style={{ backgroundColor: theme.background, paddingHorizontal: 12 }}>
                  <AppText
                    style={{
                      fontSize: 11,
                      color: theme.textMuted,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {t('auth.signUp.orRegisterWithEmail')}
                  </AppText>
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
              </View>
            </View>

            {/* Error Message */}
            {(error || confirmError) && (
              <View
                style={{
                  marginHorizontal: 24,
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  borderWidth: 1,
                  borderColor: 'rgba(239,68,68,0.3)',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                }}
              >
                <AppText style={{ color: '#F87171', fontSize: 14 }}>
                  {confirmError ?? error}
                </AppText>
              </View>
            )}

            {/* Form Fields */}
            <View style={{ paddingHorizontal: 24 }}>
              <AppInput
                placeholder={t('auth.signUp.displayName')}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                accessibilityLabel={t('auth.signUp.displayName')}
              />

              {/* Gender Dropdown */}
              <View style={{ marginBottom: 16 }}>
                <Pressable
                  onPress={() => setGenderDropdownOpen((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel={t('auth.signUp.gender')}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 52,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: genderDropdownOpen ? colors.neonPurple : theme.border,
                    backgroundColor: theme.card,
                    paddingHorizontal: 16,
                    gap: 10,
                  }}
                >
                  {gender ? (
                    <MaterialCommunityIcons
                      name={gender === 'male' ? 'gender-male' : 'gender-female'}
                      size={18}
                      color={colors.neonPurple}
                    />
                  ) : (
                    <MaterialCommunityIcons name="gender-male-female" size={18} color={colors.textSlate500} />
                  )}
                  <AppText style={{
                    flex: 1,
                    fontSize: 15,
                    color: gender ? theme.text : theme.textMuted,
                  }}>
                    {gender
                      ? t(`auth.signUp.gender${gender === 'male' ? 'Male' : 'Female'}`)
                      : t('auth.signUp.gender')}
                  </AppText>
                  <MaterialCommunityIcons
                    name={genderDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.textSecondary}
                  />
                </Pressable>

                {genderDropdownOpen && (
                  <View style={{
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: theme.border,
                    backgroundColor: theme.card,
                    marginTop: 4,
                    overflow: 'hidden',
                  }}>
                    {(['male', 'female'] as const).map((g, index) => {
                      const isSelected = gender === g;
                      return (
                        <Pressable
                          key={g}
                          onPress={() => { setGender(g); setGenderDropdownOpen(false); }}
                          accessibilityRole="button"
                          accessibilityLabel={t(`auth.signUp.gender${g === 'male' ? 'Male' : 'Female'}`)}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 13,
                            borderTopWidth: index === 0 ? 0 : 1,
                            borderTopColor: theme.border,
                            backgroundColor: isSelected ? 'rgba(168,85,247,0.1)' : 'transparent',
                          }}
                        >
                          <MaterialCommunityIcons
                            name={g === 'male' ? 'gender-male' : 'gender-female'}
                            size={18}
                            color={isSelected ? colors.neonPurple : theme.textSecondary}
                          />
                          <AppText style={{
                            flex: 1,
                            fontSize: 15,
                            fontWeight: isSelected ? '600' : '400',
                            color: isSelected ? colors.neonPurple : theme.text,
                          }}>
                            {t(`auth.signUp.gender${g === 'male' ? 'Male' : 'Female'}`)}
                          </AppText>
                          {isSelected && (
                            <MaterialCommunityIcons name="check" size={16} color={colors.neonPurple} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>

              <BirthdayPicker value={birthday} onChange={setBirthday} />

              <AppInput
                placeholder={t('auth.signUp.email')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel={t('auth.signUp.email')}
              />

              <AppInput
                placeholder={t('auth.signUp.password')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                accessibilityLabel={t('auth.signUp.password')}
              />

              {/* Terms Agreement */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                  marginTop: 8,
                  paddingHorizontal: 4,
                }}
              >
                <Pressable
                  onPress={() => setAgreedToTerms((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: agreedToTerms }}
                  accessibilityLabel={t('auth.signUp.agreeTerms')}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1.5,
                    borderColor: agreedToTerms ? colors.neonPurple : theme.border,
                    backgroundColor: agreedToTerms ? colors.neonPurple : theme.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {agreedToTerms && (
                    <MaterialCommunityIcons name="check" size={14} color={colors.textWhite} />
                  )}
                </Pressable>
                <AppText
                  style={{ flex: 1, fontSize: 12, color: theme.textSecondary, lineHeight: 20 }}
                >
                  {t('auth.signUp.agreeTerms')}{' '}
                  <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '700' }}>
                    {t('auth.signUp.termsAndConditions')}
                  </AppText>
                  {' '}{t('auth.signUp.and')}{' '}
                  <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '700' }}>
                    {t('auth.signUp.privacyPolicy')}
                  </AppText>
                  .
                </AppText>
              </View>

              {/* Sign Up Button */}
              <AppButton
                title={t('auth.signUp.button')}
                onPress={handleSignUp}
                isLoading={isLoading}
                disabled={!isFormValid}
                size="lg"
                style={{
                  marginTop: 16,
                  borderRadius: 16,
                  shadowColor: colors.neonPurple,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 8,
                }}
                accessibilityRole="button"
                accessibilityLabel={t('auth.signUp.button')}
              />
            </View>

            {/* Footer */}
            <View
              style={{ marginTop: 'auto', paddingVertical: 32, alignItems: 'center' }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <AppText style={{ fontSize: 14, color: theme.textSecondary }}>
                  {t('auth.signUp.hasAccount')}{' '}
                </AppText>
                <Pressable
                  onPress={() => router.push('/(auth)/sign-in')}
                  accessibilityRole="link"
                  accessibilityLabel={t('auth.signUp.login')}
                >
                  <AppText
                    style={{ fontSize: 14, color: theme.text, fontWeight: '700' }}
                  >
                    {t('auth.signUp.login')}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Age Gate Modal — under 13 */}
      <Modal visible={showAgeGate} transparent animationType="fade">
        <View style={{
          flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
          justifyContent: 'center', alignItems: 'center', padding: 24,
        }}>
          <View style={{
            backgroundColor: theme.card, borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 380, alignItems: 'center',
          }}>
            <View style={{
              width: 64, height: 64, borderRadius: 32,
              backgroundColor: `${colors.neonPurple}15`,
              alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            }}>
              <MaterialCommunityIcons name="account-child" size={32} color={colors.neonPurple} />
            </View>

            <AppText style={{
              fontSize: 18, fontWeight: '700', color: theme.text,
              textAlign: 'center', marginBottom: 8,
            }}>
              {t('auth.ageGate.title')}
            </AppText>

            <AppText style={{
              fontSize: 14, color: theme.textSecondary,
              textAlign: 'center', lineHeight: 20, marginBottom: 24,
            }}>
              {t('auth.ageGate.message')}
            </AppText>

            <AppButton
              title={t('auth.ageGate.continueAsGuest')}
              variant="primary"
              size="lg"
              shape="pill"
              onPress={() => { setShowAgeGate(false); continueAsGuest(); }}
              isLoading={isLoading}
              accessibilityLabel={t('auth.ageGate.continueAsGuest')}
              accessibilityRole="button"
              style={{ width: '100%', marginBottom: 12 }}
            />

            <Pressable
              onPress={() => setShowAgeGate(false)}
              accessibilityRole="button"
              accessibilityLabel={t('common.cancel')}
              style={{ paddingVertical: 10 }}
            >
              <AppText style={{ fontSize: 14, color: theme.textSecondary, fontWeight: '600' }}>
                {t('common.cancel')}
              </AppText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
