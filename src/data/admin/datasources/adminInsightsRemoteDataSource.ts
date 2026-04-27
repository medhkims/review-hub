import {
  collection,
  getDocs,
  getCountFromServer,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { ServerException } from '@/core/error/exceptions';

// ── Exported types used by presentation layer ──────────────────────────────

export interface AdminStatItem {
  label: string;
  value: number;
}

export interface TopCompanyItem {
  id: string;
  rank: number;
  name: string;
  category: string;
  views: number;
}

export interface UserActivityMetrics {
  totalUsers: number;
  recentDayUsers: number;
  recentWeekUsers: number;
  recentMonthUsers: number;
}

export interface SentimentData {
  totalReviews: number;
  flaggedCount: number;
  positivePercent: number;
  neutralPercent: number;
  negativePercent: number;
}

export interface SystemHealthData {
  pendingBusinesses: number;
  pendingReviews: number;
  reportedIssues: number;
}

export interface ConversionData {
  premiumRate: number;
  verifiedRate: number;
}

export interface GeoRegion {
  name: string;
  count: number;
  percentage: number;
}

export interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
}

export interface ModeratorDashboardData {
  pendingReviews: number;
  flaggedContent: number;
  recentActivity: { id: string; action: string; target: string; time: Date }[];
}

// ── Data Source ────────────────────────────────────────────────────────────

export interface AdminInsightsRemoteDataSource {
  fetchPlatformStats(): Promise<AdminStatItem[]>;
  fetchTopCompanies(count: number): Promise<TopCompanyItem[]>;
  fetchUserActivity(): Promise<UserActivityMetrics>;
  fetchTopSearchTerms(count: number): Promise<string[]>;
  fetchSentiment(): Promise<SentimentData>;
  fetchSystemHealth(): Promise<SystemHealthData>;
  fetchConversionMetrics(): Promise<ConversionData>;
  fetchGeoDistribution(): Promise<GeoRegion[]>;
  fetchUsers(): Promise<UserItem[]>;
  fetchModeratorDashboard(): Promise<ModeratorDashboardData>;
}

export class AdminInsightsRemoteDataSourceImpl implements AdminInsightsRemoteDataSource {

  // ── Platform Stats ────────────────────────────────────────────────────────

  async fetchPlatformStats(): Promise<AdminStatItem[]> {
    try {
      const [bizSnap, visitsSnap, searchesSnap, reviewsSnap, profilesSnap] = await Promise.all([
        getDocs(collection(firestore, 'businesses')),
        getCountFromServer(collection(firestore, 'visit_events')),
        getCountFromServer(collection(firestore, 'search_events')),
        getCountFromServer(collection(firestore, 'reviews')),
        getCountFromServer(collection(firestore, 'profiles')),
      ]);

      const businesses = bizSnap.docs.map(d => d.data());
      const totalCompanies = businesses.length;
      const activeCompanies = businesses.filter(b => b.status === 'active').length;
      const premiumCount = businesses.filter(b => {
        if (!b.is_premium) return false;
        const exp = b.premium_expires_at as Timestamp | null | undefined;
        if (!exp) return true;
        return exp.toMillis() > Date.now();
      }).length;
      const boostedCount = businesses.filter(b => {
        const exp = b.boost_expires_at as Timestamp | null | undefined;
        return exp ? exp.toMillis() > Date.now() : false;
      }).length;

      return [
        { label: 'totalCompanies', value: totalCompanies },
        { label: 'registeredUsers', value: profilesSnap.data().count },
        { label: 'totalVisits', value: visitsSnap.data().count },
        { label: 'totalSearches', value: searchesSnap.data().count },
        { label: 'totalReviews', value: reviewsSnap.data().count },
        { label: 'activeCompanies', value: activeCompanies },
        { label: 'premiumSubs', value: premiumCount },
        { label: 'boostedAds', value: boostedCount },
      ];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load platform stats';
      throw new ServerException(msg);
    }
  }

