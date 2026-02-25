import React, { useState } from 'react';
import { View, Pressable, TextInput, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AppButton } from '@/presentation/shared/components/ui/AppButton';
import { colors } from '@/core/theme/colors';

interface CompanySignUpStep2Props {
  onNext: (data: CompanyStep2Data) => void;
  onBack: () => void;
  onSkip: () => void;
  isLoading?: boolean;
}

export interface CompanyStep2Data {
  location: string;
  website: string;
  facebook: string;
  instagram: string;
}

// --- Reusable icon text field ---

interface IconInputFieldProps {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: TextInput['props']['keyboardType'];
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  autoComplete?: TextInput['props']['autoComplete'];
}

const IconInputField: React.FC<IconInputFieldProps> = ({
  label,
  icon,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  autoComplete,
}) => (
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
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        placeholderTextColor={colors.textSlate500}
        accessibilityLabel={label}
        style={{
          flex: 1,
          color: colors.textWhite,
          fontSize: 16,
          paddingVertical: 0,
        }}
      />
    </View>
  </View>
);

// --- Main Component ---

export const CompanySignUpStep2: React.FC<CompanySignUpStep2Props> = ({
  onNext,
  onBack,
  onSkip,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  const handleNext = () => {
    onNext({
      location: location.trim(),
      website: website.trim(),
      facebook: facebook.trim(),
      instagram: instagram.trim(),
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Header: Back button + Title + Step */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 8,
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

        <View style={{ alignItems: 'center' }}>
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.textWhite }}>
            {t('auth.companySignUp.step2Title')}
          </AppText>
          <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.textSlate400, marginTop: 2 }}>
            {t('auth.companySignUp.stepOf', { current: 2, total: 3 })}
          </AppText>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View
        style={{
          height: 6,
          backgroundColor: colors.borderDark,
          borderRadius: 3,
          marginBottom: 28,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: '66%',
            height: '100%',
            backgroundColor: colors.neonPurple,
            borderRadius: 3,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 6,
            elevation: 3,
          }}
        />
      </View>

      {/* Title & subtitle */}
      <AppText
        style={{ fontSize: 28, fontWeight: '700', color: colors.textWhite, marginBottom: 8 }}
      >
        {t('auth.companySignUp.step2Subtitle')}
      </AppText>
      <AppText style={{ fontSize: 15, color: colors.textSlate400, marginBottom: 28, lineHeight: 22 }}>
        {t('auth.companySignUp.step2Description')}
      </AppText>

      {/* Form fields */}
      <View style={{ gap: 20 }}>
        <IconInputField
          label="Location"
          icon="map-marker-outline"
          placeholder="e.g. 123 Rue de la Libert\u00e9, Tunis"
          value={location}
          onChangeText={setLocation}
          autoCapitalize="sentences"
        />

        <IconInputField
          label="Website"
          icon="web"
          placeholder="https://www.yourbusiness.tn"
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
          autoComplete="url"
        />

        <IconInputField
          label="Facebook"
          icon="facebook"
          placeholder="facebook.com/yourpage"
          value={facebook}
          onChangeText={setFacebook}
          keyboardType="url"
          autoCapitalize="none"
        />

        <IconInputField
          label="Instagram"
          icon="instagram"
          placeholder="instagram.com/yourhandle"
          value={instagram}
          onChangeText={setInstagram}
          keyboardType="url"
          autoCapitalize="none"
        />
      </View>

      {/* Spacer so content isn't hidden behind fixed bottom bar */}
      <View style={{ height: 140 }} />

      {/* ===== BOTTOM FIXED BUTTONS ===== */}
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
          title="Next"
          onPress={handleNext}
          isLoading={isLoading}
          size="lg"
          shape="pill"
          style={{
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 14,
            elevation: 8,
          }}
          accessibilityRole="button"
          accessibilityLabel="Next"
        />

        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip for now"
          style={{ marginTop: 16, alignItems: 'center', paddingVertical: 8 }}
        >
          <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate400 }}>
            {t('auth.companySignUp.skipForNow')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
};
