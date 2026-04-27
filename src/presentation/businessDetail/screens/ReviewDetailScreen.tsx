import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { AppText } from '@/presentation/shared/components/ui/AppText';
import { LoadingIndicator } from '@/presentation/shared/components/ui/LoadingIndicator';
import { colors } from '@/core/theme/colors';
import { useTheme } from '@/core/theme/useTheme';
import { container } from '@/core/di/container';
import { CommentEntity, ReplyEntity } from '@/domain/business/entities/commentEntity';
import { StarRating } from '../components/BusinessCoverSection';
import { useAuthStore } from '@/presentation/auth/store/authStore';
import { ReportReviewModal } from '@/presentation/dispute/components/ReportReviewModal';

export interface SerializedReview {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  text: string;
  photoUrls?: string[];
  createdAtMs: number;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  dislikeCount: number;
  isDislikedByCurrentUser: boolean;
  businessId?: string;
  businessLogoUrl?: string | null;
}

interface ReviewDetailScreenProps {
  reviewId: string;
  businessName: string;
  businessId?: string;
  initialReview: SerializedReview | null;
  backHref?: string;
}

interface LikeState {
  liked: boolean;
  count: number;
}

interface DislikeState {
  disliked: boolean;
  count: number;
}

const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const Avatar = ({ name, avatarUrl, size = 36 }: { name: string; avatarUrl: string | null; size?: number }) => {
  const theme = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} resizeMode="cover" accessibilityLabel={name} />
      ) : (
        <View style={{ flex: 1, backgroundColor: theme.card, alignItems: 'center', justifyContent: 'center' }}>
          <AppText style={{ fontSize: size * 0.4, fontWeight: '700', color: colors.neonPurple }}>
            {name.charAt(0).toUpperCase()}
          </AppText>
        </View>
      )}
    </View>
  );
};

interface ReplyItemProps {
  reply: ReplyEntity;
  parentAuthorName: string;
  likeState: LikeState;
  dislikeState: DislikeState;
  onLike: (replyId: string, isLiked: boolean) => void;
  onDislike: (replyId: string, isDisliked: boolean) => void;
  onReplyToReply: (reply: ReplyEntity, commentId: string) => void;
  commentId: string;
  currentUserId: string | undefined;
}

