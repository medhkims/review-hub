import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Pressable, Image, Linking, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ContactRow } from './ContactRow';
import { colors } from '@/core/theme/colors';
import type { OpeningHours, DayKey } from '@/domain/business/entities/businessDetailEntity';

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const SHORT_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

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
  onToggleOnline?: (value: boolean) => void;
  onOpeningHoursPress?: () => void;
  onToggleOpeningHoursVisible?: (value: boolean) => void;
  populated?: boolean;
  contacts?: ContactItem[];
  mapImageUri?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  isOnline?: boolean;
  openingHours?: OpeningHours;
  openingHoursVisible?: boolean;
}

const EMPTY_CONTACT_ITEMS: ContactItem[] = [
  { icon: 'phone', color: '#22C55E', labelKey: 'phoneNumber' },
  { icon: 'email-outline', color: '#F97316', labelKey: 'emailAddress' },
  { icon: 'web', color: '#94A3B8', labelKey: 'website' },
  { icon: 'instagram', color: '#E1306C', labelKey: 'instagram' },
  { icon: 'facebook', color: '#1877F2', labelKey: 'facebook' },
  { icon: 'music-note', color: '#FFFFFF', labelKey: 'tiktok' },
  { icon: 'youtube', color: '#FF0000', labelKey: 'youtube' },
  { icon: 'twitch', color: '#9146FF', labelKey: 'twitch' },
  { icon: 'alpha-k-circle', color: '#53FC18', labelKey: 'kick' },
  { icon: 'linkedin', color: '#0A66C2', labelKey: 'linkedin' },
  { icon: 'briefcase-outline', color: '#14A800', labelKey: 'upwork' },
];

interface ToggleRowProps {
  isActive: boolean;
  onToggle?: (value: boolean) => void;
  label: string;
  hint: string;
  icon: string;
  marginBottom?: number;
}

const TRACK_W = 44;
const TRACK_H = 24;
const THUMB_SIZE = 18;
const THUMB_OFFSET = 3;

const ToggleRow: React.FC<ToggleRowProps> = ({ isActive, onToggle, label, hint, icon, marginBottom = 12 }) => {
  const translateX = useRef(new Animated.Value(isActive ? TRACK_W - THUMB_SIZE - THUMB_OFFSET : THUMB_OFFSET)).current;

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: isActive ? TRACK_W - THUMB_SIZE - THUMB_OFFSET : THUMB_OFFSET,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  }, [isActive, translateX]);

  return (
    <Pressable
      onPress={onToggle ? () => onToggle(!isActive) : undefined}
      disabled={!onToggle}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: isActive }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: isActive ? `${colors.neonPurple}15` : colors.midnight,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 13,
        marginBottom,
        borderWidth: 1,
        borderColor: isActive ? `${colors.neonPurple}50` : 'rgba(255,255,255,0.06)',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {/* Left: icon + text */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, marginRight: 12 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: isActive ? `${colors.neonPurple}25` : 'rgba(255,255,255,0.05)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={isActive ? colors.neonPurple : colors.textSlate500}
          />
        </View>
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 14, fontWeight: '600', color: isActive ? colors.white : colors.textSlate200 }}>
            {label}
          </AppText>
          <AppText style={{ fontSize: 11, color: colors.textSlate500, marginTop: 1 }}>
            {hint}
          </AppText>
        </View>
      </View>

      {/* Custom toggle track */}
      <View
        style={{
          width: TRACK_W,
          height: TRACK_H,
          borderRadius: TRACK_H / 2,
          backgroundColor: isActive ? colors.neonPurple : 'rgba(255,255,255,0.1)',
          justifyContent: 'center',
          shadowColor: isActive ? colors.neonPurple : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: isActive ? 4 : 0,
        }}
      >
        <Animated.View
          style={{
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: isActive ? colors.white : colors.textSlate500,
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 3,
            elevation: 2,
          }}
        />
      </View>
    </Pressable>
  );
};

