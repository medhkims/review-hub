import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

export default function BusinessPendingScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { businessName, categoryName, location } = useLocalSearchParams<{
    businessName?: string;
    categoryName?: string;
    location?: string;
  }>();

  const handleGoHome = useCallback(() => {
    router.replace('/(main)/(feed)');
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>

      {/* ── Blurred background: dim company profile ── */}
      <View style={[StyleSheet.absoluteFillObject, { opacity: 0.13 }]}>
        {/* Cover area */}
        <View style={{
          height: 230,
          backgroundColor: colors.cardDark,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <MaterialCommunityIcons name="image-outline" size={64} color={colors.textSlate500} />
        </View>

        {/* Profile row */}
        <View style={{ paddingHorizontal: 24, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <View style={{
              width: 72, height: 72, borderRadius: 16,
              backgroundColor: colors.cardDark,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <MaterialCommunityIcons name="store" size={36} color={colors.textSlate500} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 22, fontWeight: '800', color: colors.white, marginBottom: 4 }}>
                {businessName ?? ''}
              </AppText>
              <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
                {categoryName ?? ''}
              </AppText>
            </View>
          </View>

          {!!location && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="map-marker-outline" size={16} color={colors.textSlate500} />
              <AppText style={{ fontSize: 14, color: colors.textSlate400 }}>
                {location}
              </AppText>
            </View>
          )}

          {/* Fake content lines */}
          <View style={{ marginTop: 24, gap: 10 }}>
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.cardDark, width: '90%' }} />
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.cardDark, width: '75%' }} />
            <View style={{ height: 12, borderRadius: 6, backgroundColor: colors.cardDark, width: '60%' }} />
          </View>
        </View>
      </View>

      {/* ── Dark overlay ── */}
      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(9,15,31,0.82)' }]} />

      {/* ── Foreground content ── */}
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingBottom: insets.bottom + 20,
        paddingTop: insets.top,
      }}>

        {/* Success icon */}
        <View style={{
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: 'rgba(168,85,247,0.15)',
          borderWidth: 1.5,
          borderColor: 'rgba(168,85,247,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 28,
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
        }}>
          <MaterialCommunityIcons name="check-circle-outline" size={44} color={colors.neonPurple} />
        </View>

        {/* Message card */}
        <View style={{
          backgroundColor: 'rgba(30,41,59,0.97)',
          borderWidth: 1,
          borderColor: 'rgba(168,85,247,0.3)',
          borderRadius: 24,
          paddingVertical: 28,
          paddingHorizontal: 24,
          width: '100%',
          alignItems: 'center',
          shadowColor: colors.neonPurple,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 24,
          elevation: 10,
        }}>
          {/* Clock badge */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: 'rgba(168,85,247,0.12)',
            borderRadius: 20,
            paddingHorizontal: 12,
            paddingVertical: 5,
            marginBottom: 18,
          }}>
            <MaterialCommunityIcons name="clock-outline" size={14} color={colors.neonPurple} />
            <AppText style={{ fontSize: 12, fontWeight: '600', color: colors.neonPurple }}>
              {t('home.addBusiness.pendingTitle')}
            </AppText>
          </View>

          {/* Thank you line */}
          <AppText style={{
            fontSize: 20,
            fontWeight: '800',
            color: colors.white,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            {t('home.addBusiness.pendingThankYou', { name: businessName ?? '' })}
          </AppText>

          {/* Detail message */}
          <AppText style={{
            fontSize: 14,
            color: colors.textSlate400,
            textAlign: 'center',
            lineHeight: 22,
          }}>
            {t('home.addBusiness.pendingMessage')}
          </AppText>
        </View>

        {/* Go back button */}
        <Pressable
          onPress={handleGoHome}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            backgroundColor: colors.neonPurple,
            borderRadius: 16,
            paddingVertical: 16,
            paddingHorizontal: 40,
            marginTop: 24,
            width: '100%',
            opacity: pressed ? 0.85 : 1,
            shadowColor: colors.neonPurple,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.45,
            shadowRadius: 14,
            elevation: 8,
          })}
          accessibilityLabel={t('home.addBusiness.pendingGoHome')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="home-outline" size={20} color={colors.white} />
          <AppText style={{ color: colors.white, fontSize: 16, fontWeight: '700' }}>
            {t('home.addBusiness.pendingGoHome')}
          </AppText>
        </Pressable>
      </View>
    </View>
  );
}
