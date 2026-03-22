export interface ReplyEntity {
  id: string;
  commentId: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: Date;
  likeCount: number;
  isLikedByCurrentUser: boolean;
  replyingToName?: string;
}

export interface CommentEntity {
  id: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: Date;
  replyCount: number;
  replies: ReplyEntity[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
}
