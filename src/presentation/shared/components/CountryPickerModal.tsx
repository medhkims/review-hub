import React, { useState, useMemo, useCallback } from 'react';
import { Modal, View, Pressable, FlatList, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from './ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

export interface Country {
  name: string;
  flag: string;
  dialCode: string;
  code: string;
}

export const COUNTRIES: Country[] = [
  { name: 'Afghanistan', flag: '🇦🇫', dialCode: '+93', code: 'AF' },
  { name: 'Albania', flag: '🇦🇱', dialCode: '+355', code: 'AL' },
  { name: 'Algeria', flag: '🇩🇿', dialCode: '+213', code: 'DZ' },
  { name: 'Argentina', flag: '🇦🇷', dialCode: '+54', code: 'AR' },
  { name: 'Armenia', flag: '🇦🇲', dialCode: '+374', code: 'AM' },
  { name: 'Australia', flag: '🇦🇺', dialCode: '+61', code: 'AU' },
  { name: 'Austria', flag: '🇦🇹', dialCode: '+43', code: 'AT' },
  { name: 'Azerbaijan', flag: '🇦🇿', dialCode: '+994', code: 'AZ' },
  { name: 'Bahrain', flag: '🇧🇭', dialCode: '+973', code: 'BH' },
  { name: 'Bangladesh', flag: '🇧🇩', dialCode: '+880', code: 'BD' },
  { name: 'Belarus', flag: '🇧🇾', dialCode: '+375', code: 'BY' },
  { name: 'Belgium', flag: '🇧🇪', dialCode: '+32', code: 'BE' },
  { name: 'Bolivia', flag: '🇧🇴', dialCode: '+591', code: 'BO' },
  { name: 'Bosnia and Herzegovina', flag: '🇧🇦', dialCode: '+387', code: 'BA' },
  { name: 'Brazil', flag: '🇧🇷', dialCode: '+55', code: 'BR' },
  { name: 'Bulgaria', flag: '🇧🇬', dialCode: '+359', code: 'BG' },
  { name: 'Cambodia', flag: '🇰🇭', dialCode: '+855', code: 'KH' },
  { name: 'Cameroon', flag: '🇨🇲', dialCode: '+237', code: 'CM' },
  { name: 'Canada', flag: '🇨🇦', dialCode: '+1', code: 'CA' },
  { name: 'Chile', flag: '🇨🇱', dialCode: '+56', code: 'CL' },
  { name: 'China', flag: '🇨🇳', dialCode: '+86', code: 'CN' },
  { name: 'Colombia', flag: '🇨🇴', dialCode: '+57', code: 'CO' },
  { name: 'Congo', flag: '🇨🇬', dialCode: '+242', code: 'CG' },
  { name: 'Costa Rica', flag: '🇨🇷', dialCode: '+506', code: 'CR' },
  { name: 'Croatia', flag: '🇭🇷', dialCode: '+385', code: 'HR' },
  { name: 'Cuba', flag: '🇨🇺', dialCode: '+53', code: 'CU' },
  { name: 'Cyprus', flag: '🇨🇾', dialCode: '+357', code: 'CY' },
  { name: 'Czech Republic', flag: '🇨🇿', dialCode: '+420', code: 'CZ' },
  { name: 'Denmark', flag: '🇩🇰', dialCode: '+45', code: 'DK' },
  { name: 'Ecuador', flag: '🇪🇨', dialCode: '+593', code: 'EC' },
  { name: 'Egypt', flag: '🇪🇬', dialCode: '+20', code: 'EG' },
  { name: 'Ethiopia', flag: '🇪🇹', dialCode: '+251', code: 'ET' },
  { name: 'Finland', flag: '🇫🇮', dialCode: '+358', code: 'FI' },
  { name: 'France', flag: '🇫🇷', dialCode: '+33', code: 'FR' },
  { name: 'Georgia', flag: '🇬🇪', dialCode: '+995', code: 'GE' },
  { name: 'Germany', flag: '🇩🇪', dialCode: '+49', code: 'DE' },
  { name: 'Ghana', flag: '🇬🇭', dialCode: '+233', code: 'GH' },
  { name: 'Greece', flag: '🇬🇷', dialCode: '+30', code: 'GR' },
  { name: 'Guatemala', flag: '🇬🇹', dialCode: '+502', code: 'GT' },
  { name: 'Hungary', flag: '🇭🇺', dialCode: '+36', code: 'HU' },
  { name: 'India', flag: '🇮🇳', dialCode: '+91', code: 'IN' },
  { name: 'Indonesia', flag: '🇮🇩', dialCode: '+62', code: 'ID' },
  { name: 'Iran', flag: '🇮🇷', dialCode: '+98', code: 'IR' },
  { name: 'Iraq', flag: '🇮🇶', dialCode: '+964', code: 'IQ' },
  { name: 'Ireland', flag: '🇮🇪', dialCode: '+353', code: 'IE' },
  { name: 'Israel', flag: '🇮🇱', dialCode: '+972', code: 'IL' },
  { name: 'Italy', flag: '🇮🇹', dialCode: '+39', code: 'IT' },
  { name: 'Japan', flag: '🇯🇵', dialCode: '+81', code: 'JP' },
  { name: 'Jordan', flag: '🇯🇴', dialCode: '+962', code: 'JO' },
  { name: 'Kazakhstan', flag: '🇰🇿', dialCode: '+7', code: 'KZ' },
  { name: 'Kenya', flag: '🇰🇪', dialCode: '+254', code: 'KE' },
  { name: 'Kuwait', flag: '🇰🇼', dialCode: '+965', code: 'KW' },
  { name: 'Kyrgyzstan', flag: '🇰🇬', dialCode: '+996', code: 'KG' },
  { name: 'Lebanon', flag: '🇱🇧', dialCode: '+961', code: 'LB' },
  { name: 'Libya', flag: '🇱🇾', dialCode: '+218', code: 'LY' },
  { name: 'Lithuania', flag: '🇱🇹', dialCode: '+370', code: 'LT' },
  { name: 'Malaysia', flag: '🇲🇾', dialCode: '+60', code: 'MY' },
  { name: 'Mali', flag: '🇲🇱', dialCode: '+223', code: 'ML' },
  { name: 'Mauritania', flag: '🇲🇷', dialCode: '+222', code: 'MR' },
  { name: 'Mexico', flag: '🇲🇽', dialCode: '+52', code: 'MX' },
  { name: 'Morocco', flag: '🇲🇦', dialCode: '+212', code: 'MA' },
  { name: 'Netherlands', flag: '🇳🇱', dialCode: '+31', code: 'NL' },
  { name: 'New Zealand', flag: '🇳🇿', dialCode: '+64', code: 'NZ' },
  { name: 'Nigeria', flag: '🇳🇬', dialCode: '+234', code: 'NG' },
  { name: 'Norway', flag: '🇳🇴', dialCode: '+47', code: 'NO' },
  { name: 'Oman', flag: '🇴🇲', dialCode: '+968', code: 'OM' },
  { name: 'Pakistan', flag: '🇵🇰', dialCode: '+92', code: 'PK' },
  { name: 'Palestine', flag: '🇵🇸', dialCode: '+970', code: 'PS' },
  { name: 'Panama', flag: '🇵🇦', dialCode: '+507', code: 'PA' },
  { name: 'Paraguay', flag: '🇵🇾', dialCode: '+595', code: 'PY' },
  { name: 'Peru', flag: '🇵🇪', dialCode: '+51', code: 'PE' },
  { name: 'Philippines', flag: '🇵🇭', dialCode: '+63', code: 'PH' },
  { name: 'Poland', flag: '🇵🇱', dialCode: '+48', code: 'PL' },
  { name: 'Portugal', flag: '🇵🇹', dialCode: '+351', code: 'PT' },
  { name: 'Qatar', flag: '🇶🇦', dialCode: '+974', code: 'QA' },
  { name: 'Romania', flag: '🇷🇴', dialCode: '+40', code: 'RO' },
  { name: 'Russia', flag: '🇷🇺', dialCode: '+7', code: 'RU' },
  { name: 'Saudi Arabia', flag: '🇸🇦', dialCode: '+966', code: 'SA' },
  { name: 'Senegal', flag: '🇸🇳', dialCode: '+221', code: 'SN' },
  { name: 'Serbia', flag: '🇷🇸', dialCode: '+381', code: 'RS' },
  { name: 'Singapore', flag: '🇸🇬', dialCode: '+65', code: 'SG' },
  { name: 'Slovakia', flag: '🇸🇰', dialCode: '+421', code: 'SK' },
  { name: 'Somalia', flag: '🇸🇴', dialCode: '+252', code: 'SO' },
  { name: 'South Africa', flag: '🇿🇦', dialCode: '+27', code: 'ZA' },
  { name: 'South Korea', flag: '🇰🇷', dialCode: '+82', code: 'KR' },
  { name: 'Spain', flag: '🇪🇸', dialCode: '+34', code: 'ES' },
  { name: 'Sri Lanka', flag: '🇱🇰', dialCode: '+94', code: 'LK' },
  { name: 'Sudan', flag: '🇸🇩', dialCode: '+249', code: 'SD' },
  { name: 'Sweden', flag: '🇸🇪', dialCode: '+46', code: 'SE' },
  { name: 'Switzerland', flag: '🇨🇭', dialCode: '+41', code: 'CH' },
  { name: 'Syria', flag: '🇸🇾', dialCode: '+963', code: 'SY' },
  { name: 'Taiwan', flag: '🇹🇼', dialCode: '+886', code: 'TW' },
  { name: 'Tajikistan', flag: '🇹🇯', dialCode: '+992', code: 'TJ' },
  { name: 'Tanzania', flag: '🇹🇿', dialCode: '+255', code: 'TZ' },
  { name: 'Thailand', flag: '🇹🇭', dialCode: '+66', code: 'TH' },
  { name: 'Tunisia', flag: '🇹🇳', dialCode: '+216', code: 'TN' },
  { name: 'Turkey', flag: '🇹🇷', dialCode: '+90', code: 'TR' },
  { name: 'Turkmenistan', flag: '🇹🇲', dialCode: '+993', code: 'TM' },
  { name: 'Uganda', flag: '🇺🇬', dialCode: '+256', code: 'UG' },
  { name: 'Ukraine', flag: '🇺🇦', dialCode: '+380', code: 'UA' },
  { name: 'United Arab Emirates', flag: '🇦🇪', dialCode: '+971', code: 'AE' },
  { name: 'United Kingdom', flag: '🇬🇧', dialCode: '+44', code: 'GB' },
  { name: 'United States', flag: '🇺🇸', dialCode: '+1', code: 'US' },
  { name: 'Uruguay', flag: '🇺🇾', dialCode: '+598', code: 'UY' },
  { name: 'Uzbekistan', flag: '🇺🇿', dialCode: '+998', code: 'UZ' },
  { name: 'Venezuela', flag: '🇻🇪', dialCode: '+58', code: 'VE' },
  { name: 'Vietnam', flag: '🇻🇳', dialCode: '+84', code: 'VN' },
  { name: 'Yemen', flag: '🇾🇪', dialCode: '+967', code: 'YE' },
  { name: 'Zambia', flag: '🇿🇲', dialCode: '+260', code: 'ZM' },
  { name: 'Zimbabwe', flag: '🇿🇼', dialCode: '+263', code: 'ZW' },
];

export const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === 'TN')!;

