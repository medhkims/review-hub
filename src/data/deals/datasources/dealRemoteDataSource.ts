import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { DealModel } from '../models/dealModel';

export interface DealRemoteDataSource {
  getActiveDeals(): Promise<DealModel[]>;
}

export class DealRemoteDataSourceImpl implements DealRemoteDataSource {
  private cachedDeals: DealModel[] | null = null;
  private cacheTimestamp = 0;
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getActiveDeals(): Promise<DealModel[]> {
    // Return cached deals if still fresh to avoid full collection scan
    if (this.cachedDeals && Date.now() - this.cacheTimestamp < DealRemoteDataSourceImpl.CACHE_TTL) {
      return this.cachedDeals;
    }
    const now = new Date();
    // Query all businesses and extract active deals from their menu_categories
    const snapshot = await getDocs(collection(firestore, 'businesses'));
    // Aggregate deals per business — keep the item with the highest discount as representative
    const businessDealsMap = new Map<string, { deal: DealModel; maxDiscount: number; count: number }>();

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const menuCategories = data.menu_categories;
      if (!Array.isArray(menuCategories)) continue;

      const businessId = doc.id;
      const businessName = data.name ?? '';
      const businessLogoUrl = data.logo_url ?? null;
      const businessCoverUrl = data.cover_image_url ?? null;

      let maxDiscount = 0;
      let dealCount = 0;
      let bestItem: { item: Record<string, unknown>; category: Record<string, unknown>; validUntil: Timestamp } | null = null;

      for (const category of menuCategories) {
        if (!Array.isArray(category.items)) continue;
        for (const item of category.items) {
          if (!item.is_deal) continue;

          // Check if deal is still valid
          let validUntil: Timestamp | null = null;
          if (item.deal_valid_until) {
            if (item.deal_valid_until instanceof Timestamp) {
              validUntil = item.deal_valid_until;
            } else if (item.deal_valid_until.toDate) {
              validUntil = item.deal_valid_until;
            } else if (typeof item.deal_valid_until === 'string' || item.deal_valid_until instanceof Date) {
              const d = new Date(item.deal_valid_until);
              if (!isNaN(d.getTime())) {
                validUntil = Timestamp.fromDate(d);
              }
            }
          }

          // Skip expired deals
          if (validUntil && validUntil.toDate() < now) continue;

          const discount = item.deal_discount_percent ?? 0;
          dealCount++;
          if (discount > maxDiscount || !bestItem) {
            maxDiscount = discount;
            bestItem = { item, category, validUntil: validUntil ?? Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) };
          }
        }
      }

      if (bestItem && dealCount > 0) {
        const deal: DealModel = {
          id: `${businessId}_deals`,
          business_id: businessId,
          business_name: businessName,
          business_logo_url: businessLogoUrl,
          business_cover_url: businessCoverUrl,
          title: bestItem.item.name as string ?? '',
          description: bestItem.item.description as string ?? '',
          discount_percent: bestItem.item.deal_discount_percent as number ?? null,
          valid_until: bestItem.validUntil,
          is_active: true,
          created_at: data.created_at ?? Timestamp.now(),
          menu_category_name: bestItem.category.name as string ?? '',
          original_price: bestItem.item.price as number ?? 0,
          currency: bestItem.item.currency as string ?? 'TND',
          max_discount_percent: maxDiscount,
          deal_count: dealCount,
        };
        businessDealsMap.set(businessId, { deal, maxDiscount, count: dealCount });
      }
    }

    const deals = Array.from(businessDealsMap.values()).map((v) => v.deal);
    // Sort by highest discount first
    deals.sort((a, b) => b.max_discount_percent - a.max_discount_percent);
    this.cachedDeals = deals;
    this.cacheTimestamp = Date.now();
    return deals;
  }
}
