import React from 'react';
import { View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { AdminMenuButton } from '../components/AdminMenuButton';
import { colors } from '@/core/theme/colors';

interface MediaTileProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  accentColor?: string;
}

function MediaTile({ icon, title, subtitle, onPress, accentColor = colors.neonPurple }: MediaTileProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? `${accentColor}22` : colors.cardDark,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: `${accentColor}40`,
        padding: 24,
        alignItems: 'center',
        gap: 14,
        minHeight: 160,
        justifyContent: 'center',
      })}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: `${accentColor}20`,
          borderWidth: 1.5,
          borderColor: `${accentColor}50`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <MaterialCommunityIcons name={icon} size={32} color={accentColor} />
      </View>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.white, textAlign: 'center' }}>
          {title}
        </AppText>
        <AppText style={{ fontSize: 12, color: colors.textSlate400, textAlign: 'center', lineHeight: 18 }}>
          {subtitle}
        </AppText>
      </View>
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: 6,
          borderRadius: 20,
          backgroundColor: `${accentColor}18`,
        }}
      >
        <AppText style={{ fontSize: 12, fontWeight: '600', color: accentColor }}>
          Manage →
        </AppText>
      </View>
    </Pressable>
  );
}

export function AdminMediaControlScreen() {
  const { t } = useTranslation();

  return (
    <ScreenLayout>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 8,
            paddingBottom: 24,
            gap: 12,
          }}
        >
          <AdminMenuButton />
          <AppText style={{ fontSize: 22, fontWeight: '700', color: colors.white, flex: 1 }}>
            {t('admin.media.title')}
          </AppText>
        </View>

        {/* Subtitle */}
        <AppText style={{ fontSize: 14, color: colors.textSlate400, marginBottom: 28, lineHeight: 20 }}>
          {t('admin.media.subtitle')}
        </AppText>

        {/* Two main tiles */}
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <MediaTile
            icon="image-multiple-outline"
            title={t('admin.media.businessTitle')}
            subtitle={t('admin.media.businessSubtitle')}
            accentColor={colors.neonPurple}
            onPress={() => router.navigate('/(main)/(settings)/category-defaults')}
          />
          <MediaTile
            icon="view-carousel-outline"
            title={t('admin.media.sliderTitle')}
            subtitle={t('admin.media.sliderSubtitle')}
            accentColor="#06B6D4"
            onPress={() => router.navigate('/(main)/(settings)/manage-banners')}
          />
        </View>
      </View>
    </ScreenLayout>
  );
}
