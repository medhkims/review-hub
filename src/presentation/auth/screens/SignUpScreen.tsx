import React, { useState } from 'react';
import { View, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppInput } from '@/presentation/shared/components/ui/AppInput';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { CompanySignUpStep1, CompanyStep1Data } from '../components/CompanySignUpStep1';
import { CompanySignUpStep2, CompanyStep2Data } from '../components/CompanySignUpStep2';
import { CompanySignUpStep3, CompanyStep3Data } from '../components/CompanySignUpStep3';
import { useAuth } from '../hooks/useAuth';
import { useAnalyticsScreen } from '@/presentation/shared/hooks/useAnalyticsScreen';
import { AnalyticsScreens } from '@/core/analytics/analyticsKeys';
import { colors } from '@/core/theme/colors';

type UserType = 'simple' | 'company';

interface SocialButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  accessibilityLabel: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ onPress, icon, accessibilityLabel }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={{
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.cardDark,
      borderWidth: 1,
      borderColor: colors.borderDark,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {icon}
  </Pressable>
);

interface UserTypeToggleProps {
  selected: UserType;
  onSelect: (type: UserType) => void;
}

const UserTypeToggle: React.FC<UserTypeToggleProps> = ({ selected, onSelect }) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: 'row',
        padding: 4,
        backgroundColor: colors.cardDark,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: colors.borderDark,
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
                color: isSelected ? colors.textWhite : colors.textSlate400,
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
  const { signUp, signUpAsBusinessOwner, isLoading, error } = useAuth();

  const [userType, setUserType] = useState<UserType>('simple');
  const [companyStep, setCompanyStep] = useState(1);
  const [companyStep1Data, setCompanyStep1Data] = useState<CompanyStep1Data | null>(null);
  const [companyStep2Data, setCompanyStep2Data] = useState<CompanyStep2Data | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const handleSignUp = () => {
    setConfirmError(null);
    if (!displayName.trim() || !email.trim() || !password) return;
    if (password.length < 6) {
      setConfirmError(t('auth.passwordMinLength'));
      return;
    }
    signUp(email.trim(), password, displayName.trim());
  };

  const handleCompanyStep1Next = (data: CompanyStep1Data) => {
    setCompanyStep1Data(data);
    setCompanyStep(2);
  };

  const handleCompanyStep2Next = (data: CompanyStep2Data) => {
    setCompanyStep2Data(data);
    setCompanyStep(3);
  };

  const handleCompanyStep2Skip = () => {
    setCompanyStep2Data(null);
    setCompanyStep(3);
  };

  const handleCompanyStep3Finish = (_data: CompanyStep3Data) => {
    if (!companyStep1Data) return;

    signUpAsBusinessOwner(
      companyStep1Data.email,
      companyStep1Data.password,
      companyStep1Data.businessName,
      {
        businessName: companyStep1Data.businessName,
        category: companyStep1Data.category,
        subCategory: companyStep1Data.subCategory,
        phone: companyStep1Data.phone,
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
              color: colors.textWhite,
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {t('auth.signUp.title')}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: colors.textSlate400,
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
            {error && (
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
                <AppText style={{ color: '#F87171', fontSize: 14 }}>
                  {error}
                </AppText>
              </View>
            )}
            {companyStep === 1 ? (
              <CompanySignUpStep1
                onNext={handleCompanyStep1Next}
                onBack={() => setUserType('simple')}
                isLoading={isLoading}
              />
            ) : companyStep === 2 ? (
              <CompanySignUpStep2
                onNext={handleCompanyStep2Next}
                onBack={() => setCompanyStep(1)}
                onSkip={handleCompanyStep2Skip}
                isLoading={isLoading}
              />
            ) : (
              <CompanySignUpStep3
                onFinish={handleCompanyStep3Finish}
                onBack={() => setCompanyStep(2)}
                isLoading={isLoading}
              />
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
                  onPress={() => {}}
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
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderDark }} />
                <View style={{ backgroundColor: colors.midnight, paddingHorizontal: 12 }}>
                  <AppText
                    style={{
                      fontSize: 11,
                      color: colors.textSlate500,
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    {t('auth.signUp.orRegisterWithEmail')}
                  </AppText>
                </View>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.borderDark }} />
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
            <View style={{ paddingHorizontal: 24, gap: 16 }}>
              <AppInput
                placeholder={t('auth.signUp.displayName')}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
                textContentType="name"
                accessibilityLabel={t('auth.signUp.displayName')}
              />

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
                    borderColor: agreedToTerms ? colors.neonPurple : colors.borderDark,
                    backgroundColor: agreedToTerms ? colors.neonPurple : colors.cardDark,
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
                  style={{ flex: 1, fontSize: 12, color: colors.textSlate400, lineHeight: 20 }}
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
                <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
                  {t('auth.signUp.hasAccount')}{' '}
                </AppText>
                <Pressable
                  onPress={() => router.push('/(auth)/sign-in')}
                  accessibilityRole="link"
                  accessibilityLabel={t('auth.signUp.login')}
                >
                  <AppText
                    style={{ fontSize: 14, color: colors.textWhite, fontWeight: '700' }}
                  >
                    {t('auth.signUp.login')}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenLayout>
  );
}
