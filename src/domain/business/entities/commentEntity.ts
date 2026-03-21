export interface ReplyEntity {
  id: string;
  commentId: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: Date;
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
}
