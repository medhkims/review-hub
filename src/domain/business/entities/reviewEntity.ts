export interface ReviewEntity {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  text: string;
  photoUrls: string[];
  createdAt: Date;
  likeCount: number;
  viewCount: number;
  commentCount: number;
  isLikedByCurrentUser: boolean;
  dislikeCount: number;
  isDislikedByCurrentUser: boolean;
  source?: string;
  googleAuthorName?: string;
}