  // ── Top Companies ─────────────────────────────────────────────────────────

  async fetchTopCompanies(count: number): Promise<TopCompanyItem[]> {
    try {
      const snap = await getDocs(collection(firestore, 'businesses'));
      const items = snap.docs.map(d => {
        const data = d.data();
        const rating = (data.rating as number) ?? 0;
        const reviews = (data.review_count as number) ?? 0;
        return {
          id: d.id,
          name: (data.name as string) ?? '',
          category: (data.category_name as string) ?? '',
          views: (data.visit_count as number) ?? 0,
          score: rating * reviews,
        };
      });
      items.sort((a, b) => b.score - a.score);
      return items.slice(0, count).map((item, i) => ({
        id: item.id,
        rank: i + 1,
        name: item.name,
        category: item.category,
        views: item.views,
      }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load top companies';
      throw new ServerException(msg);
    }
  }

  // ── User Activity ─────────────────────────────────────────────────────────

  async fetchUserActivity(): Promise<UserActivityMetrics> {
    try {
      const totalSnap = await getCountFromServer(collection(firestore, 'profiles'));
      const totalUsers = totalSnap.data().count;

      const now = new Date();
      const dayAgo = Timestamp.fromDate(new Date(now.getTime() - 86400000));
      const weekAgo = Timestamp.fromDate(new Date(now.getTime() - 7 * 86400000));
      const monthAgo = Timestamp.fromDate(new Date(now.getTime() - 30 * 86400000));

      const [daySnap, weekSnap, monthSnap] = await Promise.all([
        getCountFromServer(query(collection(firestore, 'profiles'), where('updated_at', '>=', dayAgo))),
        getCountFromServer(query(collection(firestore, 'profiles'), where('updated_at', '>=', weekAgo))),
        getCountFromServer(query(collection(firestore, 'profiles'), where('updated_at', '>=', monthAgo))),
      ]);

      return {
        totalUsers,
        recentDayUsers: daySnap.data().count,
        recentWeekUsers: weekSnap.data().count,
        recentMonthUsers: monthSnap.data().count,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load user activity';
      throw new ServerException(msg);
    }
  }

  // ── Top Search Terms ──────────────────────────────────────────────────────

  async fetchTopSearchTerms(count: number): Promise<string[]> {
    try {
      const snap = await getDocs(
        query(collection(firestore, 'search_events'), orderBy('created_at', 'desc'), limit(500)),
      );
      const freq = new Map<string, number>();
      for (const doc of snap.docs) {
        const term = ((doc.data().keyword as string) ?? '').trim().toLowerCase();
        if (term) freq.set(term, (freq.get(term) ?? 0) + 1);
      }
      return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([term]) => term.charAt(0).toUpperCase() + term.slice(1));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load search terms';
      throw new ServerException(msg);
    }
  }

  // ── Reviews & Sentiment ───────────────────────────────────────────────────

  async fetchSentiment(): Promise<SentimentData> {
    try {
      const snap = await getDocs(collection(firestore, 'reviews'));
      const totalReviews = snap.size;
      let positive = 0;
      let neutral = 0;
      let negative = 0;
      let flagged = 0;

      for (const doc of snap.docs) {
        const data = doc.data();
        const rating = (data.rating as number) ?? 3;
        const status = (data.status as string) ?? '';
        if (rating >= 4) positive++;
        else if (rating >= 3) neutral++;
        else negative++;
        if (status === 'flagged' || status === 'rejected') flagged++;
      }

      const total = positive + neutral + negative || 1;
      return {
        totalReviews,
        flaggedCount: flagged,
        positivePercent: Math.round((positive / total) * 100),
        neutralPercent: Math.round((neutral / total) * 100),
        negativePercent: Math.round((negative / total) * 100),
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load sentiment';
      throw new ServerException(msg);
    }
  }

  // ── System Health ─────────────────────────────────────────────────────────

  async fetchSystemHealth(): Promise<SystemHealthData> {
    try {
      const [pendingBiz, pendingRev, reports] = await Promise.all([
        getCountFromServer(query(collection(firestore, 'businesses'), where('status', '==', 'pending'))),
        getCountFromServer(query(collection(firestore, 'reviews'), where('status', '==', 'pending'))),
        getCountFromServer(collection(firestore, 'reports')),
      ]);
      return {
        pendingBusinesses: pendingBiz.data().count,
        pendingReviews: pendingRev.data().count,
        reportedIssues: reports.data().count,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load system health';
      throw new ServerException(msg);
    }
  }

  // ── Conversion Metrics ────────────────────────────────────────────────────

  async fetchConversionMetrics(): Promise<ConversionData> {
    try {
      const snap = await getDocs(collection(firestore, 'businesses'));
      const total = snap.size || 1;
      let premium = 0;
      let verified = 0;

      for (const doc of snap.docs) {
        const data = doc.data();
        if (data.is_premium) {
          const exp = data.premium_expires_at as Timestamp | null | undefined;
          if (!exp || exp.toMillis() > Date.now()) premium++;
        }
        if (
          data.is_verified === true ||
          (data.is_verified === undefined && typeof data.owner_id === 'string' && (data.owner_id as string).length > 0)
        ) {
          verified++;
        }
      }

      return {
        premiumRate: Math.round((premium / total) * 100),
        verifiedRate: Math.round((verified / total) * 100),
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load conversion metrics';
      throw new ServerException(msg);
    }
  }

  // ── Geographical Distribution ─────────────────────────────────────────────

  async fetchGeoDistribution(): Promise<GeoRegion[]> {
    try {
      const snap = await getDocs(collection(firestore, 'businesses'));
      const freq = new Map<string, number>();
      for (const doc of snap.docs) {
        const loc = ((doc.data().location as string) ?? '').trim();
        if (loc) freq.set(loc, (freq.get(loc) ?? 0) + 1);
      }
      const total = [...freq.values()].reduce((s, v) => s + v, 0) || 1;
      return [...freq.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({
          name,
          count,
          percentage: Math.round((count / total) * 100),
        }));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load geo distribution';
      throw new ServerException(msg);
    }
  }

  // ── Users List ────────────────────────────────────────────────────────────

  async fetchUsers(): Promise<UserItem[]> {
    try {
      const snap = await getDocs(collection(firestore, 'profiles'));
      return snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: (data.display_name as string) ?? '',
          email: (data.email as string) ?? '',
          role: (data.role as string) ?? 'simple_user',
          avatarUrl: (data.avatar_url as string | null) ?? null,
        };
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load users';
      throw new ServerException(msg);
    }
  }

  // ── Moderator Dashboard ───────────────────────────────────────────────────

  async fetchModeratorDashboard(): Promise<ModeratorDashboardData> {
    try {
      const [pendingRevSnap, reportsSnap, recentReviewsSnap] = await Promise.all([
        getCountFromServer(query(collection(firestore, 'reviews'), where('status', '==', 'pending'))),
        getCountFromServer(collection(firestore, 'reports')),
        getDocs(query(collection(firestore, 'reviews'), orderBy('created_at', 'desc'), limit(10))),
      ]);

      const recentActivity = recentReviewsSnap.docs.map(d => {
        const data = d.data();
        const status = (data.status as string) ?? 'pending';
        const action = status === 'approved'
          ? 'Review approved'
          : status === 'rejected'
            ? 'Review rejected'
            : 'Review pending';
        const createdAt = data.created_at as Timestamp | null;
        return {
          id: d.id,
          action,
          target: (data.business_name as string) ?? 'Unknown business',
          time: createdAt ? createdAt.toDate() : new Date(),
        };
      });

      return {
        pendingReviews: pendingRevSnap.data().count,
        flaggedContent: reportsSnap.data().count,
        recentActivity,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to load moderator dashboard';
      throw new ServerException(msg);
    }
  }
}
