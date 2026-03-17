import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, FlatList, Pressable, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { colors } from '@/core/theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDE_HEIGHT = Platform.OS === 'web' || SCREEN_WIDTH >= 600 ? 320 : 190;
const AUTO_ADVANCE_MS = 4000;

interface BannerSliderProps {
  banners: BannerEntity[];
  isLoading: boolean;
  onPress: (banner: BannerEntity) => void;
}

interface BannerSlideProps {
  banner: BannerEntity;
  slideWidth: number;
  onPress: (banner: BannerEntity) => void;
}

const BannerSlide = React.memo<BannerSlideProps>(({ banner, slideWidth, onPress }) => (
  <Pressable
    style={{ width: slideWidth }}
    onPress={() => onPress(banner)}
    accessibilityLabel={banner.title}
    accessibilityRole="button"
  >
    <View
      style={{
        width: slideWidth,
        height: SLIDE_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.cardDark,
      }}
    >
      <Image
        source={{ uri: banner.imageUrl }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 16,
          paddingBottom: 16,
          paddingTop: 32,
        }}
      >
        <AppText
          style={{ color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 }}
          numberOfLines={1}
        >
          {banner.title}
        </AppText>
        {banner.description.trim().length > 0 && (
          <AppText
            style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}
            numberOfLines={2}
          >
            {banner.description}
          </AppText>
        )}
      </LinearGradient>
    </View>
  </Pressable>
));

export const BannerSlider = React.memo<BannerSliderProps>(({ banners, isLoading, onPress }) => {
  const flatListRef = useRef<FlatList<BannerEntity>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => {
      const next = (activeIndexRef.current + 1) % banners.length;
      activeIndexRef.current = next;
      setActiveIndex(next);
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }, AUTO_ADVANCE_MS);
  }, [banners.length, stopTimer]);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { index: number | null }[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        activeIndexRef.current = viewableItems[0].index;
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const keyExtractor = useCallback((item: BannerEntity) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: BannerEntity }) => (
      <BannerSlide banner={item} slideWidth={containerWidth} onPress={onPress} />
    ),
    [onPress, containerWidth],
  );

  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: containerWidth,
      offset: containerWidth * index,
      index,
    }),
    [containerWidth],
  );

  if (isLoading) return null;

  if (banners.length === 0) {
    return (
      <View
        style={{ marginBottom: 24 }}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        <LinearGradient
          colors={['#1E1B4B', '#4C1D95', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: '100%',
            height: SLIDE_HEIGHT,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <AppText style={{ fontSize: 28 }}>🎉</AppText>
          <AppText style={{ color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: -0.3 }}>
            Coming Soon
          </AppText>
          <AppText
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 13,
              textAlign: 'center',
              paddingHorizontal: 24,
            }}
          >
            Promotions and announcements will appear here
          </AppText>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={{ marginBottom: 24 }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w !== containerWidth) setContainerWidth(w);
      }}
    >
      {containerWidth > 0 && (
        <>
          <FlatList
            ref={flatListRef}
            data={banners}
            horizontal
            pagingEnabled
            snapToInterval={containerWidth}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig.current}
            onScrollBeginDrag={stopTimer}
            onScrollEndDrag={startTimer}
            onMomentumScrollEnd={startTimer}
          />
          {banners.length > 1 && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: 10,
                gap: 6,
              }}
            >
              {banners.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === activeIndex ? 18 : 6,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor:
                      i === activeIndex ? colors.neonPurple : colors.textSlate500,
                  }}
                />
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
});