const ReplyItem = React.memo<ReplyItemProps>(
  ({ reply, parentAuthorName, likeState, dislikeState, onLike, onDislike, onReplyToReply, commentId, currentUserId }) => {
    const { t } = useTranslation();
    const theme = useTheme();
    const replyingTo = reply.replyingToName ?? parentAuthorName;

    return (
      <View style={{ flexDirection: 'row', marginTop: 6 }}>
        <View style={{ width: 36, alignItems: 'center' }}>
          <View style={{ width: 2, flex: 1, backgroundColor: 'rgba(139, 92, 246, 0.25)', borderRadius: 1 }} />
        </View>
        <View style={{ flex: 1, flexDirection: 'row', gap: 8, paddingBottom: 2 }}>
          <Avatar name={reply.authorName} avatarUrl={reply.authorAvatarUrl} size={26} />
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(139, 92, 246, 0.07)',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.15)',
              padding: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <MaterialCommunityIcons name="reply" size={11} color={colors.neonPurple} />
              <AppText style={{ fontSize: 10, color: colors.neonPurple }}>replying to {replyingTo}</AppText>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
              <AppText style={{ fontSize: 12, fontWeight: '700', color: theme.text }}>{reply.authorName}</AppText>
              <AppText style={{ fontSize: 10, color: theme.textMuted }}>{formatTimeAgo(reply.createdAt)}</AppText>
            </View>
            <AppText style={{ fontSize: 12, color: theme.textSecondary, lineHeight: 18 }}>{reply.text}</AppText>

            {/* Like + Dislike + Reply row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={() => onLike(reply.id, likeState.liked)}
                accessibilityLabel={likeState.liked ? t('review.unlikeReply') : t('review.likeReply')}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <MaterialCommunityIcons
                  name={likeState.liked ? 'thumb-up' : 'thumb-up-outline'}
                  size={13}
                  color={likeState.liked ? '#3b82f6' : theme.textMuted}
                />
                {likeState.count > 0 && (
                  <AppText style={{ fontSize: 11, color: likeState.liked ? '#3b82f6' : theme.textMuted }}>
                    {likeState.count}
                  </AppText>
                )}
              </Pressable>
              <Pressable
                onPress={() => onDislike(reply.id, dislikeState.disliked)}
                accessibilityLabel={dislikeState.disliked ? t('review.undislikeReply') : t('review.dislikeReply')}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <MaterialCommunityIcons
                  name={dislikeState.disliked ? 'thumb-down' : 'thumb-down-outline'}
                  size={13}
                  color={dislikeState.disliked ? '#ef4444' : theme.textMuted}
                />
                {dislikeState.count > 0 && (
                  <AppText style={{ fontSize: 11, color: dislikeState.disliked ? '#ef4444' : theme.textMuted }}>
                    {dislikeState.count}
                  </AppText>
                )}
              </Pressable>
              {reply.authorId !== currentUserId && (
                <Pressable
                  onPress={() => onReplyToReply(reply, commentId)}
                  accessibilityLabel={t('review.replyToReply')}
                  accessibilityRole="button"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <MaterialCommunityIcons name="reply" size={13} color={theme.textMuted} />
                  <AppText style={{ fontSize: 11, color: theme.textMuted }}>{t('review.replyToReply')}</AppText>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </View>
    );
});

interface CommentItemProps {
  comment: CommentEntity;
  onReply: (comment: CommentEntity) => void;
  commentLikeState: LikeState;
  commentDislikeState: DislikeState;
  replyLikeStates: Record<string, LikeState>;
  replyDislikeStates: Record<string, DislikeState>;
  onLikeComment: (commentId: string, isLiked: boolean) => void;
  onDislikeComment: (commentId: string, isDisliked: boolean) => void;
  onLikeReply: (replyId: string, isLiked: boolean) => void;
  onDislikeReply: (replyId: string, isDisliked: boolean) => void;
  onReplyToReply: (reply: ReplyEntity, commentId: string) => void;
  forceExpanded?: boolean;
  currentUserId: string | undefined;
}

const CommentItem = React.memo<CommentItemProps>(({
  comment,
  onReply,
  commentLikeState,
  commentDislikeState,
  replyLikeStates,
  replyDislikeStates,
  onLikeComment,
  onDislikeComment,
  onLikeReply,
  onDislikeReply,
  onReplyToReply,
  forceExpanded = false,
  currentUserId,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [repliesExpanded, setRepliesExpanded] = useState(false);
  const isExpanded = forceExpanded || repliesExpanded;
  const replyCount = comment.replyCount;

  return (
    <View style={{ marginBottom: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6, paddingLeft: 2 }}>
        <MaterialCommunityIcons name="comment-text-outline" size={11} color={theme.textMuted} />
        <AppText style={{ fontSize: 10, color: theme.textMuted, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          Comment
        </AppText>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Avatar name={comment.authorName} avatarUrl={comment.authorAvatarUrl} size={38} />
        <View
          style={{
            flex: 1,
            backgroundColor: theme.card,
            borderRadius: 14,
            padding: 13,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.08)',
            borderLeftWidth: 3,
            borderLeftColor: colors.neonPurple,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <AppText style={{ fontSize: 13, fontWeight: '700', color: theme.text }}>{comment.authorName}</AppText>
            <AppText style={{ fontSize: 10, color: theme.textMuted }}>{formatTimeAgo(comment.createdAt)}</AppText>
          </View>
          <AppText style={{ fontSize: 13, color: theme.textSecondary, lineHeight: 20 }}>{comment.text}</AppText>

          {/* Like + Dislike + Reply row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <Pressable
              onPress={() => onLikeComment(comment.id, commentLikeState.liked)}
              accessibilityLabel={commentLikeState.liked ? t('review.unlikeComment') : t('review.likeComment')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <MaterialCommunityIcons
                name={commentLikeState.liked ? 'thumb-up' : 'thumb-up-outline'}
                size={14}
                color={commentLikeState.liked ? '#3b82f6' : theme.textMuted}
              />
              {commentLikeState.count > 0 && (
                <AppText style={{ fontSize: 12, color: commentLikeState.liked ? '#3b82f6' : theme.textMuted }}>
                  {commentLikeState.count}
                </AppText>
              )}
            </Pressable>
            <Pressable
              onPress={() => onDislikeComment(comment.id, commentDislikeState.disliked)}
              accessibilityLabel={commentDislikeState.disliked ? t('review.undislikeComment') : t('review.dislikeComment')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <MaterialCommunityIcons
                name={commentDislikeState.disliked ? 'thumb-down' : 'thumb-down-outline'}
                size={14}
                color={commentDislikeState.disliked ? '#ef4444' : theme.textMuted}
              />
              {commentDislikeState.count > 0 && (
                <AppText style={{ fontSize: 12, color: commentDislikeState.disliked ? '#ef4444' : theme.textMuted }}>
                  {commentDislikeState.count}
                </AppText>
              )}
            </Pressable>
            {comment.authorId !== currentUserId && (
              <Pressable
                onPress={() => onReply(comment)}
                accessibilityLabel="Reply to comment"
                accessibilityRole="button"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 5,
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 20,
                }}
              >
                <MaterialCommunityIcons name="reply" size={13} color={colors.neonPurple} />
                <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '600' }}>Reply</AppText>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* See all answers button */}
      {replyCount > 0 && !isExpanded && (
        <Pressable
          onPress={() => setRepliesExpanded(true)}
          accessibilityLabel={`See all ${replyCount} answers`}
          accessibilityRole="button"
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            marginLeft: 48,
          }}
        >
          <View style={{ width: 20, height: 1, backgroundColor: 'rgba(139, 92, 246, 0.4)' }} />
          <MaterialCommunityIcons name="comment-multiple-outline" size={13} color={colors.neonPurple} />
          <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '600' }}>
            {t('review.seeAllAnswers', { count: replyCount })}
          </AppText>
        </Pressable>
      )}

      {/* Replies (expanded) */}
      {isExpanded && comment.replies.length > 0 && (
        <View style={{ marginTop: 4, paddingLeft: 10 }}>
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply.id}
              reply={reply}
              parentAuthorName={comment.authorName}
              likeState={replyLikeStates[reply.id] ?? { liked: reply.isLikedByCurrentUser, count: reply.likeCount }}
              dislikeState={replyDislikeStates[reply.id] ?? { disliked: reply.isDislikedByCurrentUser, count: reply.dislikeCount }}
              onLike={onLikeReply}
              onDislike={onDislikeReply}
              onReplyToReply={onReplyToReply}
              commentId={comment.id}
              currentUserId={currentUserId}
            />
          ))}
          {/* Collapse button */}
          <Pressable
            onPress={() => setRepliesExpanded(false)}
            accessibilityLabel="Hide answers"
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              marginLeft: 36,
            }}
          >
            <View style={{ width: 20, height: 1, backgroundColor: 'rgba(139, 92, 246, 0.4)' }} />
            <MaterialCommunityIcons name="chevron-up" size={13} color={colors.neonPurple} />
            <AppText style={{ fontSize: 12, color: colors.neonPurple, fontWeight: '600' }}>{t('review.hideAnswers')}</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
});

