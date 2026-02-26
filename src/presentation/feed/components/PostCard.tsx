import React from 'react';
import { View, Pressable, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { Card } from '@/presentation/shared/components/ui/Card';
import { colors } from '@/core/theme/colors';
import { PostEntity } from '@/domain/feed/entities/postEntity';

interface PostCardProps {
  post: PostEntity;
  onLike: (postId: string) => void;
}

const formatTimeAgo = (date: Date): string => {
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
};

export const PostCard = React.memo(({ post, onLike }: PostCardProps) => {
  const initials = post.authorName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card style={{ padding: 16, marginBottom: 12 }}>
      {/* Author Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        {/* Avatar */}
        {post.authorAvatarUrl ? (
          <Image
            source={{ uri: post.authorAvatarUrl }}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              marginRight: 10,
              backgroundColor: colors.cardDark,
            }}
            accessibilityLabel={`${post.authorName} avatar`}
          />
        ) : (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${colors.neonPurple}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 10,
            }}
          >
            <AppText
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: colors.neonPurple,
              }}
            >
              {initials}
            </AppText>
          </View>
        )}

        {/* Name + Timestamp */}
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText
            style={{ fontSize: 14, fontWeight: '700', color: colors.textWhite }}
            numberOfLines={1}
          >
            {post.authorName}
          </AppText>
          <AppText style={{ fontSize: 12, color: colors.textSlate400, marginTop: 2 }}>
            {formatTimeAgo(post.createdAt)}
          </AppText>
        </View>
      </View>

      {/* Content */}
      <AppText
        style={{
          fontSize: 14,
          color: colors.textSlate200,
          lineHeight: 20,
          marginBottom: post.imageUrl ? 12 : 0,
        }}
      >
        {post.content}
      </AppText>

      {/* Image placeholder */}
      {post.imageUrl && (
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: '100%',
            height: 200,
            borderRadius: 12,
            backgroundColor: colors.cardDark,
            marginBottom: 12,
          }}
          resizeMode="cover"
          accessibilityLabel="Post image"
        />
      )}

      {/* Actions Row */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.borderDark,
          gap: 20,
        }}
      >
        {/* Like Button */}
        <Pressable
          onPress={() => onLike(post.id)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
          accessibilityLabel={post.isLiked ? 'Unlike post' : 'Like post'}
          accessibilityRole="button"
          hitSlop={8}
        >
          <MaterialCommunityIcons
            name={post.isLiked ? 'heart' : 'heart-outline'}
            size={20}
            color={post.isLiked ? colors.red : colors.textSlate400}
          />
          <AppText
            style={{
              fontSize: 13,
              color: post.isLiked ? colors.red : colors.textSlate400,
              fontWeight: '600',
            }}
          >
            {post.likesCount}
          </AppText>
        </Pressable>

        {/* Comment Count */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={20}
            color={colors.textSlate400}
          />
          <AppText style={{ fontSize: 13, color: colors.textSlate400, fontWeight: '600' }}>
            {post.commentsCount}
          </AppText>
        </View>
      </View>
    </Card>
  );
});

PostCard.displayName = 'PostCard';
