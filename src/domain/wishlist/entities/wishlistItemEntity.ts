export interface WishlistItemEntity {
  id: string;
  userId: string;
  placeId: string;
  placeName: string;
  placeImageUrl: string | null;
  rating: number;
  reviewCount: number;
  location: string;
  addedAt: Date;
}