interface ReplyTarget {
  commentId: string;
  authorName: string;
  authorId: string;
}

export default function ReviewDetailScreen({ reviewId, businessName, businessId: businessIdProp, initialReview, backHref }: ReviewDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user: authUser } = useAuthStore();
  const [comments, setComments] = useState<CommentEntity[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(initialReview?.isLikedByCurrentUser ?? false);
  const [likeCount, setLikeCount] = useState(initialReview?.likeCount ?? 0);
  const [isDisliked, setIsDisliked] = useState(initialReview?.isDislikedByCurrentUser ?? false);
  const [dislikeCount, setDislikeCount] = useState(initialReview?.dislikeCount ?? 0);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const isOwnReview = !!initialReview?.authorId && authUser?.id === initialReview.authorId;
  const canComment = !isOwnReview || replyTarget !== null;
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const [photoUrls, setPhotoUrls] = useState<string[]>(initialReview?.photoUrls ?? []);
  const [businessLogoUrl, setBusinessLogoUrl] = useState<string | null>(initialReview?.businessLogoUrl ?? null);
  const resolvedBusinessId = businessIdProp || initialReview?.businessId || '';

  const [commentLikes, setCommentLikes] = useState<Record<string, LikeState>>({});
  const [replyLikes, setReplyLikes] = useState<Record<string, LikeState>>({});
  const [commentDislikes, setCommentDislikes] = useState<Record<string, DislikeState>>({});
  const [replyDislikes, setReplyDislikes] = useState<Record<string, DislikeState>>({});
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());

  const reviewDate = initialReview ? new Date(initialReview.createdAtMs) : null;

  const loadComments = useCallback(async () => {
    setIsCommentsLoading(true);
    const result = await container.getReviewCommentsUseCase.execute(reviewId);
    result.fold(
      () => {},
      (data) => {
        setComments(data);
        const cLikes: Record<string, LikeState> = {};
        const rLikes: Record<string, LikeState> = {};
        const cDislikes: Record<string, DislikeState> = {};
        const rDislikes: Record<string, DislikeState> = {};
        data.forEach((c) => {
          cLikes[c.id] = { liked: c.isLikedByCurrentUser, count: c.likeCount };
          cDislikes[c.id] = { disliked: c.isDislikedByCurrentUser, count: c.dislikeCount };
          c.replies.forEach((r) => {
            rLikes[r.id] = { liked: r.isLikedByCurrentUser, count: r.likeCount };
            rDislikes[r.id] = { disliked: r.isDislikedByCurrentUser, count: r.dislikeCount };
          });
        });
        setCommentLikes(cLikes);
        setReplyLikes(rLikes);
        setCommentDislikes(cDislikes);
        setReplyDislikes(rDislikes);
      },
    );
    setIsCommentsLoading(false);
  }, [reviewId]);

  useFocusEffect(useCallback(() => {
    setSendError(null);
  }, []));

  useEffect(() => {
    loadComments();
    const currentUid = authUser?.id;
    if (currentUid && initialReview?.authorId && currentUid !== initialReview.authorId) {
      container.incrementReviewViewUseCase.execute(reviewId).catch(() => {});
    }
    container.getReviewPhotoUrlsUseCase.execute(reviewId).then((result) => {
      result.fold(
        () => {},
        (urls) => { if (urls.length > 0) setPhotoUrls(urls); },
      );
    });
    if (resolvedBusinessId && !initialReview?.businessLogoUrl) {
      container.getBusinessDetailUseCase.execute(resolvedBusinessId).then((result) => {
        result.fold(
          () => {},
          async (business) => {
            const logo = business.logoUrl ?? business.coverImageUrl;
            if (logo) {
              setBusinessLogoUrl(logo);
            } else if (business.categoryId) {
              const catResult = await container.getCategoriesUseCase.execute();
              catResult.fold(
                () => {},
                (categories) => {
                  const cat = categories.find((c) => c.id === business.categoryId);
                  if (cat?.logoUrl) setBusinessLogoUrl(cat.logoUrl);
                },
              );
            }
          },
        );
      });
    }
  }, [loadComments, reviewId, initialReview?.authorId, resolvedBusinessId, initialReview?.businessLogoUrl]);

  const handleLike = useCallback(async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await container.unlikeReviewUseCase.execute(reviewId);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      if (isDisliked) {
        setIsDisliked(false);
        setDislikeCount((c) => Math.max(0, c - 1));
        await container.undislikeReviewUseCase.execute(reviewId);
      }
      await container.likeReviewUseCase.execute(reviewId, {
        reviewAuthorId: initialReview?.authorId ?? '',
        actorId: authUser?.id ?? '',
        actorName: authUser?.displayName ?? 'Someone',
        businessName,
      });
    }
  }, [isLiked, isDisliked, reviewId, initialReview?.authorId, businessName]);

  const handleDislike = useCallback(async () => {
    if (isDisliked) {
      setIsDisliked(false);
      setDislikeCount((c) => Math.max(0, c - 1));
      await container.undislikeReviewUseCase.execute(reviewId);
    } else {
      setIsDisliked(true);
      setDislikeCount((c) => c + 1);
      if (isLiked) {
        setIsLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
        await container.unlikeReviewUseCase.execute(reviewId);
      }
      await container.dislikeReviewUseCase.execute(reviewId, {
        reviewAuthorId: initialReview?.authorId ?? '',
        actorId: authUser?.id ?? '',
        actorName: authUser?.displayName ?? 'Someone',
        businessName,
      });
    }
  }, [isDisliked, isLiked, reviewId, initialReview?.authorId, businessName]);

  const handleLikeComment = useCallback(async (commentId: string, isCommentLiked: boolean) => {
    setCommentLikes((prev) => ({
      ...prev,
      [commentId]: {
        liked: !isCommentLiked,
        count: Math.max(0, (prev[commentId]?.count ?? 0) + (isCommentLiked ? -1 : 1)),
      },
    }));
    if (isCommentLiked) {
      await container.unlikeCommentUseCase.execute(commentId);
    } else {
      setCommentDislikes((prev) => {
        const cur = prev[commentId];
        if (cur?.disliked) {
          container.undislikeCommentUseCase.execute(commentId).catch(() => {});
          return { ...prev, [commentId]: { disliked: false, count: Math.max(0, cur.count - 1) } };
        }
        return prev;
      });
      const targetAuthorId = comments.find((c) => c.id === commentId)?.authorId ?? '';
      const actorId = authUser?.id ?? '';
      await container.likeCommentUseCase.execute(commentId, {
        commentAuthorId: targetAuthorId,
        actorId,
        actorName: authUser?.displayName ?? 'Someone',
        reviewId,
      });
    }
  }, [comments, reviewId]);

  const handleDislikeComment = useCallback(async (commentId: string, isCommentDisliked: boolean) => {
    setCommentDislikes((prev) => ({
      ...prev,
      [commentId]: {
        disliked: !isCommentDisliked,
        count: Math.max(0, (prev[commentId]?.count ?? 0) + (isCommentDisliked ? -1 : 1)),
      },
    }));
    if (isCommentDisliked) {
      await container.undislikeCommentUseCase.execute(commentId);
    } else {
      setCommentLikes((prev) => {
        const cur = prev[commentId];
        if (cur?.liked) {
          container.unlikeCommentUseCase.execute(commentId).catch(() => {});
          return { ...prev, [commentId]: { liked: false, count: Math.max(0, cur.count - 1) } };
        }
        return prev;
      });
      const targetAuthorId = comments.find((c) => c.id === commentId)?.authorId ?? '';
      const actorId = authUser?.id ?? '';
      await container.dislikeCommentUseCase.execute(commentId, {
        commentAuthorId: targetAuthorId,
        actorId,
        actorName: authUser?.displayName ?? 'Someone',
        reviewId,
      });
    }
  }, [comments, reviewId]);

  const handleLikeReply = useCallback(async (replyId: string, isReplyLiked: boolean) => {
    setReplyLikes((prev) => ({
      ...prev,
      [replyId]: {
        liked: !isReplyLiked,
        count: Math.max(0, (prev[replyId]?.count ?? 0) + (isReplyLiked ? -1 : 1)),
      },
    }));
    if (isReplyLiked) {
      await container.unlikeReplyUseCase.execute(replyId);
    } else {
      setReplyDislikes((prev) => {
        const cur = prev[replyId];
        if (cur?.disliked) {
          container.undislikeReplyUseCase.execute(replyId).catch(() => {});
          return { ...prev, [replyId]: { disliked: false, count: Math.max(0, cur.count - 1) } };
        }
        return prev;
      });
      let targetAuthorId = '';
      for (const c of comments) {
        const r = c.replies.find((rep) => rep.id === replyId);
        if (r) { targetAuthorId = r.authorId; break; }
      }
      const actorId = authUser?.id ?? '';
      await container.likeReplyUseCase.execute(replyId, {
        replyAuthorId: targetAuthorId,
        actorId,
        actorName: authUser?.displayName ?? 'Someone',
        reviewId,
      });
    }
  }, [comments, reviewId]);

  const handleDislikeReply = useCallback(async (replyId: string, isReplyDisliked: boolean) => {
    setReplyDislikes((prev) => ({
      ...prev,
      [replyId]: {
        disliked: !isReplyDisliked,
        count: Math.max(0, (prev[replyId]?.count ?? 0) + (isReplyDisliked ? -1 : 1)),
      },
    }));
    if (isReplyDisliked) {
      await container.undislikeReplyUseCase.execute(replyId);
    } else {
      setReplyLikes((prev) => {
        const cur = prev[replyId];
        if (cur?.liked) {
          container.unlikeReplyUseCase.execute(replyId).catch(() => {});
          return { ...prev, [replyId]: { liked: false, count: Math.max(0, cur.count - 1) } };
        }
        return prev;
      });
      let targetAuthorId = '';
      for (const c of comments) {
        const r = c.replies.find((rep) => rep.id === replyId);
        if (r) { targetAuthorId = r.authorId; break; }
      }
      const actorId = authUser?.id ?? '';
      await container.dislikeReplyUseCase.execute(replyId, {
        replyAuthorId: targetAuthorId,
        actorId,
        actorName: authUser?.displayName ?? 'Someone',
        reviewId,
      });
    }
  }, [comments, reviewId]);

  const handleReply = useCallback((comment: CommentEntity) => {
    setReplyTarget({ commentId: comment.id, authorName: comment.authorName, authorId: comment.authorId });
    inputRef.current?.focus();
  }, []);

  const handleReplyToReply = useCallback((reply: ReplyEntity, commentId: string) => {
    setReplyTarget({ commentId, authorName: reply.authorName, authorId: reply.authorId });
    inputRef.current?.focus();
  }, []);

  const cancelReply = useCallback(() => {
    setReplyTarget(null);
    setCommentText('');
  }, []);

  const handleSend = useCallback(async () => {
    const text = commentText.trim();
    if (!text || isSending) return;
    setIsSending(true);
    setSendError(null);
    setCommentText('');
    inputRef.current?.blur();

    const currentUserId = authUser?.id ?? '';
    const currentUserName = authUser?.displayName ?? 'You';
    const currentUserAvatar = authUser?.avatarUrl ?? null;

    if (replyTarget) {
      const { commentId, authorName: replyingToName } = replyTarget;
      const tempReplyId = `temp_reply_${Date.now()}`;
      const tempReply: ReplyEntity = {
        id: tempReplyId,
        commentId,
        reviewId,
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatarUrl: currentUserAvatar,
        text,
        createdAt: new Date(),
        likeCount: 0,
        isLikedByCurrentUser: false,
        dislikeCount: 0,
        isDislikedByCurrentUser: false,
        replyingToName,
      };
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? { ...c, replies: [...c.replies, tempReply], replyCount: c.replyCount + 1 }
            : c,
        ),
      );
      setReplyLikes((prev) => ({ ...prev, [tempReplyId]: { liked: false, count: 0 } }));
      setReplyDislikes((prev) => ({ ...prev, [tempReplyId]: { disliked: false, count: 0 } }));
      setExpandedCommentIds((prev) => new Set([...prev, commentId]));
      setReplyTarget(null);

      const result = await container.addCommentReplyUseCase.execute(commentId, reviewId, text, replyingToName, {
        commentAuthorId: replyTarget.authorId,
        actorId: currentUserId,
        actorName: currentUserName,
        businessName,
      });
      result.fold(
        (failure) => {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.filter((r) => r.id !== tempReplyId), replyCount: Math.max(0, c.replyCount - 1) }
                : c,
            ),
          );
          setReplyLikes((prev) => { const next = { ...prev }; delete next[tempReplyId]; return next; });
          setReplyDislikes((prev) => { const next = { ...prev }; delete next[tempReplyId]; return next; });
          setCommentText(text);
          setSendError(failure.message);
        },
        (reply) => {
          setComments((prev) =>
            prev.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.map((r) => (r.id === tempReplyId ? reply : r)) }
                : c,
            ),
          );
          setReplyLikes((prev) => {
            const next = { ...prev };
            delete next[tempReplyId];
            next[reply.id] = { liked: false, count: 0 };
            return next;
          });
          setReplyDislikes((prev) => {
            const next = { ...prev };
            delete next[tempReplyId];
            next[reply.id] = { disliked: false, count: 0 };
            return next;
          });
        },
      );
    } else {
      const tempCommentId = `temp_comment_${Date.now()}`;
      const tempComment: CommentEntity = {
        id: tempCommentId,
        reviewId,
        authorId: currentUserId,
        authorName: currentUserName,
        authorAvatarUrl: currentUserAvatar,
        text,
        createdAt: new Date(),
        replyCount: 0,
        replies: [],
        likeCount: 0,
        isLikedByCurrentUser: false,
        dislikeCount: 0,
        isDislikedByCurrentUser: false,
      };
      setComments((prev) => [...prev, tempComment]);
      setCommentLikes((prev) => ({ ...prev, [tempCommentId]: { liked: false, count: 0 } }));
      setCommentDislikes((prev) => ({ ...prev, [tempCommentId]: { disliked: false, count: 0 } }));

      const result = await container.addReviewCommentUseCase.execute(reviewId, text, {
        reviewAuthorId: initialReview?.authorId ?? '',
        actorId: currentUserId,
        actorName: currentUserName,
        businessName,
      });
      result.fold(
        (failure) => {
          setComments((prev) => prev.filter((c) => c.id !== tempCommentId));
          setCommentLikes((prev) => { const next = { ...prev }; delete next[tempCommentId]; return next; });
          setCommentDislikes((prev) => { const next = { ...prev }; delete next[tempCommentId]; return next; });
          setCommentText(text);
          setSendError(failure.message);
        },
        (comment) => {
          setComments((prev) => prev.map((c) => (c.id === tempCommentId ? comment : c)));
          setCommentLikes((prev) => {
            const next = { ...prev };
            delete next[tempCommentId];
            next[comment.id] = { liked: false, count: 0 };
            return next;
          });
          setCommentDislikes((prev) => {
            const next = { ...prev };
            delete next[tempCommentId];
            next[comment.id] = { disliked: false, count: 0 };
            return next;
          });
        },
      );
    }
    setIsSending(false);
  }, [commentText, isSending, replyTarget, reviewId]);

  const ListHeader = (
    <View>
      {initialReview && reviewDate && (
        <View
          style={{
            backgroundColor: theme.card,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
            <Avatar name={initialReview.authorName} avatarUrl={initialReview.authorAvatarUrl} size={44} />
            <View style={{ flex: 1 }}>
              <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text }}>{initialReview.authorName}</AppText>
              <StarRating rating={initialReview.rating} size={13} color={colors.neonPurple} />
              <AppText style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>{formatTimeAgo(reviewDate)}</AppText>
            </View>
          </View>
          {initialReview.text ? (
            <AppText style={{ fontSize: 14, color: theme.textSecondary, lineHeight: 22 }}>{initialReview.text}</AppText>
          ) : null}

          {photoUrls.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginTop: 12 }}
              contentContainerStyle={{ gap: 8 }}
            >
              {photoUrls.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri }}
                  style={{ width: 120, height: 120, borderRadius: 10 }}
                  resizeMode="cover"
                  accessibilityLabel={`Review photo ${index + 1}`}
                />
              ))}
            </ScrollView>
          )}

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
            <Pressable
              onPress={handleLike}
              accessibilityLabel={isLiked ? t('review.unlike') : t('review.like')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <MaterialCommunityIcons
                name={isLiked ? 'thumb-up' : 'thumb-up-outline'}
                size={20}
                color={isLiked ? '#3b82f6' : theme.textMuted}
              />
              <AppText style={{ fontSize: 14, color: isLiked ? '#3b82f6' : theme.textMuted }}>{likeCount}</AppText>
            </Pressable>
            <Pressable
              onPress={handleDislike}
              accessibilityLabel={isDisliked ? t('review.undislike') : t('review.dislike')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <MaterialCommunityIcons
                name={isDisliked ? 'thumb-down' : 'thumb-down-outline'}
                size={20}
                color={isDisliked ? '#ef4444' : theme.textMuted}
              />
              <AppText style={{ fontSize: 14, color: isDisliked ? '#ef4444' : theme.textMuted }}>{dislikeCount}</AppText>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MaterialCommunityIcons name="eye-outline" size={20} color={theme.textMuted} />
              <AppText style={{ fontSize: 14, color: theme.textMuted }}>{initialReview.viewCount}</AppText>
            </View>
            <Pressable
              onPress={() => {
                if (isOwnReview) {
                  setSendError(t('review.cannotCommentOwnReview'));
                } else {
                  inputRef.current?.focus();
                }
              }}
              accessibilityLabel={t('review.writeComment')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <MaterialCommunityIcons name="comment-outline" size={20} color={theme.textMuted} />
              <AppText style={{ fontSize: 14, color: theme.textMuted }}>{comments.length}</AppText>
            </Pressable>
            {!isOwnReview && (
              <Pressable
                onPress={() => setReportModalVisible(true)}
                accessibilityLabel={t('dispute.reportReview')}
                accessibilityRole="button"
                style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 'auto' }}
              >
                <MaterialCommunityIcons name="flag-outline" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      <AppText style={{ fontSize: 15, fontWeight: '700', color: theme.text, marginBottom: 14 }}>
        {t('review.comments')}{comments.length > 0 ? ` (${comments.length})` : ''}
      </AppText>
      {isCommentsLoading && <LoadingIndicator />}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: 56,
          paddingBottom: 16,
          paddingHorizontal: 20,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        }}
      >
        <Pressable
          onPress={() => backHref ? router.replace(backHref as Parameters<typeof router.replace>[0]) : router.back()}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.card,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.border,
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
        {resolvedBusinessId ? (
          <Pressable
            onPress={() => router.push(`/(main)/(feed)/business/${resolvedBusinessId}` as Parameters<typeof router.push>[0])}
            accessibilityLabel={`View ${businessName} profile`}
            accessibilityRole="button"
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
              borderWidth: 2,
              borderColor: 'rgba(139, 92, 246, 0.5)',
              flexShrink: 0,
            }}
          >
            {businessLogoUrl ? (
              <Image
                source={{ uri: businessLogoUrl }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
                accessibilityLabel={`${businessName} logo`}
              />
            ) : (
              <View style={{ flex: 1, backgroundColor: 'rgba(139, 92, 246, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <AppText style={{ fontSize: 18, fontWeight: '700', color: colors.neonPurple }}>
                  {businessName.charAt(0).toUpperCase()}
                </AppText>
              </View>
            )}
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <AppText style={{ fontSize: 17, fontWeight: '700', color: theme.text }}>{t('review.reviewDetail')}</AppText>
          <AppText style={{ fontSize: 12, color: theme.textSecondary }}>{businessName}</AppText>
        </View>
      </View>

      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            onReply={handleReply}
            commentLikeState={commentLikes[item.id] ?? { liked: item.isLikedByCurrentUser, count: item.likeCount }}
            commentDislikeState={commentDislikes[item.id] ?? { disliked: item.isDislikedByCurrentUser, count: item.dislikeCount }}
            replyLikeStates={replyLikes}
            replyDislikeStates={replyDislikes}
            onLikeComment={handleLikeComment}
            onDislikeComment={handleDislikeComment}
            onLikeReply={handleLikeReply}
            onDislikeReply={handleDislikeReply}
            onReplyToReply={handleReplyToReply}
            forceExpanded={expandedCommentIds.has(item.id)}
            currentUserId={authUser?.id}
          />
        )}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={{ padding: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isCommentsLoading}
            onRefresh={loadComments}
            tintColor={colors.neonPurple}
            colors={[colors.neonPurple]}
          />
        }
        ListEmptyComponent={
          !isCommentsLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
              <MaterialCommunityIcons name="comment-off-outline" size={40} color={theme.textMuted} />
              <AppText style={{ fontSize: 14, color: theme.textSecondary }}>{t('review.noComments')}</AppText>
            </View>
          ) : null
        }
      />

      {/* Send error banner */}
      {sendError && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(239, 68, 68, 0.3)',
            gap: 8,
          }}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={14} color="#ef4444" />
          <AppText style={{ flex: 1, fontSize: 12, color: '#ef4444' }}>{sendError}</AppText>
          <Pressable onPress={() => setSendError(null)} accessibilityLabel="Dismiss error" accessibilityRole="button">
            <MaterialCommunityIcons name="close" size={14} color="#ef4444" />
          </Pressable>
        </View>
      )}

      {/* Reply indicator */}
      {replyTarget && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: 'rgba(139, 92, 246, 0.12)',
            borderTopWidth: 1,
            borderTopColor: 'rgba(139, 92, 246, 0.3)',
          }}
        >
          <MaterialCommunityIcons name="reply" size={14} color={colors.neonPurple} />
          <AppText style={{ flex: 1, fontSize: 12, color: colors.neonPurple, marginLeft: 6 }}>
            {t('review.replyingTo')} {replyTarget.authorName}
          </AppText>
          <Pressable onPress={cancelReply} accessibilityLabel="Cancel reply" accessibilityRole="button">
            <MaterialCommunityIcons name="close" size={16} color={theme.textMuted} />
          </Pressable>
        </View>
      )}

      {/* Input bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.06)',
          backgroundColor: theme.background,
        }}
      >
        <Avatar
          name={authUser?.displayName ?? 'U'}
          avatarUrl={authUser?.avatarUrl ?? null}
          size={32}
        />
        {canComment ? (
          <TextInput
            ref={inputRef}
            value={commentText}
            onChangeText={setCommentText}
            placeholder={replyTarget ? t('review.writeReply') : t('review.writeComment')}
            placeholderTextColor={theme.textMuted}
            multiline
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 8,
              fontSize: 14,
              color: theme.text,
              maxHeight: 100,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
            }}
            accessibilityLabel="Write a comment"
          />
        ) : (
          <Pressable
            onPress={() => setSendError(t('review.cannotCommentOwnReview'))}
            accessibilityLabel={t('review.cannotCommentOwnReview')}
            accessibilityRole="button"
            style={{
              flex: 1,
              backgroundColor: theme.card,
              borderRadius: 20,
              paddingHorizontal: 14,
              paddingVertical: 10,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.07)',
              justifyContent: 'center',
            }}
          >
            <AppText style={{ fontSize: 14, color: theme.textMuted }}>
              {t('review.writeComment')}
            </AppText>
          </Pressable>
        )}
        <Pressable
          onPress={handleSend}
          disabled={!commentText.trim() || isSending}
          accessibilityLabel="Send"
          accessibilityRole="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: commentText.trim() ? colors.neonPurple : 'rgba(139, 92, 246, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="send" size={16} color="#FFFFFF" />
          )}
        </Pressable>
      </View>
      {initialReview && (
        <ReportReviewModal
          visible={reportModalVisible}
          onClose={() => setReportModalVisible(false)}
          reviewId={reviewId}
          businessId={resolvedBusinessId}
          businessName={businessName}
          reviewAuthorId={initialReview.authorId}
          reviewAuthorName={initialReview.authorName}
          reviewText={initialReview.text}
          reviewRating={initialReview.rating}
        />
      )}
    </KeyboardAvoidingView>
  );
}
