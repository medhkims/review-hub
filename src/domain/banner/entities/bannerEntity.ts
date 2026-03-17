export interface BannerEntity {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  isActive: boolean;
  isClickable: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
