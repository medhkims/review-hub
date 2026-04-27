export interface DealEntity {
  id: string;
  businessId: string;
  businessName: string;
  businessLogoUrl: string | null;
  businessCoverUrl: string | null;
  title: string;
  description: string;
  discountPercent: number | null;
  validUntil: Date;
  isActive: boolean;
  createdAt: Date;
  menuCategoryName: string;
  originalPrice: number;
  currency: string;
  maxDiscountPercent: number;
  dealCount: number;
}
