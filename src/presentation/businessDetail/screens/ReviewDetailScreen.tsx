import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  FlatList,
  Pressable,
  Image,
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
import { auth } from '@/core/firebase/firebaseConfig';

export interface SerializedReview {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  text: string;
  createdAtMs: number;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}

interface ReviewDetailScreenProps {
  reviewId: string;
  businessName: string;
  initialReview: SerializedReview | null;
  backHref?: string;
}

interface LikeState {
  liked: boolean;
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
  onLike: (replyId: string, isLiked: boolean) => void;
  onReplyToReply: (reply: ReplyEntity, commentId: string) => void;
  commentId: string;
}

const ReplyItem = React.memo<ReplyItemProps>(
  ({ reply, parentAuthorName, likeState, onLike, onReplyToReply, commentId }) => {
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

          {/* Like + Reply row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <Pressable
              onPress={() => onLike(reply.id, likeState.liked)}
              accessibilityLabel={likeState.liked ? t('review.unlikeReply') : t('review.likeReply')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <MaterialCommunityIcons
                name={likeState.liked ? 'heart' : 'heart-outline'}
                size={13}
                color={likeState.liked ? '#ef4444' : theme.textMuted}
              />
              {likeState.count > 0 && (
                <AppText style={{ fontSize: 11, color: likeState.liked ? '#ef4444' : theme.textMuted }}>
                  {likeState.count}
                </AppText>
              )}
            </Pressable>
            {reply.authorId !== auth.currentUser?.uid && (
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
  replyLikeStates: Record<string, LikeState>;
  onLikeComment: (commentId: string, isLiked: boolean) => void;
  onLikeReply: (replyId: string, isLiked: boolean) => void;
  onReplyToReply: (reply: ReplyEntity, commentId: string) => void;
  forceExpanded?: boolean;
}

const CommentItem = React.memo<CommentItemProps>(({
  comment,
  onReply,
  commentLikeState,
  replyLikeStates,
  onLikeComment,
  onLikeReply,
  onReplyToReply,
  forceExpanded = false,
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

          {/* Like + Reply row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <Pressable
              onPress={() => onLikeComment(comment.id, commentLikeState.liked)}
              accessibilityLabel={commentLikeState.liked ? t('review.unlikeComment') : t('review.likeComment')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}
            >
              <MaterialCommunityIcons
                name={commentLikeState.liked ? 'heart' : 'heart-outline'}
                size={14}
                color={commentLikeState.liked ? '#ef4444' : theme.textMuted}
              />
              {commentLikeState.count > 0 && (
                <AppText style={{ fontSize: 12, color: commentLikeState.liked ? '#ef4444' : theme.textMuted }}>
                  {commentLikeState.count}
                </AppText>
              )}
            </Pressable>
            {comment.authorId !== auth.currentUser?.uid && (
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
              onLike={onLikeReply}
              onReplyToReply={onReplyToReply}
              commentId={comment.id}
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
}

export default function ReviewDetailScreen({ reviewId, businessName, initialReview, backHref }: ReviewDetailScreenProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [comments, setComments] = useState<CommentEntity[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(initialReview?.isLikedByCurrentUser ?? false);
  const [likeCount, setLikeCount] = useState(initialReview?.likeCount ?? 0);
  const [commentText, setCommentText] = useState('');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const isOwnReview = !!initialReview?.authorId && auth.currentUser?.uid === initialReview.authorId;
  const canComment = !isOwnReview || replyTarget !== null;
  const inputRef = useRef<TextInput>(null);

  const [commentLikes, setCommentLikes] = useState<Record<string, LikeState>>({});
  const [replyLikes, setReplyLikes] = useState<Record<string, LikeState>>({});
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
        data.forEach((c) => {
          cLikes[c.id] = { liked: c.isLikedByCurrentUser, count: c.likeCount };
          c.replies.forEach((r) => {
            rLikes[r.id] = { liked: r.isLikedByCurrentUser, count: r.likeCount };
          });
        });
        setCommentLikes(cLikes);
        setReplyLikes(rLikes);
      },
    );
    setIsCommentsLoading(false);
  }, [reviewId]);

  useFocusEffect(useCallback(() => {
    setSendError(null);
  }, []));

  useEffect(() => {
    loadComments();
    const currentUid = auth.currentUser?.uid;
    if (currentUid && initialReview?.authorId && currentUid !== initialReview.authorId) {
      container.incrementReviewViewUseCase.execute(reviewId).catch(() => {});
    }
  }, [loadComments, reviewId, initialReview?.authorId]);

  const handleLike = useCallback(async () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((c) => Math.max(0, c - 1));
      await container.unlikeReviewUseCase.execute(reviewId);
    } else {
      setIsLiked(true);
      setLikeCount((c) => c + 1);
      await container.likeReviewUseCase.execute(reviewId);
    }
  }, [isLiked, reviewId]);

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
      await container.likeCommentUseCase.execute(commentId);
    }
  }, []);

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
      await container.likeReplyUseCase.execute(replyId);
    }
  }, []);

  const handleReply = useCallback((comment: CommentEntity) => {
    setReplyTarget({ commentId: comment.id, authorName: comment.authorName });
    inputRef.current?.focus();
  }, []);

  const handleReplyToReply = useCallback((reply: ReplyEntity, commentId: string) => {
    setReplyTarget({ commentId, authorName: reply.authorName });
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

    const currentUserId = auth.currentUser?.uid ?? '';
    const currentUserName = auth.currentUser?.displayName ?? 'You';
    const currentUserAvatar = auth.currentUser?.photoURL ?? null;

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
      setExpandedCommentIds((prev) => new Set([...prev, commentId]));
      setReplyTarget(null);

      const result = await container.addCommentReplyUseCase.execute(commentId, reviewId, text, replyingToName);
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
      };
      setComments((prev) => [...prev, tempComment]);
      setCommentLikes((prev) => ({ ...prev, [tempCommentId]: { liked: false, count: 0 } }));

      const result = await container.addReviewCommentUseCase.execute(reviewId, text);
      result.fold(
        (failure) => {
          setComments((prev) => prev.filter((c) => c.id !== tempCommentId));
          setCommentLikes((prev) => { const next = { ...prev }; delete next[tempCommentId]; return next; });
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
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
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

          <View style={{ flexDirection: 'row', gap: 20, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
            <Pressable
              onPress={handleLike}
              accessibilityLabel={isLiked ? t('review.unlike') : t('review.like')}
              accessibilityRole="button"
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <MaterialCommunityIcons
                name={isLiked ? 'heart' : 'heart-outline'}
                size={20}
                color={isLiked ? '#ef4444' : theme.textMuted}
              />
              <AppText style={{ fontSize: 14, color: isLiked ? '#ef4444' : theme.textMuted }}>{likeCount}</AppText>
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
          borderBottomColor: 'rgba(255, 255, 255, 0.05)',
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
            backgroundColor: 'rgba(30, 41, 59, 0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color={theme.text} />
        </Pressable>
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
            replyLikeStates={replyLikes}
            onLikeComment={handleLikeComment}
            onLikeReply={handleLikeReply}
            onReplyToReply={handleReplyToReply}
            forceExpanded={expandedCommentIds.has(item.id)}
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
          name={auth.currentUser?.displayName ?? 'U'}
          avatarUrl={auth.currentUser?.photoURL ?? null}
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
    </KeyboardAvoidingView>
  );
}
