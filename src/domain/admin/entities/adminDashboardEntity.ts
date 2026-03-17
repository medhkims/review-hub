export type CompanyFilter =
  | 'all'
  | 'active'
  | 'pending'
  | 'suspended'
  | 'ownerVerified'
  | 'ownerUnverified'
  | 'premium'
  | 'verifiedBasic';

export interface CompanyRankItem {
  id: string;
  name: string;
  logoUrl: string | null;
  categoryName: string;
  /** True when the business owner has claimed / registered the account */
  isOwnerVerified: boolean;
  isPremium: boolean;
  /** Approval status in Firestore */
  status: 'pending' | 'active' | 'rejected' | 'blocked';
  visits: number;
  searches: number;
  reviews: number;
  rating: number;
  /** Ranking score = rating × review_count */
  score: number;
  /** When the company was added to the platform */
  createdAt: Date | null;
}

export interface AdminDashboardStats {
  // Status dimension
  totalCompanies: number;
  active: number;
  pending: number;
  suspended: number;
  // Ownership dimension
  ownerVerified: number;
  ownerUnverified: number;
  // Premium
  premium: number;
  verifiedBasic: number;
  // Engagement totals (across all companies)
  totalVisits: number;
  totalSearches: number;
  totalReviews: number;
  // Top 5 lists
  topTotal: CompanyRankItem[];
  topActive: CompanyRankItem[];
  topPending: CompanyRankItem[];
  topOwnerVerified: CompanyRankItem[];
  topPremium: CompanyRankItem[];
}
