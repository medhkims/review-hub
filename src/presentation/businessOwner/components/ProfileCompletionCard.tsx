import React, { useMemo } from 'react';
import { View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { BusinessDetailEntity } from '@/domain/business/entities/businessDetailEntity';
import Svg, { Circle } from 'react-native-svg';

interface CheckItem {
  key: string;
  icon: string;
  labelKey: string;
  filled: boolean;
}

function getCheckItems(business: BusinessDetailEntity): CheckItem[] {
  return [
    { key: 'name', icon: 'store', labelKey: 'businessOwner.profileCompletion.addName', filled: !!business.name },
    { key: 'description', icon: 'text', labelKey: 'businessOwner.profileCompletion.addDescription', filled: !!business.description },
    { key: 'cover', icon: 'image', labelKey: 'businessOwner.profileCompletion.addCoverImage', filled: !!business.coverImageUrl },
    { key: 'logo', icon: 'account-circle', labelKey: 'businessOwner.profileCompletion.addLogo', filled: !!business.logoUrl },
    { key: 'phone', icon: 'phone', labelKey: 'businessOwner.profileCompletion.addPhone', filled: !!business.contact.phone },
    { key: 'email', icon: 'email', labelKey: 'businessOwner.profileCompletion.addEmail', filled: !!business.contact.email },
    { key: 'location', icon: 'map-marker', labelKey: 'businessOwner.profileCompletion.addLocation', filled: !!business.location },
    { key: 'hours', icon: 'clock-outline', labelKey: 'businessOwner.profileCompletion.addOpeningHours', filled: !!business.openingHours },
    { key: 'menu', icon: 'food', labelKey: 'businessOwner.profileCompletion.addMenu', filled: business.menuCategories.length > 0 },
    { key: 'gallery', icon: 'image-multiple', labelKey: 'businessOwner.profileCompletion.addPhotos', filled: business.galleryImages.length > 0 },
  ];
}

const RING_SIZE = 72;
const STROKE_WIDTH = 6;
const RADIUS = (RING_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface ProfileCompletionCardProps {
  business: BusinessDetailEntity;
}

export const ProfileCompletionCard: React.FC<ProfileCompletionCardProps> = ({ business }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const items = useMemo(() => getCheckItems(business), [business]);
  const filledCount = items.filter((i) => i.filled).length;
  const percentage = Math.round((filledCount / items.length) * 100);
  const isComplete = percentage === 100;
  const missingItems = items.filter((i) => !i.filled);

  const strokeDashoffset = CIRCUMFERENCE - (CIRCUMFERENCE * percentage) / 100;

  if (isComplete) return null;

  return (
    <View
      style={{
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: theme.border,
      }}
    >
      {/* Header with ring */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        {/* Progress ring */}
        <View style={{ width: RING_SIZE, height: RING_SIZE, alignItems: 'center', justifyContent: 'center' }}>
          <Svg width={RING_SIZE} height={RING_SIZE}>
            {/* Background circle */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={theme.isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(148, 163, 184, 0.3)'}
              strokeWidth={STROKE_WIDTH}
              fill="none"
            />
            {/* Progress arc */}
            <Circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              stroke={colors.neonPurple}
              strokeWidth={STROKE_WIDTH}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
            />
          </Svg>
          <AppText
            style={{
              position: 'absolute',
              fontSize: 16,
              fontWeight: '700',
              color: colors.neonPurple,
            }}
          >
            {percentage}%
          </AppText>
        </View>

        {/* Title + subtitle */}
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
            {t('businessOwner.profileCompletion.title')}
          </AppText>
          <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 4 }}>
            {filledCount}/{items.length} {t('common.done').toLowerCase()}
          </AppText>
        </View>
      </View>

      {/* Missing items tips */}
      {missingItems.length > 0 && (
        <View style={{ marginTop: 16, gap: 8 }}>
          {missingItems.slice(0, 3).map((item) => (
            <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: `${colors.neonPurple}15`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialCommunityIcons
                  name={item.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                  size={14}
                  color={colors.neonPurple}
                />
              </View>
              <AppText style={{ fontSize: 13, color: theme.textSecondary, flex: 1 }}>
                {t(item.labelKey)}
              </AppText>
            </View>
          ))}
          {missingItems.length > 3 && (
            <AppText style={{ fontSize: 12, color: theme.textMuted, marginLeft: 38 }}>
              +{missingItems.length - 3} more
            </AppText>
          )}
        </View>
      )}
    </View>
  );
};
