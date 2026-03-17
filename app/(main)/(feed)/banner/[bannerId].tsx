import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useHomeStore } from '@/presentation/home/store/homeStore';
import { BannerDetailScreen } from '@/presentation/home/screens/BannerDetailScreen';
import { colors } from '@/core/theme/colors';

export default function BannerDetailRoute() {
  const { bannerId } = useLocalSearchParams<{ bannerId: string }>();
  const banner = useHomeStore((s) => s.banners.find((b) => b.id === bannerId));

  if (!banner) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.midnight, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={colors.neonPurple} />
      </View>
    );
  }

  return (
    <BannerDetailScreen
      title={banner.title}
      description={banner.description}
      content={banner.content}
      imageUrl={banner.imageUrl}
    />
  );
}
