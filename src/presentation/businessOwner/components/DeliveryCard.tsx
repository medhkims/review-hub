import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface DeliveryService {
  id: string;
  name: string;
  abbreviation: string;
  bgColor: string;
  textColor: string;
  linked: boolean;
}

interface DeliveryCardProps {
  services?: DeliveryService[];
  onAddLink?: (serviceId: string) => void;
  populated?: boolean;
}

const DEFAULT_SERVICES: DeliveryService[] = [
  { id: 'yassir', name: 'Yassir', abbreviation: 'YAS', bgColor: '#351C4D', textColor: '#FFFFFF', linked: false },
  { id: 'glovo', name: 'Glovo', abbreviation: 'GLO', bgColor: '#3D371F', textColor: '#FFC244', linked: false },
];

export const DeliveryCard: React.FC<DeliveryCardProps> = ({
  services = DEFAULT_SERVICES,
  onAddLink,
  populated = false,
}) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  return (
    <View
      style={{
        backgroundColor: colors.cardDark,
        borderRadius: populated ? 24 : 16,
        overflow: 'hidden',
        borderWidth: populated ? 1 : 0,
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Left accent bar (empty state only) */}
      {!populated && (
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
      )}

      {/* Header */}
      <Pressable
        onPress={() => setExpanded(!expanded)}
        accessibilityLabel={t('businessOwner.companyProfile.delivery')}
        accessibilityRole="button"
        style={populated ? {
          backgroundColor: `${colors.neonPurple}08`,
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeftWidth: 6,
          borderLeftColor: colors.neonPurple,
        } : {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 20,
          paddingBottom: expanded ? 4 : 20,
          paddingLeft: 28,
        }}
      >
        <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.neonPurple, letterSpacing: populated ? 0.5 : 0 }}>
          {t('businessOwner.companyProfile.delivery')}
        </AppText>
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={24}
          color={colors.neonPurple}
        />
      </Pressable>

      {/* Services Grid */}
      {expanded && (
        <View style={{ padding: populated ? 24 : 20, paddingTop: populated ? 24 : 16 }}>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            {services.map((service) => (
              <View
                key={service.id}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: 16,
                  paddingVertical: 20,
                  borderRadius: populated ? 16 : 20,
                  backgroundColor: colors.midnight,
                  borderWidth: 1,
                  borderColor: service.linked
                    ? `${colors.success}30`
                    : `${colors.error}30`,
                }}
              >
                {/* Status dot */}
                <View
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: service.linked ? colors.success : colors.error,
                    shadowColor: service.linked ? colors.success : colors.error,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 8,
                    elevation: 4,
                  }}
                />

                {/* Logo circle */}
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: service.bgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: 'rgba(255, 255, 255, 0.05)',
                    marginBottom: 4,
                  }}
                >
                  <AppText style={{ color: service.textColor, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' }}>
                    {service.abbreviation}
                  </AppText>
                </View>

                {/* Name */}
                <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white, letterSpacing: 0.3 }}>
                  {service.name}
                </AppText>

                {/* Status badge or Add Link button */}
                {populated ? (
                  <View
                    style={{
                      width: '100%',
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor: service.linked ? `${colors.success}1A` : `${colors.error}1A`,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      borderWidth: 1,
                      borderColor: service.linked ? `${colors.success}33` : `${colors.error}33`,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={service.linked ? 'check-circle' : 'minus-circle'}
                      size={14}
                      color={service.linked ? colors.success : colors.error}
                    />
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: service.linked ? colors.success : colors.error }}>
                      {service.linked
                        ? t('businessOwner.companyProfile.active')
                        : t('businessOwner.companyProfile.inactive')}
                    </AppText>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => onAddLink?.(service.id)}
                    accessibilityLabel={`${t('businessOwner.companyProfile.addLink')} ${service.name}`}
                    accessibilityRole="button"
                    style={{
                      width: '100%',
                      paddingVertical: 10,
                      borderRadius: 12,
                      backgroundColor: '#2E2344',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons name="link" size={16} color={colors.neonPurple} />
                    <AppText style={{ fontSize: 12, fontWeight: '500', color: colors.neonPurple }}>
                      {t('businessOwner.companyProfile.addLink')}
                    </AppText>
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};
