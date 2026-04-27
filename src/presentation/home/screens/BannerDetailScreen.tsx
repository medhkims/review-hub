import React from 'react';
import { View, Image, ScrollView, Pressable, StatusBar, Platform, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';

interface BannerDetailScreenProps {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
}

export function BannerDetailScreen({ title, description, content, imageUrl }: BannerDetailScreenProps) {
  const router = useRouter();
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const HERO_HEIGHT = Math.min(Math.round(windowHeight * 0.4), 320);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {Platform.OS !== 'web' && <StatusBar barStyle="light-content" />}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <View style={{ width: '100%', height: HERO_HEIGHT }}>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            accessibilityLabel={title}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90 }}
          />
          <LinearGradient
            colors={['transparent', theme.background]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }}
          />
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 52 : 16,
              left: 16,
              minWidth: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: Platform.OS === 'web' ? 12 : 0,
            }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
            {Platform.OS === 'web' && <AppText style={{ color: '#fff', fontSize: 14, fontWeight: '600', marginLeft: 4 }}>Back</AppText>}
          </Pressable>
        </View>

        {/* Text content */}
        <View style={{ padding: 20, paddingTop: 16 }}>
          <AppText
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: theme.text,
              letterSpacing: -0.3,
              marginBottom: 8,
            }}
          >
            {title}
          </AppText>
          {description.trim().length > 0 && (
            <AppText
              style={{
                fontSize: 14,
                color: theme.textSecondary,
                lineHeight: 20,
                marginBottom: content.trim().length > 0 ? 20 : 0,
              }}
            >
              {description}
            </AppText>
          )}
          {content.trim().length > 0 && (
            <AppText
              style={{
                fontSize: 15,
                color: theme.text,
                lineHeight: 24,
              }}
            >
              {content}
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
