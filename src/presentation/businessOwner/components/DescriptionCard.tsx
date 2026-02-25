import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface DescriptionCardProps {
  description?: string;
  onPress?: () => void;
  populated?: boolean;
}

export const DescriptionCard: React.FC<DescriptionCardProps> = ({ description, onPress, populated = false }) => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  if (populated) {
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
          accessibilityLabel={t('businessOwner.companyProfile.description')}
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
            {t('businessOwner.companyProfile.description')}
          </AppText>
          <MaterialCommunityIcons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            color={colors.neonPurple}
          />
        </Pressable>

        {/* Content */}
        {expanded && (
          <View style={{ padding: 24 }}>
            <AppText style={{ fontSize: 14, color: colors.textSlate200, lineHeight: 22, fontWeight: '300' }}>
              {description || t('businessOwner.companyProfile.descriptionPlaceholder')}
            </AppText>
          </View>
        )}
      </View>
    );
  }

  // Empty state (original)
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={t('businessOwner.companyProfile.description')}
      accessibilityRole="button"
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
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingLeft: 8 }}>
        <MaterialCommunityIcons name="text-box-outline" size={24} color={colors.neonPurple} style={{ marginTop: 2 }} />
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, marginBottom: 4 }}>
            {t('businessOwner.companyProfile.description')}
          </AppText>
          <AppText style={{ fontSize: 14, color: colors.textSlate400, fontStyle: 'italic' }}>
            {description || t('businessOwner.companyProfile.descriptionPlaceholder')}
          </AppText>
        </View>
        <MaterialCommunityIcons name="pencil" size={16} color={colors.textSlate500} />
      </View>
    </Pressable>
  );
};
