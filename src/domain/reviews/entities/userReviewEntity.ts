export type ReviewStatus = 'posted' | 'pending' | 'removed' | 'declined';

export interface UserReviewEntity {
  id: string;
  userId: string;
  businessId: string;
  businessName: string;
  overallRating: number;
  reviewText: string;
  photoUrls: string[];
  createdAt: Date;
  likesCount: number;
  viewsCount: number;
  status: ReviewStatus;
}
