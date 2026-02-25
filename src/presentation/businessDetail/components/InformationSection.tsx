import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { SectionCard } from './SectionCard';
import { ContactInfo } from '@/domain/business/entities/businessDetailEntity';

interface InformationSectionProps {
  location: string;
  contact: ContactInfo;
}

interface ContactRowData {
  type: string;
  icon: string;
  label: string;
  value: string;
  url: string;
  verified?: boolean;
}

export const InformationSection: React.FC<InformationSectionProps> = ({
  location,
  contact,
}) => {
  const { t } = useTranslation();

  const contactRows: ContactRowData[] = [];

  if (contact.phone) {
    contactRows.push({
      type: 'phone',
      icon: 'phone',
      label: t('businessDetail.phone'),
      value: contact.phone,
      url: `tel:${contact.phone}`,
    });
  }

  if (contact.email) {
    contactRows.push({
      type: 'email',
      icon: 'email-outline',
      label: t('businessDetail.email'),
      value: contact.email,
      url: `mailto:${contact.email}`,
    });
  }

  if (contact.instagramHandle) {
    contactRows.push({
      type: 'instagram',
      icon: 'instagram',
      label: 'Instagram',
      value: `@${contact.instagramHandle}`,
      url: `https://instagram.com/${contact.instagramHandle}`,
      verified: true,
    });
  }

  if (contact.facebookName) {
    contactRows.push({
      type: 'facebook',
      icon: 'facebook',
      label: 'Facebook',
      value: contact.facebookName,
      url: `https://facebook.com/${contact.facebookName}`,
      verified: true,
    });
  }

  if (contact.website) {
    contactRows.push({
      type: 'website',
      icon: 'web',
      label: t('businessDetail.website'),
      value: contact.website,
      url: contact.website.startsWith('http') ? contact.website : `https://${contact.website}`,
    });
  }

  if (contact.tiktokHandle) {
    contactRows.push({
      type: 'tiktok',
      icon: 'music-note',
      label: 'TikTok',
      value: `@${contact.tiktokHandle}`,
      url: `https://tiktok.com/@${contact.tiktokHandle}`,
    });
  }

  const handlePress = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <SectionCard title={t('businessDetail.information')}>
      {/* Location */}
      <AppText style={{ fontWeight: '700', fontSize: 14, color: colors.white, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neonPurple, marginRight: 8 }} />
        {t('businessDetail.location')}
      </AppText>

      <View
        style={{
          width: '100%',
          height: 160,
          borderRadius: 16,
          overflow: 'hidden',
          marginBottom: 24,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          backgroundColor: '#0b101e',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name="map-marker-outline" size={32} color={colors.neonPurple} />
        <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 8 }}>
          {location}
        </AppText>
      </View>

      {/* Contact & Socials */}
      {contactRows.length > 0 && (
        <>
          <AppText style={{ fontWeight: '700', fontSize: 14, color: colors.white, marginBottom: 16 }}>
            {t('businessDetail.contactAndSocials')}
          </AppText>

          <View style={{ gap: 12 }}>
            {contactRows.map((row) => (
              <Pressable
                key={row.type}
                onPress={() => handlePress(row.url)}
                accessibilityLabel={`${row.label}: ${row.value}`}
                accessibilityRole="link"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: colors.midnight,
                  padding: 14,
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: pressed ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                })}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      padding: 8,
                      borderRadius: 8,
                      shadowColor: colors.neonPurple,
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.3,
                      shadowRadius: 5,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={row.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                      size={16}
                      color={colors.neonPurple}
                    />
                  </View>
                  <View>
                    <AppText style={{ fontSize: 10, color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {row.label}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <AppText style={{ fontSize: 12, color: row.verified ? colors.success : colors.white, fontWeight: '500', letterSpacing: 0.5 }}>
                        {row.value}
                      </AppText>
                      {row.verified && (
                        <MaterialCommunityIcons name="check-circle" size={10} color={colors.success} />
                      )}
                    </View>
                  </View>
                </View>
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={14}
                  color={colors.textSlate500}
                />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </SectionCard>
  );
};
