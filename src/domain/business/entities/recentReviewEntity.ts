export interface RecentReviewEntity {
  id: string;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number;
  text: string;
  businessId: string;
  businessName: string;
  createdAt: Date;
}
