import React from 'react';
import { View, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { SectionCard } from './SectionCard';
import { DeliveryService } from '@/domain/business/entities/businessDetailEntity';

interface DeliverySectionProps {
  deliveryServices: DeliveryService[];
}

const SERVICE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  YAS: { bg: 'rgba(128, 0, 128, 0.2)', text: colors.white, border: 'rgba(255, 255, 255, 0.05)' },
  GLO: { bg: 'rgba(234, 179, 8, 0.1)', text: '#EAB308', border: 'rgba(234, 179, 8, 0.3)' },
};

export const DeliverySection: React.FC<DeliverySectionProps> = ({ deliveryServices }) => {
  const { t } = useTranslation();

  if (deliveryServices.length === 0) return null;

  const handlePress = (url: string | null) => {
    if (url) {
      Linking.openURL(url).catch(() => {});
    }
  };

  return (
    <SectionCard title={t('businessDetail.delivery')} defaultExpanded={false}>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {deliveryServices.map((service) => {
          const style = SERVICE_COLORS[service.abbreviation] ?? {
            bg: 'rgba(168, 85, 247, 0.1)',
            text: colors.white,
            border: 'rgba(255, 255, 255, 0.05)',
          };

          return (
            <Pressable
              key={service.id}
              onPress={() => handlePress(service.url)}
              accessibilityLabel={`${t('businessDetail.orderVia')} ${service.name}`}
              accessibilityRole="button"
              style={({ pressed }) => ({
                flex: 1,
                backgroundColor: colors.midnight,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: service.isActive ? 'rgba(34, 197, 94, 0.3)' : style.border,
                alignItems: 'center',
                gap: 12,
                position: 'relative',
                overflow: 'hidden',
                transform: [{ scale: pressed ? 0.95 : 1 }],
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
              <AppText style={{ fontSize: 14, fontWeight: '600', color: colors.white, letterSpacing: 0.5 }}>
                {t('businessDetail.orderVia')} {service.name}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </SectionCard>
  );
};
