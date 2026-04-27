import React from 'react';
import { View, Pressable, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { SectionCard } from './SectionCard';
import { ContactInfo, OpeningHours, DayKey } from '@/domain/business/entities/businessDetailEntity';
import { trackProfileClick } from '@/core/utils/premiumTracking';
import { openURL } from '@/core/utils/webLinks';

const GMAPS_KEY: string =
  ((Constants.expoConfig?.extra as Record<string, string> | undefined)?.googleMapsApiKey) ?? '';

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SHORT_KEYS: Record<DayKey, string> = {
  monday: 'mon', tuesday: 'tue', wednesday: 'wed', thursday: 'thu',
  friday: 'fri', saturday: 'sat', sunday: 'sun',
};

interface InformationSectionProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  contact: ContactInfo;
  isOnline?: boolean;
  businessId?: string;
  openingHours?: OpeningHours;
  openingHoursVisible?: boolean;
}

interface ContactRowData {
  type: string;
  icon: string;
  label: string;
  value: string;
  url: string;
  verified?: boolean;
}

const openDirections = (lat: number, lng: number) => {
  const url = Platform.select({
    ios: `maps://app?daddr=${lat},${lng}`,
    android: `google.navigation:q=${lat},${lng}`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
  });
  openURL(url);
};

export const InformationSection: React.FC<InformationSectionProps> = ({
  location,
  latitude,
  longitude,
  contact,
  isOnline = false,
  businessId,
  openingHours,
  openingHoursVisible,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

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

  if (contact.youtubeHandle) {
    contactRows.push({
      type: 'youtube',
      icon: 'youtube',
      label: 'YouTube',
      value: contact.youtubeHandle,
      url: `https://youtube.com/@${contact.youtubeHandle}`,
    });
  }

  if (contact.twitchHandle) {
    contactRows.push({
      type: 'twitch',
      icon: 'twitch',
      label: 'Twitch',
      value: contact.twitchHandle,
      url: `https://twitch.tv/${contact.twitchHandle}`,
    });
  }

  if (contact.kickHandle) {
    contactRows.push({
      type: 'kick',
      icon: 'alpha-k-circle',
      label: 'Kick',
      value: contact.kickHandle,
      url: `https://kick.com/${contact.kickHandle}`,
    });
  }

  const handlePress = (url: string, type: string) => {
    if (businessId) trackProfileClick(businessId, type);
    openURL(url);
  };

  return (
    <SectionCard title={t('businessDetail.information')}>
      {/* Location */}
      <AppText style={{ fontWeight: '700', fontSize: 14, color: theme.text, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neonPurple, marginRight: 8 }} />
        {t('businessDetail.location')}
      </AppText>

      {isOnline ? (
        <View
          style={{
            width: '100%',
            borderRadius: 16,
            marginBottom: 24,
            borderWidth: 1,
            borderColor: `${colors.neonPurple}40`,
            backgroundColor: `${colors.neonPurple}10`,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            paddingHorizontal: 18,
            paddingVertical: 16,
          }}
        >
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${colors.neonPurple}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons name="web" size={24} color={colors.neonPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>
              {t('businessDetail.onlineBusiness')}
            </AppText>
            <AppText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 2 }}>
              {t('businessDetail.onlineBusinessDescription')}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={{ marginBottom: 24 }}>
          {latitude && longitude && GMAPS_KEY ? (
            <Pressable
              onPress={() => {
                if (businessId) trackProfileClick(businessId, 'map');
                openDirections(latitude, longitude);
              }}
              accessibilityRole="button"
              accessibilityLabel={t('businessDetail.getDirections')}
              style={{
                width: '100%',
                height: 160,
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.background,
              }}
            >
              <Image
                source={{
                  uri: `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=600x300&maptype=roadmap&markers=color:purple%7C${latitude},${longitude}&key=${GMAPS_KEY}`,
                }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={`Map showing ${location}`}
              />
            </Pressable>
          ) : (
            <View
              style={{
                width: '100%',
                height: 160,
                borderRadius: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.background,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={32} color={colors.neonPurple} />
              <AppText style={{ fontSize: 12, color: theme.textSecondary, marginTop: 8 }}>
                {location}
              </AppText>
            </View>
          )}

          {/* Location text + Get Directions */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="map-marker" size={14} color={colors.neonPurple} />
              <AppText style={{ fontSize: 13, color: theme.textSecondary, flex: 1 }} numberOfLines={1}>
                {location}
              </AppText>
            </View>
            {latitude && longitude && (
              <Pressable
                onPress={() => {
                  if (businessId) trackProfileClick(businessId, 'directions');
                  openDirections(latitude, longitude);
                }}
                accessibilityRole="button"
                accessibilityLabel={t('businessDetail.getDirections')}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                  backgroundColor: `${colors.neonPurple}15`,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <MaterialCommunityIcons name="directions" size={16} color={colors.neonPurple} />
                <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
                  {t('businessDetail.getDirections')}
                </AppText>
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Opening Hours */}
      {openingHours && openingHoursVisible !== false && (
        <View style={{ marginBottom: 24 }}>
          <AppText style={{ fontWeight: '700', fontSize: 14, color: theme.text, marginBottom: 12 }}>
            {t('businessDetail.openingHours')}
          </AppText>
          <View style={{ gap: 8 }}>
            {DAY_KEYS.map((day) => {
              const schedule = openingHours[day];
              const isOpen = schedule?.isOpen ?? false;
              return (
                <View
                  key={day}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                    borderRadius: 12,
                    backgroundColor: isOpen ? `${colors.neonPurple}10` : 'rgba(255,255,255,0.03)',
                    borderWidth: 1,
                    borderColor: isOpen ? `${colors.neonPurple}30` : 'rgba(255,255,255,0.06)',
                  }}
                >
                  <AppText style={{ fontSize: 13, fontWeight: '600', color: isOpen ? theme.text : theme.textMuted, width: 36 }}>
                    {t(`businessOwner.companyProfile.${SHORT_KEYS[day]}`)}
                  </AppText>
                  {isOpen && schedule ? (
                    <AppText style={{ fontSize: 13, color: theme.textSecondary }}>
                      {schedule.openTime} – {schedule.closeTime}
                    </AppText>
                  ) : (
                    <AppText style={{ fontSize: 12, color: theme.textMuted }}>
                      {t('businessDetail.closedDay')}
                    </AppText>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Contact & Socials */}
      {contactRows.length > 0 && (
        <>
          <AppText style={{ fontWeight: '700', fontSize: 14, color: theme.text, marginBottom: 16 }}>
            {t('businessDetail.contactAndSocials')}
          </AppText>

          <View style={{ gap: 12 }}>
            {contactRows.map((row) => (
              <Pressable
                key={row.type}
                onPress={() => handlePress(row.url, row.type)}
                accessibilityLabel={`${row.label}: ${row.value}`}
                accessibilityRole="link"
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: theme.background,
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
                    <AppText style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>
                      {row.label}
                    </AppText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <AppText style={{ fontSize: 12, color: row.verified ? colors.success : theme.text, fontWeight: '500', letterSpacing: 0.5 }}>
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
                  color={theme.textMuted}
                />
              </Pressable>
            ))}
          </View>
        </>
      )}
    </SectionCard>
  );
};