interface CountryPickerModalProps {
  visible: boolean;
  selected: Country;
  onSelect: (country: Country) => void;
  onClose: () => void;
}

export const CountryPickerModal: React.FC<CountryPickerModalProps> = ({
  visible,
  selected,
  onSelect,
  onClose,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      search.trim()
        ? COUNTRIES.filter(
            (c) =>
              c.name.toLowerCase().includes(search.toLowerCase()) ||
              c.dialCode.includes(search),
          )
        : COUNTRIES,
    [search],
  );

  const handleClose = useCallback(() => {
    setSearch('');
    onClose();
  }, [onClose]);

  const handleSelect = useCallback(
    (country: Country) => {
      setSearch('');
      onSelect(country);
    },
    [onSelect],
  );

  const renderItem = useCallback(
    ({ item }: { item: Country }) => {
      const isSelected = item.code === selected.code;
      return (
        <Pressable
          onPress={() => handleSelect(item)}
          accessibilityRole="radio"
          accessibilityLabel={`${item.name} ${item.dialCode}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 13,
            backgroundColor: isSelected ? 'rgba(168,85,247,0.1)' : 'transparent',
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
            gap: 14,
          }}
        >
          <AppText style={{ fontSize: 24 }}>{item.flag}</AppText>
          <AppText
            style={{
              flex: 1,
              fontSize: 15,
              color: isSelected ? colors.neonPurple : theme.text,
              fontWeight: isSelected ? '600' : '400',
            }}
          >
            {item.name}
          </AppText>
          <AppText
            style={{
              fontSize: 14,
              color: isSelected ? colors.neonPurple : theme.textSecondary,
              fontWeight: '500',
            }}
          >
            {item.dialCode}
          </AppText>
          {isSelected && (
            <MaterialCommunityIcons name="check" size={18} color={colors.neonPurple} />
          )}
        </Pressable>
      );
    },
    [selected, handleSelect, theme],
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: theme.background,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '80%',
            borderTopWidth: 1,
            borderColor: theme.border,
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: theme.border,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
          >
            <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>
              {t('countryPicker.title')}
            </AppText>
            <Pressable
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Search */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginHorizontal: 20,
              marginVertical: 12,
              backgroundColor: theme.card,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: theme.border,
              paddingHorizontal: 12,
              gap: 8,
            }}
          >
            <MaterialCommunityIcons name="magnify" size={18} color={theme.textMuted} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={t('countryPicker.search')}
              placeholderTextColor={theme.textMuted}
              style={{ flex: 1, color: theme.text, fontSize: 15, paddingVertical: 11 }}
              accessibilityLabel={t('countryPicker.search')}
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} accessibilityRole="button" accessibilityLabel={t('common.close')}>
                <MaterialCommunityIcons name="close-circle" size={16} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
            getItemLayout={(_, index) => ({ length: 54, offset: 54 * index, index })}
          />
        </View>
      </View>
    </Modal>
  );
};
