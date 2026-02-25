import React, { useState } from 'react';
import { View, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ContactRow } from './ContactRow';
import { colors } from '@/core/theme/colors';

interface ContactItem {
  icon: string;
  color: string;
  labelKey: string;
  value?: string;
  verified?: boolean;
  manageable?: boolean;
}

interface InformationCardProps {
  onEditAll?: () => void;
  onLocationPress?: () => void;
  onContactPress?: (type: string) => void;
  populated?: boolean;
  contacts?: ContactItem[];
  mapImageUri?: string;
}

const EMPTY_CONTACT_ITEMS: ContactItem[] = [
  { icon: 'phone', color: '#22C55E', labelKey: 'phoneNumber' },
  { icon: 'email-outline', color: '#F97316', labelKey: 'emailAddress' },
  { icon: 'web', color: '#94A3B8', labelKey: 'website' },
  { icon: 'instagram', color: '#E1306C', labelKey: 'instagram' },
  { icon: 'facebook', color: '#1877F2', labelKey: 'facebook' },
  { icon: 'music-note', color: '#FFFFFF', labelKey: 'tiktok' },
  { icon: 'linkedin', color: '#0A66C2', labelKey: 'linkedin' },
  { icon: 'briefcase-outline', color: '#14A800', labelKey: 'upwork' },
];

export const InformationCard: React.FC<InformationCardProps> = ({
  onEditAll,
  onLocationPress,
  onContactPress,
  populated = false,
  contacts,
  mapImageUri,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  if (populated) {
    const contactItems = contacts || EMPTY_CONTACT_ITEMS;

    return (
      <View
        style={{
          backgroundColor: colors.cardDark,
          borderRadius: 24,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {/* Header */}
        <Pressable
          onPress={() => setExpanded(!expanded)}
          accessibilityLabel={t('businessOwner.companyProfile.information')}
          accessibilityRole="button"
          style={{
            backgroundColor: `${colors.neonPurple}08`,
            paddingHorizontal: 24,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderLeftWidth: 6,
            borderLeftColor: colors.neonPurple,
          }}
        >
          <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.neonPurple, letterSpacing: 0.5 }}>
            {t('businessOwner.companyProfile.information')}
          </AppText>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.neonPurple}
          />
        </Pressable>

        {expanded && (
          <View style={{ padding: 24 }}>
            {/* Location Section */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neonPurple, shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 }} />
                <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
                  {t('businessOwner.companyProfile.location')}
                </AppText>
              </View>

              {/* Map placeholder */}
              <Pressable
                onPress={onLocationPress}
                accessibilityLabel={t('businessOwner.companyProfile.location')}
                accessibilityRole="button"
                style={{
                  width: '100%',
                  height: 160,
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: '#0b101e',
                  borderWidth: 1,
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  marginBottom: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {mapImageUri ? (
                  <Image
                    source={{ uri: mapImageUri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="map-marker" size={32} color={colors.neonPurple} />
                    <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
                      {t('businessOwner.companyProfile.locationHint')}
                    </AppText>
                  </View>
                )}
              </Pressable>

              {/* Contact & Socials Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neonPurple, shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 }} />
                <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
                  {t('businessOwner.companyProfile.contactSocials')}
                </AppText>
              </View>

              {/* Contact items */}
              <View style={{ gap: 12 }}>
                {contactItems.map((item) => (
                  <ContactRow
                    key={item.labelKey}
                    icon={item.icon}
                    iconColor={item.color}
                    label={t(`businessOwner.companyProfile.${item.labelKey}`)}
                    value={item.value}
                    verified={item.verified}
                    manageable={item.manageable}
                    populated={populated}
                    onPress={() => onContactPress?.(item.labelKey)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }

  // Empty state (original)
  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: 16,
        padding: 20,
        overflow: 'hidden',
      }}
    >
      {/* Left accent bar */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: colors.neonPurple,
        }}
      />

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingLeft: 8 }}>
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.white }}>
          {t('businessOwner.companyProfile.information')}
        </AppText>
        <Pressable onPress={onEditAll} accessibilityLabel={t('businessOwner.companyProfile.editAll')} accessibilityRole="button">
          <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.neonPurple }}>
            {t('businessOwner.companyProfile.editAll')}
          </AppText>
        </Pressable>
      </View>

      {/* Location Section */}
      <View style={{ marginBottom: 24 }}>
        <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 1.5, paddingLeft: 8, marginBottom: 12 }}>
          {t('businessOwner.companyProfile.location')}
        </AppText>
        <Pressable
          onPress={onLocationPress}
          accessibilityLabel={t('businessOwner.companyProfile.addLocation')}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: `${colors.midnight}80`,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: `${colors.borderDark}80`,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.neonPurple}1A`, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="map-marker" size={22} color={colors.neonPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: colors.textSlate200 }}>
              {t('businessOwner.companyProfile.addLocation')}
            </AppText>
            <AppText style={{ fontSize: 12, color: colors.textSlate500, marginTop: 2 }}>
              {t('businessOwner.companyProfile.locationHint')}
            </AppText>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSlate500} />
        </Pressable>
      </View>

      {/* Contact & Socials Section */}
      <View>
        <AppText style={{ fontSize: 11, fontWeight: '600', color: colors.textSlate400, textTransform: 'uppercase', letterSpacing: 1.5, paddingLeft: 8, marginBottom: 12 }}>
          {t('businessOwner.companyProfile.contactSocials')}
        </AppText>
        <View style={{ gap: 4 }}>
          {EMPTY_CONTACT_ITEMS.map((item) => (
            <ContactRow
              key={item.labelKey}
              icon={item.icon}
              iconColor={item.color}
              label={t(`businessOwner.companyProfile.${item.labelKey}`)}
              onPress={() => onContactPress?.(item.labelKey)}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