export const InformationCard: React.FC<InformationCardProps> = ({
  onEditAll,
  onLocationPress,
  onContactPress,
  onToggleOnline,
  onOpeningHoursPress,
  onToggleOpeningHoursVisible,
  populated = false,
  contacts,
  mapImageUri,
  location,
  latitude,
  longitude,
  isOnline = false,
  openingHours,
  openingHoursVisible,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  const openInMaps = useCallback(() => {
    if (!location) return;
    const url = latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
    Linking.openURL(url);
  }, [location, latitude, longitude]);

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

              {/* Online Business Toggle */}
              <ToggleRow
                isActive={isOnline}
                onToggle={onToggleOnline}
                icon="web"
                label={t('businessOwner.companyProfile.onlineBusiness')}
                hint={t('businessOwner.companyProfile.onlineBusinessHint')}
              />

              {/* Map / Location area — hidden when isOnline */}
              {!isOnline && <Pressable
                onPress={onLocationPress ?? (location ? openInMaps : undefined)}
                disabled={!onLocationPress && !location}
                accessibilityLabel={t('businessOwner.companyProfile.location')}
                accessibilityRole="button"
                style={{
                  width: '100%',
                  borderRadius: 16,
                  overflow: 'hidden',
                  backgroundColor: '#0b101e',
                  borderWidth: 1,
                  borderColor: onLocationPress
                    ? `${colors.neonPurple}40`
                    : location ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                  marginBottom: 24,
                }}
              >
                {/* Map image (if provided) or location display */}
                {mapImageUri ? (
                  <Image
                    source={{ uri: mapImageUri }}
                    style={{ width: '100%', height: 140 }}
                    resizeMode="cover"
                    accessibilityLabel={location || t('businessOwner.companyProfile.location')}
                  />
                ) : location ? (
                  <View
                    style={{
                      padding: 20,
                      alignItems: 'center',
                      gap: 10,
                      minHeight: 100,
                      justifyContent: 'center',
                    }}
                  >
                    <MaterialCommunityIcons name="map-marker-radius" size={36} color={colors.neonPurple} />
                    <AppText
                      style={{
                        fontSize: 13,
                        color: colors.textSlate200,
                        textAlign: 'center',
                        lineHeight: 20,
                      }}
                    >
                      {location}
                    </AppText>
                    {latitude && longitude && (
                      <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>
                        {latitude.toFixed(5)}, {longitude.toFixed(5)}
                      </AppText>
                    )}
                  </View>
                ) : (
                  <View style={{ height: 100, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="map-marker-plus-outline" size={32} color={colors.neonPurple} />
                    <AppText style={{ fontSize: 12, color: colors.textSlate400 }}>
                      {t('businessOwner.companyProfile.locationHint')}
                    </AppText>
                  </View>
                )}

                {/* Footer row */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.06)',
                  }}
                >
                  <MaterialCommunityIcons
                    name={location ? 'map-marker-check' : 'map-marker-plus-outline'}
                    size={14}
                    color={location ? colors.neonPurple : colors.textSlate500}
                  />
                  <AppText
                    style={{
                      flex: 1,
                      fontSize: 12,
                      color: location ? colors.textSlate200 : colors.textSlate500,
                      fontStyle: location ? 'normal' : 'italic',
                    }}
                    numberOfLines={1}
                  >
                    {location || t('businessOwner.companyProfile.locationHint')}
                  </AppText>
                  {onLocationPress && (
                    <MaterialCommunityIcons name="pencil" size={14} color={colors.neonPurple} />
                  )}
                </View>
              </Pressable>}

              {/* Opening Hours Section:
                  - Edit mode: always shown so owner can set/edit and toggle visibility
                  - View mode: only shown when hours exist AND visibility is ON */}
              {(onOpeningHoursPress || (openingHours && openingHoursVisible !== false)) && <View style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: colors.neonPurple, shadowColor: colors.neonPurple, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 5, elevation: 3 }} />
                    <AppText style={{ fontSize: 14, fontWeight: '700', color: colors.white }}>
                      {t('businessOwner.companyProfile.openingHours')}
                    </AppText>
                  </View>
                  {onOpeningHoursPress && (
                    <Pressable
                      onPress={onOpeningHoursPress}
                      accessibilityRole="button"
                      accessibilityLabel={t('businessOwner.companyProfile.openingHours')}
                      hitSlop={8}
                    >
                      <MaterialCommunityIcons name="pencil" size={16} color={colors.neonPurple} />
                    </Pressable>
                  )}
                </View>

                {openingHours ? (
                  <View>
                    <View style={{ gap: 4, marginBottom: 12 }}>
                      {DAY_KEYS.map((day, i) => {
                        const sched = openingHours[day];
                        return (
                          <View
                            key={day}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              paddingVertical: 6,
                              paddingHorizontal: 12,
                              borderRadius: 8,
                              backgroundColor: sched.isOpen ? `${colors.neonPurple}08` : 'transparent',
                            }}
                          >
                            <AppText style={{ fontSize: 13, fontWeight: sched.isOpen ? '600' : '400', color: sched.isOpen ? colors.textSlate200 : colors.textSlate500, width: 36 }}>
                              {t(`businessOwner.companyProfile.${SHORT_KEYS[i]}`)}
                            </AppText>
                            {sched.isOpen ? (
                              <AppText style={{ fontSize: 13, color: colors.white, fontWeight: '500' }}>
                                {sched.openTime} – {sched.closeTime}
                              </AppText>
                            ) : (
                              <AppText style={{ fontSize: 12, color: colors.textSlate500, fontStyle: 'italic' }}>
                                {t('businessOwner.companyProfile.closedDay')}
                              </AppText>
                            )}
                          </View>
                        );
                      })}
                    </View>
                    {/* Visibility toggle — always shown when hours exist */}
                    <ToggleRow
                      isActive={openingHoursVisible !== false}
                      onToggle={onToggleOpeningHoursVisible}
                      icon="eye-outline"
                      label={t('businessOwner.companyProfile.openingHoursVisible')}
                      hint={t('businessOwner.companyProfile.openingHoursVisibleHint')}
                      marginBottom={0}
                    />
                  </View>
                ) : (
                  <Pressable
                    onPress={onOpeningHoursPress}
                    disabled={!onOpeningHoursPress}
                    accessibilityRole="button"
                    accessibilityLabel={t('businessOwner.companyProfile.setOpeningHours')}
                    style={{
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: onOpeningHoursPress ? `${colors.neonPurple}40` : 'rgba(255,255,255,0.06)',
                      borderStyle: 'dashed',
                      paddingVertical: 18,
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <MaterialCommunityIcons name="clock-plus-outline" size={26} color={colors.neonPurple} />
                    <AppText style={{ fontSize: 13, color: onOpeningHoursPress ? colors.neonPurple : colors.textSlate500, fontWeight: '600' }}>
                      {t('businessOwner.companyProfile.setOpeningHours')}
                    </AppText>
                    <AppText style={{ fontSize: 11, color: colors.textSlate500 }}>
                      {t('businessOwner.companyProfile.openingHoursHint')}
                    </AppText>
                  </Pressable>
                )}
              </View>}

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
          accessibilityLabel={location || t('businessOwner.companyProfile.addLocation')}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: `${colors.midnight}80`,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: location ? `${colors.neonPurple}40` : `${colors.borderDark}80`,
          }}
        >
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: `${colors.neonPurple}1A`, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons
              name={location ? 'map-marker-check' : 'map-marker'}
              size={22}
              color={colors.neonPurple}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 14, fontWeight: '500', color: location ? colors.white : colors.textSlate200 }} numberOfLines={1}>
              {location || t('businessOwner.companyProfile.addLocation')}
            </AppText>
            {!location && (
              <AppText style={{ fontSize: 12, color: colors.textSlate500, marginTop: 2 }}>
                {t('businessOwner.companyProfile.locationHint')}
              </AppText>
            )}
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
