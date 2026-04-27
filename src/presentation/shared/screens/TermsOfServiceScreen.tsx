import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/core/theme/useTheme';
import { colors } from '@/core/theme/colors';
import { AppText } from '@/presentation/shared/components/ui/AppText';

interface SectionProps {
  number: number;
  titleKey: string;
  contentKey: string;
  theme: ReturnType<typeof useTheme>;
}

const Section: React.FC<SectionProps> = ({ number, titleKey, contentKey, theme }) => {
  const { t } = useTranslation();
  return (
    <View style={{ marginBottom: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.neonPurple,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <AppText style={{ color: colors.white, fontSize: 14, fontWeight: '700' }}>
            {number}
          </AppText>
        </View>
        <AppText style={{ fontSize: 16, fontWeight: '700', flex: 1 }}>
          {t(titleKey)}
        </AppText>
      </View>
      <AppText style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22, paddingLeft: 38 }}>
        {t(contentKey)}
      </AppText>
    </View>
  );
};

export default function TermsOfServiceScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  const sections = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingTop: 48,
          paddingBottom: 12,
          backgroundColor: theme.card,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{ padding: 4, marginRight: 12 }}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 18, fontWeight: '700' }}>{t('tos.title')}</AppText>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 12,
            padding: 20,
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          {sections.map((n) => (
            <Section
              key={n}
              number={n}
              titleKey={`tos.section${n}Title`}
              contentKey={`tos.section${n}Content`}
              theme={theme}
            />
          ))}
        </View>

        <AppText
          style={{
            fontSize: 12,
            color: theme.textMuted,
            textAlign: 'center',
            marginTop: 20,
          }}
        >
          {t('tos.lastUpdated', { date: '2026-04-01' })}
        </AppText>
      </ScrollView>
    </View>
  );
}
