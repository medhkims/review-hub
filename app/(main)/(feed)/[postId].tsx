import React, { useMemo, useCallback } from 'react';
import { View, ScrollView, Pressable, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { ScreenLayout } from '@/presentation/shared/layouts/ScreenLayout';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { useFeedStore } from '@/presentation/feed/store/feedStore';
import { useFeed } from '@/presentation/feed/hooks/useFeed';

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { toggleLike } = useFeed();

  const post = useFeedStore(useCallback(
    (s) => s.posts.find((p) => p.id === postId) ?? null,
    [postId],
  ));

  const initials = useMemo(() => {
    if (!post) return '';
    return post.authorName
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [post?.authorName]);

  if (!post) {
    return (
      <ScreenLayout>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back"
            style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={theme.text} />
          </Pressable>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{t('feed.postDetail', { defaultValue: 'Post' })}</AppText>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <MaterialCommunityIcons name="post-outline" size={48} color={theme.textMuted} />
          <AppText style={{ fontSize: 15, color: theme.textMuted }}>{t('feed.postNotFound', { defaultValue: 'Post not found' })}</AppText>
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back"
          style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: theme.card, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialCommunityIcons name="arrow-left" size={18} color={theme.text} />
        </Pressable>
        <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{t('feed.postDetail', { defaultValue: 'Post' })}</AppText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {/* Author Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
          {post.authorAvatarUrl ? (
            <Image
              source={{ uri: post.authorAvatarUrl }}
              style={{ width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: theme.card }}
              accessibilityLabel={`${post.authorName} avatar`}
            />
          ) : (
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: `${colors.neonPurple}20`, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <AppText style={{ fontSize: 16, fontWeight: '700', color: colors.neonPurple }}>{initials}</AppText>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <AppText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>{post.authorName}</AppText>
            <AppText style={{ fontSize: 13, color: theme.textSecondary, marginTop: 2 }}>{formatTimeAgo(post.createdAt)}</AppText>
          </View>
        </View>

        {/* Content */}
        <AppText style={{ fontSize: 16, color: theme.text, lineHeight: 24, marginBottom: 16 }}>
          {post.content}
        </AppText>

        {/* Image */}
        {post.imageUrl && (
          <Image
            source={{ uri: post.imageUrl }}
            style={{ width: '100%', height: 280, borderRadius: 14, backgroundColor: theme.card, marginBottom: 16 }}
            resizeMode="cover"
            accessibilityLabel="Post image"
          />
        )}

        {/* Actions */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 20,
          paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1,
          borderColor: theme.border, marginBottom: 24,
        }}>
          <Pressable
            onPress={() => toggleLike(post.id)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={22}
              color={post.isLiked ? colors.red : theme.textSecondary}
            />
            <AppText style={{ fontSize: 14, color: post.isLiked ? colors.red : theme.textSecondary, fontWeight: '600' }}>
              {post.likesCount} {t('feed.likes', { defaultValue: 'Likes' })}
            </AppText>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <MaterialCommunityIcons name="comment-outline" size={22} color={theme.textSecondary} />
            <AppText style={{ fontSize: 14, color: theme.textSecondary, fontWeight: '600' }}>
              {post.commentsCount} {t('feed.comments', { defaultValue: 'Comments' })}
            </AppText>
          </View>
        </View>

        {/* Comments placeholder */}
        <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
          <MaterialCommunityIcons name="comment-text-outline" size={36} color={theme.textMuted} />
          <AppText style={{ fontSize: 14, color: theme.textMuted }}>
            {t('feed.noComments', { defaultValue: 'No comments yet' })}
          </AppText>
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}
