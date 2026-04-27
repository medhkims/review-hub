import React from 'react';
import { View, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SectionCard } from './SectionCard';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { AnnouncementEntity } from '@/domain/announcement/entities/announcementEntity';

interface AnnouncementsSectionProps {
  announcements: AnnouncementEntity[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Filter out expired announcements
  const now = new Date();
  const active = announcements.filter(
    (a) => !a.validUntil || a.validUntil > now,
  );

  if (active.length === 0) return null;

  return (
    <SectionCard title={t('businessDetail.announcements')}>
      <View style={{ gap: 14 }}>
        {active.map((announcement) => (
          <View
            key={announcement.id}
            style={{
              backgroundColor: theme.background,
              borderRadius: 16,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: `${colors.neonPurple}20`,
            }}
          >
            {/* Image */}
            {announcement.imageUrl && (
              <Image
                source={{ uri: announcement.imageUrl }}
                style={{ width: '100%', height: 140 }}
                resizeMode="cover"
                accessibilityLabel={announcement.title}
              />
            )}

            {/* Content */}
            <View style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <MaterialCommunityIcons name="bullhorn-outline" size={18} color={colors.neonPurple} />
                <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, flex: 1 }}>
                  {announcement.title}
                </AppText>
              </View>

              <AppText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 20 }}>
                {announcement.description}
              </AppText>

              {/* Validity badge */}
              {announcement.validUntil && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 }}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color={theme.textMuted} />
                  <AppText style={{ fontSize: 11, color: theme.textMuted }}>
                    {t('businessDetail.validUntil', {
                      date: announcement.validUntil.toLocaleDateString(),
                    })}
                  </AppText>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>
    </SectionCard>
  );
};
