import { collection, getDocs, getDocsFromServer, Timestamp } from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { AdminDashboardStats, CompanyFilter, CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';
import { ServerException } from '@/core/error/exceptions';

const BUSINESSES = 'businesses';

function toRankItem(id: string, data: Record<string, unknown>): CompanyRankItem {
  const rating = (data.rating as number) ?? 0;
  const reviews = (data.review_count as number) ?? 0;
  const rawStatus = (data.status as string) ?? 'active';
  const status: CompanyRankItem['status'] =
    rawStatus === 'pending' || rawStatus === 'rejected' || rawStatus === 'blocked'
      ? rawStatus
      : 'active';

  const isPremiumActive = (() => {
    if (!(data.is_premium as boolean)) return false;
    const exp = data.premium_expires_at as Timestamp | null | undefined;
    if (!exp) return true;
    return exp.toMillis() > Date.now();
  })();

  const createdAtTs = data.created_at as Timestamp | null | undefined;

  return {
    id,
    name: (data.name as string) ?? '',
    logoUrl: (data.logo_url as string | null) ?? null,
    categoryName: (data.category_name as string) ?? '',
    // Explicit flag (new businesses): use it directly.
    // Legacy businesses (no is_verified field): fall back to owner_id presence,
    // since registerBusiness always sets owner_id when an owner creates their listing.
    isOwnerVerified:
      data.is_verified === true ||
      (data.is_verified === undefined &&
        typeof data.owner_id === 'string' &&
        (data.owner_id as string).length > 0),
    isPremium: isPremiumActive,
    status,
    visits: (data.visit_count as number) ?? 0,
    searches: (data.search_count as number) ?? 0,
    reviews,
    rating,
    score: rating * reviews,
    createdAt: createdAtTs ? createdAtTs.toDate() : null,
  };
}

export interface AdminRemoteDataSource {
  getDashboardStats(): Promise<AdminDashboardStats>;
  getCompanyList(filter: CompanyFilter): Promise<CompanyRankItem[]>;
}

export class AdminRemoteDataSourceImpl implements AdminRemoteDataSource {
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [snap, visitsSnap, searchesSnap] = await Promise.all([
        getDocsFromServer(collection(firestore, BUSINESSES)),
        getDocs(collection(firestore, 'visit_events')),
        getDocs(collection(firestore, 'search_events')),
      ]);
      const items = snap.docs.map((d) => toRankItem(d.id, d.data() as Record<string, unknown>));

      // ── Status dimension ────────────────────────────────────────────────────
      const totalCompanies = items.length;
      const active = items.filter((c) => c.status === 'active').length;
      const pending = items.filter((c) => c.status === 'pending').length;
      const suspended = items.filter((c) => c.status === 'blocked').length;

      // ── Ownership dimension ─────────────────────────────────────────────────
      const ownerVerified = items.filter((c) => c.isOwnerVerified).length;
      const ownerUnverified = totalCompanies - ownerVerified;

      // ── Premium ─────────────────────────────────────────────────────────────
      const premium = items.filter((c) => c.isPremium).length;
      // verifiedBasic = owner-verified + not premium
      const verifiedBasic = items.filter((c) => c.isOwnerVerified && !c.isPremium).length;

      // ── Engagement totals ───────────────────────────────────────────────────
      let totalReviews = 0;
      for (const item of items) totalReviews += item.reviews;
      const totalVisits = visitsSnap.size;
      const totalSearches = searchesSnap.size;

      // ── Top 5 lists (ranked by rating × review_count) ───────────────────────
      const ranked = [...items].sort((a, b) => b.score - a.score);

      return {
        totalCompanies,
        active,
        pending,
        suspended,
        ownerVerified,
        ownerUnverified,
        premium,
        verifiedBasic,
        totalVisits,
        totalSearches,
        totalReviews,
        topTotal: ranked.slice(0, 5),
        topActive: ranked.filter((c) => c.status === 'active').slice(0, 5),
        topPending: ranked.filter((c) => c.status === 'pending').slice(0, 5),
        topOwnerVerified: ranked.filter((c) => c.isOwnerVerified).slice(0, 5),
        topPremium: ranked.filter((c) => c.isPremium).slice(0, 5),
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load dashboard stats';
      throw new ServerException(msg);
    }
  }

  async getCompanyList(filter: CompanyFilter): Promise<CompanyRankItem[]> {
    try {
      const snap = await getDocsFromServer(collection(firestore, BUSINESSES));
      const items = snap.docs.map((d) => toRankItem(d.id, d.data() as Record<string, unknown>));

      switch (filter) {
        case 'active':          return items.filter((c) => c.status === 'active');
        case 'pending':         return items.filter((c) => c.status === 'pending');
        case 'suspended':       return items.filter((c) => c.status === 'blocked');
        case 'ownerVerified':   return items.filter((c) => c.isOwnerVerified);
        case 'ownerUnverified': return items.filter((c) => !c.isOwnerVerified);
        case 'premium':         return items.filter((c) => c.isPremium);
        case 'verifiedBasic':   return items.filter((c) => c.isOwnerVerified && !c.isPremium);
        default:                return items;
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load company list';
      throw new ServerException(msg);
    }
  }
}
