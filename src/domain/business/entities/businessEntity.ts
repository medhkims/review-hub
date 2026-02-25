export interface BusinessEntity {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  location: string;
  coverImageUrl: string | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isFavorite: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}
