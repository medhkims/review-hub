import React from 'react';
import { View, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

interface ContactRowProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string;
  verified?: boolean;
  manageable?: boolean;
  populated?: boolean;
  onPress?: () => void;
}

export const ContactRow: React.FC<ContactRowProps> = ({
  icon,
  iconColor,
  label,
  value,
  verified,
  manageable,
  populated = false,
  onPress,
}) => {
  const { t } = useTranslation();

  if (populated) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityLabel={label}
        accessibilityRole="button"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 14,
          borderRadius: 16,
          backgroundColor: colors.midnight,
          borderWidth: 1,
          borderColor: pressed ? `${colors.neonPurple}30` : 'rgba(255, 255, 255, 0.05)',
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: `${colors.neonPurple}1A`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MaterialCommunityIcons
              name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={16}
              color={colors.neonPurple}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 10, color: colors.textSlate500, textTransform: 'uppercase', letterSpacing: 1 }}>
              {label}
            </AppText>
            {value ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <AppText style={{ fontSize: 12, fontWeight: '500', color: verified ? colors.success : colors.white, letterSpacing: 0.3 }}>
                  {value}
                </AppText>
                {verified && (
                  <MaterialCommunityIcons name="check-circle" size={12} color={colors.success} />
                )}
              </View>
            ) : (
              <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
                {t('businessOwner.companyProfile.add')}
              </AppText>
            )}
          </View>
        </View>

        {manageable ? (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 4,
              backgroundColor: `${colors.neonPurple}1A`,
            }}
          >
            <AppText style={{ fontSize: 10, fontWeight: '500', color: colors.neonPurple }}>
              {t('businessOwner.companyProfile.manage')}
            </AppText>
          </View>
        ) : (
          <MaterialCommunityIcons name="pencil" size={14} color={colors.textSlate500} />
        )}
      </Pressable>
    );
  }

  // Empty state (original)
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 8,
        borderRadius: 12,
        backgroundColor: pressed ? `${colors.borderDark}50` : 'transparent',
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${iconColor}1A`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={18}
            color={iconColor}
          />
        </View>
        <AppText style={{ fontSize: 14, color: colors.textSlate200 }}>
          {value || label}
        </AppText>
      </View>
      {!value && (
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: `${colors.neonPurple}1A`,
          }}
        >
          <AppText style={{ fontSize: 12, fontWeight: '700', color: colors.neonPurple }}>
            {t('businessOwner.companyProfile.add')}
          </AppText>
        </View>
      )}
    </Pressable>
  );
};
