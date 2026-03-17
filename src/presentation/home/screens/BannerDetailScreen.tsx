import React from 'react';
import { View, Image, ScrollView, Pressable, Dimensions, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { colors } from '@/core/theme/colors';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const HERO_HEIGHT = Math.min(Math.round(WINDOW_HEIGHT * 0.4), 320);

interface BannerDetailScreenProps {
  title: string;
  description: string;
  content: string;
  imageUrl: string;
}

export function BannerDetailScreen({ title, description, content, imageUrl }: BannerDetailScreenProps) {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      <StatusBar barStyle="light-content" />
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
            colors={['transparent', colors.midnight]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80 }}
          />
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={{
              position: 'absolute',
              top: Platform.OS === 'ios' ? 52 : 16,
              left: 16,
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
          </Pressable>
        </View>

        {/* Text content */}
        <View style={{ padding: 20, paddingTop: 16 }}>
          <AppText
            style={{
              fontSize: 24,
              fontWeight: '700',
              color: colors.white,
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
                color: colors.textSlate400,
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
                color: colors.white,
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
