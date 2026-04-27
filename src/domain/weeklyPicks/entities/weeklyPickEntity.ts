export interface WeeklyPickEntity {
  id: string;
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
  businessCoverUrl: string | null;
  businessRating: number;
  businessReviewCount: number;
  categoryName: string;
  pickReason: string;
  weekStartDate: Date;
  createdAt: Date;
}
