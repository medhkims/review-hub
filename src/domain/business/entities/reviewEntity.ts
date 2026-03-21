export interface ReviewEntity {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  text: string;
  createdAt: Date;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
}
