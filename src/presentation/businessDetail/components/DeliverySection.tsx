import React, { useState } from 'react';
import { View, Pressable, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { SectionCard } from './SectionCard';
import { DeliveryService } from '@/domain/business/entities/businessDetailEntity';
import { trackProfileClick } from '@/core/utils/premiumTracking';
import { openURL, openPhone } from '@/core/utils/webLinks';

interface DeliverySectionProps {
  deliveryServices: DeliveryService[];
  businessId?: string;
}

const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  YAS: { bg: 'rgba(128, 0, 128, 0.2)', text: colors.white, border: 'rgba(255, 255, 255, 0.05)' },
  GLO: { bg: 'rgba(234, 179, 8, 0.1)', text: '#EAB308', border: 'rgba(234, 179, 8, 0.3)' },
};

export const DeliverySection: React.FC<DeliverySectionProps> = ({ deliveryServices, businessId }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [choiceService, setChoiceService] = useState<DeliveryService | null>(null);

  if (deliveryServices.length === 0) return null;

  const handlePress = (service: DeliveryService) => {
    if (businessId) trackProfileClick(businessId, `delivery_${service.abbreviation}`);
    const hasUrl = !!service.url;
    const hasPhone = !!service.phone;

    if (hasUrl && hasPhone) {
      setChoiceService(service);
    } else if (hasUrl) {
      openURL(service.url!);
    } else if (hasPhone) {
      openPhone(service.phone!);
    }
  };

  return (
    <>
    <Modal visible={!!choiceService} transparent animationType="fade" onRequestClose={() => setChoiceService(null)}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}
        onPress={() => setChoiceService(null)}
        accessibilityLabel={t('common.cancel')}
        accessibilityRole="button"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          accessibilityRole="none"
          style={{ backgroundColor: theme.card, borderRadius: 20, padding: 24, gap: 16 }}
        >
          <AppText style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>{choiceService?.name}</AppText>
          <AppText style={{ fontSize: 14, color: theme.textSecondary }}>{t('businessDetail.deliveryOpenWith')}</AppText>
          <Pressable
            onPress={() => { openURL(choiceService!.url!); setChoiceService(null); }}
            accessibilityLabel={t('businessDetail.openWebsite')}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              padding: 16, borderRadius: 14,
              backgroundColor: pressed ? `${colors.neonPurple}30` : `${colors.neonPurple}15`,
              borderWidth: 1, borderColor: `${colors.neonPurple}40`,
            })}
          >
            <MaterialCommunityIcons name="web" size={20} color={colors.neonPurple} />
            <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.neonPurple }}>{t('businessDetail.openWebsite')}</AppText>
          </Pressable>
          <Pressable
            onPress={() => { openPhone(choiceService!.phone!); setChoiceService(null); }}
            accessibilityLabel={t('businessDetail.callNumber')}
            accessibilityRole="button"
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              padding: 16, borderRadius: 14,
              backgroundColor: pressed ? `${colors.success}30` : `${colors.success}15`,
              borderWidth: 1, borderColor: `${colors.success}40`,
            })}
          >
            <MaterialCommunityIcons name="phone" size={20} color={colors.success} />
            <AppText style={{ fontSize: 15, fontWeight: '600', color: colors.success }}>{t('businessDetail.callNumber')}</AppText>
          </Pressable>
          <Pressable
            onPress={() => setChoiceService(null)}
            accessibilityLabel={t('common.cancel')}
            accessibilityRole="button"
            style={{ padding: 14, borderRadius: 14, borderWidth: 1, borderColor: theme.border, alignItems: 'center' }}
          >
            <AppText style={{ color: theme.textSecondary, fontWeight: '600' }}>{t('common.cancel')}</AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
    <SectionCard title={t('businessDetail.delivery')} defaultExpanded={true}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {deliveryServices.map((service) => {
          const style = SERVICE_COLORS[service.abbreviation] ?? {
            bg: 'rgba(168, 85, 247, 0.1)',
            text: theme.text,
            border: 'rgba(255, 255, 255, 0.05)',
          };
          const isClickable = !!(service.url || service.phone);

          return (
            <Pressable
              key={service.id}
              onPress={() => isClickable && handlePress(service)}
              accessibilityLabel={`${t('businessDetail.orderVia')} ${service.name}`}
              accessibilityRole="button"
              disabled={!isClickable}
              style={({ pressed }) => ({
                flex: 1,
                minWidth: '40%',
                backgroundColor: theme.background,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: service.isActive ? 'rgba(34, 197, 94, 0.3)' : style.border,
                alignItems: 'center',
                gap: 12,
                position: 'relative',
                overflow: 'hidden',
                transform: [{ scale: pressed && isClickable ? 0.95 : 1 }],
                opacity: isClickable ? 1 : 0.6,
              })}
            >
              {service.isActive && (
                <View
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: colors.success,
                    shadowColor: colors.success,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 3,
                  }}
                />
              )}
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: style.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: style.border,
                  marginBottom: 4,
                }}
              >
                <AppText style={{ fontSize: 12, fontWeight: '700', color: style.text, letterSpacing: 2, textTransform: 'uppercase' }}>
                  {service.abbreviation}
                </AppText>
              </View>
              <AppText style={{ fontSize: 14, fontWeight: '600', color: theme.text, letterSpacing: 0.5, textAlign: 'center' }}>
                {t('businessDetail.orderVia')} {service.name}
              </AppText>
              {/* Hint icons */}
              {isClickable && (
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {service.url && (
                    <View style={{ backgroundColor: `${colors.neonPurple}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
                      <AppText style={{ fontSize: 10, color: colors.neonPurple }}>🌐</AppText>
                    </View>
                  )}
                  {service.phone && (
                    <View style={{ backgroundColor: `${colors.success}20`, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 }}>
                      <AppText style={{ fontSize: 10, color: colors.success }}>📞</AppText>
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </SectionCard>
    </>
  );
};
