export interface CreateReviewInput {
  businessId: string;
  businessName: string;
  ratings: Record<string, number>;
  overallRating: number;
  reviewText: string;
  photoUrls: string[];
}
