import { firestore, storage } from '@/core/firebase/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
  Timestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';
import { BusinessModel } from '../models/businessModel';
import { BusinessDetailModel } from '../models/businessDetailModel';
import { ReviewModel } from '../models/reviewModel';
import { CommentModel, ReplyModel } from '../models/commentModel';
import { ServerException } from '@/core/error/exceptions';
import { auth } from '@/core/firebase/firebaseConfig';
import { findBestFuzzyMatch } from '@/core/utils/fuzzySearch';
import { DuplicateCheckResult, SubmitBusinessParams } from '@/domain/business/repositories/businessRepository';

export interface RegisterBusinessData {
  businessName: string;
  category: string;
  subCategories: string[];
  email: string;
  phone: string;
  location: string;
  website: string;
  facebook: string;
  instagram: string;
}

export interface UpdateBusinessData {
  [key: string]: unknown;
}

export interface ActiveCategoryInfo {
  categoryIds: string[];
  subcategoryNamesByCategoryId: Record<string, string[]>;
}

export interface BusinessRemoteDataSource {
  getFeaturedBusinesses(): Promise<BusinessModel[]>;
  getNearbyBusinesses(latitude: number, longitude: number, radiusKm: number): Promise<BusinessModel[]>;
  getTopRatedBusinesses(): Promise<BusinessModel[]>;
  getPopularByCategory(categoryId: string): Promise<BusinessModel[]>;
  getNewBusinesses(): Promise<BusinessModel[]>;
  getBusinessesByCategory(categoryId: string): Promise<BusinessModel[]>;
  searchBusinesses(queryStr: string, categoryId?: string | null): Promise<BusinessModel[]>;
  fuzzySearchBusiness(queryStr: string, categoryId?: string | null): Promise<BusinessModel | null>;
  getUserFavoriteIds(userId: string): Promise<string[]>;
  addFavorite(businessId: string, userId: string): Promise<void>;
  removeFavorite(businessId: string, userId: string): Promise<void>;
  isFavorite(businessId: string, userId: string): Promise<boolean>;
  getBusinessDetail(businessId: string, skipTracking?: boolean): Promise<BusinessDetailModel>;
  getBusinessByOwnerId(userId: string): Promise<BusinessDetailModel | null>;
  getBusinessReviews(businessId: string): Promise<ReviewModel[]>;
  registerBusiness(data: RegisterBusinessData): Promise<string>;
  updateBusiness(businessId: string, data: UpdateBusinessData): Promise<void>;
  getActiveCategoryInfo(): Promise<ActiveCategoryInfo>;
  submitBusiness(params: SubmitBusinessParams): Promise<string>;
  checkBusinessDuplicate(name: string, categoryId: string): Promise<DuplicateCheckResult>;
  uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu' | 'gallery'): Promise<string>;
  getPendingBusinesses(): Promise<BusinessDetailModel[]>;
  getApprovedBusinesses(): Promise<BusinessDetailModel[]>;
  getRejectedBusinesses(): Promise<BusinessDetailModel[]>;
  acceptBusiness(businessId: string): Promise<void>;
  rejectBusiness(businessId: string): Promise<void>;
  suspendBusiness(businessId: string): Promise<void>;
  reApproveBusiness(businessId: string): Promise<void>;
  getSuspendedBusinesses(): Promise<BusinessDetailModel[]>;
  incrementSearchCount(businessId: string): Promise<void>;
  incrementGlobalSearchCount(): Promise<void>;
  reportBusiness(businessId: string, businessName: string, reason: string, reportedByUserId: string, reporterDisplayName: string): Promise<void>;
  likeReview(reviewId: string, userId: string): Promise<void>;
  unlikeReview(reviewId: string, userId: string): Promise<void>;
  incrementReviewView(reviewId: string): Promise<void>;
  getReviewComments(reviewId: string): Promise<CommentModel[]>;
  addReviewComment(reviewId: string, userId: string, text: string): Promise<CommentModel>;
  addCommentReply(commentId: string, reviewId: string, userId: string, text: string, replyingToName?: string): Promise<ReplyModel>;
  likeComment(commentId: string, userId: string): Promise<void>;
  unlikeComment(commentId: string, userId: string): Promise<void>;
  likeReply(replyId: string, userId: string): Promise<void>;
  unlikeReply(replyId: string, userId: string): Promise<void>;
  dislikeReview(reviewId: string, userId: string): Promise<void>;
  undislikeReview(reviewId: string, userId: string): Promise<void>;
  dislikeComment(commentId: string, userId: string): Promise<void>;
  undislikeComment(commentId: string, userId: string): Promise<void>;
  dislikeReply(replyId: string, userId: string): Promise<void>;
  undislikeReply(replyId: string, userId: string): Promise<void>;
  getRecentReviews(count: number): Promise<(ReviewModel & { business_id: string; business_name: string })[]>;
  claimBusiness(businessId: string, businessName: string, claimantUserId: string, claimantName: string, claimantEmail: string, claimantPhone: string, claimantRole: string, proofDescription: string): Promise<void>;
  getHomeStats(): Promise<{ totalBusinesses: number; totalReviews: number }>;
  getBusinessCategoryStats(): Promise<Record<string, { total: number; bySubcategory: Record<string, number> }>>;
  syncCriterionAddedToBusinesses(categoryId: string, criterion: { name: string; icon: string }): Promise<void>;
  syncCriterionRemovedFromBusinesses(categoryId: string, criterionLabel: string): Promise<void>;
}

/** Build a BusinessModel from a Firestore doc, deriving `platforms` from `contact` if absent. */
function docToBusinessModel(id: string, data: Record<string, unknown>): BusinessModel {
  const model = { id, ...data } as BusinessModel;
  if (!model.platforms || model.platforms.length === 0) {
    const c = data.contact as Record<string, unknown> | undefined;
    if (c) {
      const p: string[] = [];
      if (c.instagram_handle) p.push('instagram');
      if (c.facebook_name) p.push('facebook');
      if (c.tiktok_handle) p.push('tiktok');
      if (c.youtube_handle) p.push('youtube');
      if (c.twitch_handle || c.kick_handle) p.push('other');
      model.platforms = p;
    }
  }
  return model;
}

export class BusinessRemoteDataSourceImpl implements BusinessRemoteDataSource {
  private readonly BUSINESSES = 'businesses';
  private readonly FAVORITES = 'favorites';
  private readonly REVIEWS = 'reviews';

  private categoryInfoCache: ActiveCategoryInfo | null = null;
  private categoryInfoCacheTime = 0;
  private static CATEGORY_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  async getFeaturedBusinesses(): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('is_featured', '==', true),
        orderBy('rating', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const featured = snapshot.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
      if (featured.length > 0) return featured;
      // Fallback: no featured businesses — return newest businesses instead
      const fallbackQ = query(
        collection(firestore, this.BUSINESSES),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      return fallbackSnap.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch featured businesses';
      throw new ServerException(message);
    }
  }

  async getNearbyBusinesses(latitude: number, longitude: number, radiusKm: number): Promise<BusinessModel[]> {
    try {
      // Try progressively larger bounding boxes.
      const radii = [radiusKm, 50, 500, 2000];
      for (const r of radii) {
        const latDelta = Math.min(r / 111, 89);
        const cosLat = Math.cos((latitude * Math.PI) / 180) || 0.01;
        const lngDelta = Math.min(r / (111 * cosLat), 180);
        const minLat = Math.max(latitude - latDelta, -90);
        const maxLat = Math.min(latitude + latDelta, 90);
        const minLng = longitude - lngDelta;
        const maxLng = longitude + lngDelta;

        const q = query(
          collection(firestore, this.BUSINESSES),
          where('latitude', '>=', minLat),
          where('latitude', '<=', maxLat),
          limit(200),
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs
          .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
          .filter((m) => {
            const lng = m.longitude;
            if (lng == null) return false;
            if (lng < minLng || lng > maxLng) return false;
            return !m.status || m.status === 'active';
          });
        if (results.length > 0) return results;
      }

      // Absolute fallback: fetch any active businesses that have coordinates at all.
      // This handles the case where the user is far from all businesses (e.g. Germany
      // while all businesses are in Tunisia). We use latitude >= -90 which matches
      // every document where latitude is stored as a real number.
      const fallbackQ = query(
        collection(firestore, this.BUSINESSES),
        where('latitude', '>=', -90),
        orderBy('latitude'),
        limit(50),
      );
      const fallbackSnap = await getDocs(fallbackQ);
      return fallbackSnap.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => m.longitude != null && (!m.status || m.status === 'active'));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch nearby businesses';
      throw new ServerException(message);
    }
  }

  async getTopRatedBusinesses(): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        orderBy('rating', 'desc'),
        limit(20),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active')
        .slice(0, 10);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch top rated businesses';
      throw new ServerException(message);
    }
  }

  async getPopularByCategory(categoryId: string): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('category_id', '==', categoryId),
        orderBy('rating', 'desc'),
        limit(10),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch popular businesses';
      throw new ServerException(message);
    }
  }

  async getNewBusinesses(): Promise<BusinessModel[]> {
    try {
      // Trending: businesses with the most reviews this week
      const q = query(
        collection(firestore, this.BUSINESSES),
        orderBy('weekly_review_count', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const results = snapshot.docs
          .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
          .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
        if (results.length > 0) return results;
      }
      // Fallback: if no businesses have weekly_review_count, use review_count
      const fallbackQ = query(
        collection(firestore, this.BUSINESSES),
        orderBy('review_count', 'desc'),
        limit(20)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      return fallbackSnap.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
    } catch {
      // weekly_review_count index may not exist yet — fall back to review_count
      try {
        const fallbackQ = query(
          collection(firestore, this.BUSINESSES),
          orderBy('review_count', 'desc'),
          limit(20)
        );
        const fallbackSnap = await getDocs(fallbackQ);
        return fallbackSnap.docs
          .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
          .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
      } catch (fallbackError: unknown) {
        const message = fallbackError instanceof Error ? fallbackError.message : 'Failed to fetch trending businesses';
        throw new ServerException(message);
      }
    }
  }

  async getBusinessesByCategory(categoryId: string): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('category_id', '==', categoryId),
        orderBy('rating', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch businesses';
      throw new ServerException(message);
    }
  }

  async searchBusinesses(queryStr: string, categoryId?: string | null): Promise<BusinessModel[]> {
    try {
      const lower = queryStr.toLowerCase().trim();

      // Firestore doesn't support multi-field substring search, so we fetch
      // businesses (optionally filtered by category) and filter + sort client-side.
      const baseQuery = categoryId
        ? query(
            collection(firestore, this.BUSINESSES),
            where('category_id', '==', categoryId),
            orderBy('rating', 'desc'),
            limit(300),
          )
        : query(
            collection(firestore, this.BUSINESSES),
            orderBy('rating', 'desc'),
            limit(300),
          );
      const snapshot = await getDocs(baseQuery);

      // Score each document:
      //   1 = name match (highest priority)
      //   2 = description match
      //   3 = price list / menu match (lowest priority)
      const scored: Array<{ model: BusinessModel; priority: number }> = [];

      for (const d of snapshot.docs) {
        const data = d.data();
        const model = docToBusinessModel(d.id, data as Record<string, unknown>);

        const nameMatch =
          typeof data['name'] === 'string' &&
          data['name'].toLowerCase().includes(lower);

        const descMatch =
          typeof data['description'] === 'string' &&
          data['description'].toLowerCase().includes(lower);

        const menuCategories = data['menu_categories'];
        const menuMatch =
          Array.isArray(menuCategories) &&
          menuCategories.some((cat) => {
            if (typeof cat.name === 'string' && cat.name.toLowerCase().includes(lower)) {
              return true;
            }
            return (
              Array.isArray(cat.items) &&
              cat.items.some(
                (item: { name?: unknown; description?: unknown }) =>
                  (typeof item.name === 'string' && item.name.toLowerCase().includes(lower)) ||
                  (typeof item.description === 'string' && item.description.toLowerCase().includes(lower))
              )
            );
          });

        if (nameMatch) {
          scored.push({ model, priority: 1 });
        } else if (descMatch) {
          scored.push({ model, priority: 2 });
        } else if (menuMatch) {
          scored.push({ model, priority: 3 });
        }
      }

      // Sort by priority (name matches first, then description, then menu).
      // Array.sort is stable — within the same priority, Firestore's rating-desc
      // order is preserved.
      scored.sort((a, b) => a.priority - b.priority);

      return scored
        .filter((s) => !s.model.status || s.model.status === 'active' || s.model.status === 'blocked')
        .map((s) => s.model);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search businesses';
      throw new ServerException(message);
    }
  }

  async getUserFavoriteIds(userId: string): Promise<string[]> {
    try {
      const q = query(
        collection(firestore, this.FAVORITES),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data().business_id as string);
    } catch {
      return [];
    }
  }

  async isFavorite(businessId: string, userId: string): Promise<boolean> {
    try {
      const favId = `${userId}_${businessId}`;
      const favDoc = await getDoc(doc(firestore, this.FAVORITES, favId));
      return favDoc.exists();
    } catch {
      return false;
    }
  }

  async addFavorite(businessId: string, userId: string): Promise<void> {
    try {
      const favId = `${userId}_${businessId}`;
      await setDoc(doc(firestore, this.FAVORITES, favId), {
        user_id: userId,
        business_id: businessId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add favorite';
      throw new ServerException(message);
    }
  }

  async removeFavorite(businessId: string, userId: string): Promise<void> {
    try {
      const favId = `${userId}_${businessId}`;
      await deleteDoc(doc(firestore, this.FAVORITES, favId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove favorite';
      throw new ServerException(message);
    }
  }

  async getBusinessDetail(businessId: string, skipTracking?: boolean): Promise<BusinessDetailModel> {
    try {
      const docRef = doc(firestore, this.BUSINESSES, businessId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new ServerException('Business not found');
      }
      // Fire-and-forget: increment visit_count only for regular users (not admins)
      if (!skipTracking) {
        updateDoc(docRef, { visit_count: increment(1) }).catch(() => {});
        addDoc(collection(firestore, 'visit_events'), { created_at: serverTimestamp() }).catch(() => {});
      }
      return { id: docSnap.id, ...docSnap.data() } as BusinessDetailModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to fetch business detail';
      throw new ServerException(message);
    }
  }

  async getBusinessByOwnerId(userId: string): Promise<BusinessDetailModel | null> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('owner_id', '==', userId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as BusinessDetailModel;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch business by owner';
      throw new ServerException(message);
    }
  }

  async getBusinessReviews(businessId: string): Promise<ReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const rawReviews = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as ReviewModel))
        .filter((r) => r.status === 'posted');

      // Batch-fetch author display names from profiles
      const uniqueUserIds = [...new Set(rawReviews.map((r) => r.user_id))];
      const profileMap: Record<string, { display_name?: string; avatar_url?: string }> = {};
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const profileSnap = await getDoc(doc(firestore, 'profiles', uid));
            if (profileSnap.exists()) {
              profileMap[uid] = profileSnap.data() as { display_name?: string; avatar_url?: string };
            }
          } catch {
            // Non-critical: fall back to user ID
          }
        })
      );

      // Check which reviews the current user has liked/disliked
      const currentUserId = auth.currentUser?.uid ?? null;
      const likedSet = new Set<string>();
      const dislikedSet = new Set<string>();
      if (currentUserId && rawReviews.length > 0) {
        await Promise.all(
          rawReviews.map(async (r) => {
            try {
              const [likeDoc, dislikeDoc] = await Promise.all([
                getDoc(doc(firestore, 'review_likes', `${currentUserId}_${r.id}`)),
                getDoc(doc(firestore, 'review_dislikes', `${currentUserId}_${r.id}`)),
              ]);
              if (likeDoc.exists()) likedSet.add(r.id);
              if (dislikeDoc.exists()) dislikedSet.add(r.id);
            } catch {
              // Non-critical
            }
          })
        );
      }

      return rawReviews.map((r) => ({
        ...r,
        author_name: profileMap[r.user_id]?.display_name ?? `User ${r.user_id.slice(0, 6)}`,
        author_avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
        is_liked_by_current_user: likedSet.has(r.id),
        is_disliked_by_current_user: dislikedSet.has(r.id),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
      throw new ServerException(message);
    }
  }

  async getRecentReviews(count: number): Promise<(ReviewModel & { business_id: string; business_name: string })[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('status', '==', 'posted'),
        orderBy('created_at', 'desc'),
        limit(count),
      );
      const snapshot = await getDocs(q);
      const rawReviews = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as (ReviewModel & { business_id: string })[];

      // Batch-fetch author profiles
      const uniqueUserIds = [...new Set(rawReviews.map((r) => r.user_id))];
      const profileMap: Record<string, { display_name?: string; avatar_url?: string }> = {};
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          try {
            const profileSnap = await getDoc(doc(firestore, 'profiles', uid));
            if (profileSnap.exists()) profileMap[uid] = profileSnap.data() as { display_name?: string; avatar_url?: string };
          } catch { /* non-critical */ }
        })
      );

      // Batch-fetch business names
      const uniqueBusinessIds = [...new Set(rawReviews.map((r) => r.business_id).filter(Boolean))];
      const businessNameMap: Record<string, string> = {};
      await Promise.all(
        uniqueBusinessIds.map(async (bid) => {
          try {
            const bizSnap = await getDoc(doc(firestore, this.BUSINESSES, bid));
            if (bizSnap.exists()) businessNameMap[bid] = (bizSnap.data() as { name?: string }).name ?? '';
          } catch { /* non-critical */ }
        })
      );

      return rawReviews.map((r) => ({
        ...r,
        author_name: profileMap[r.user_id]?.display_name ?? `User ${r.user_id.slice(0, 6)}`,
        author_avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
        business_name: businessNameMap[r.business_id] ?? '',
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch recent reviews';
      throw new ServerException(message);
    }
  }

  async likeReview(reviewId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${reviewId}`;
      await setDoc(doc(firestore, 'review_likes', likeId), {
        review_id: reviewId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { like_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to like review';
      throw new ServerException(message);
    }
  }

  async unlikeReview(reviewId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${reviewId}`;
      await deleteDoc(doc(firestore, 'review_likes', likeId));
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { like_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unlike review';
      throw new ServerException(message);
    }
  }

  async incrementReviewView(reviewId: string): Promise<void> {
    updateDoc(doc(firestore, this.REVIEWS, reviewId), { view_count: increment(1) }).catch(() => {});
  }

  async getReviewComments(reviewId: string): Promise<CommentModel[]> {
    try {
      const q = query(
        collection(firestore, 'review_comments'),
        where('review_id', '==', reviewId),
        orderBy('created_at', 'asc'),
        limit(200),
      );
      const snapshot = await getDocs(q);
      const rawComments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CommentModel));

      // Batch-fetch replies for each comment
      const repliesMap: Record<string, import('../models/commentModel').ReplyModel[]> = {};
      await Promise.all(
        rawComments.map(async (c) => {
          try {
            const rq = query(
              collection(firestore, 'review_replies'),
              where('comment_id', '==', c.id),
              orderBy('created_at', 'asc'),
              limit(50),
            );
            const rSnap = await getDocs(rq);
            repliesMap[c.id] = rSnap.docs.map((d) => ({ id: d.id, ...d.data() } as import('../models/commentModel').ReplyModel));
          } catch {
            repliesMap[c.id] = [];
          }
        })
      );

      // Enrich with author info
      const allUserIds = new Set<string>();
      rawComments.forEach((c) => allUserIds.add(c.user_id));
      Object.values(repliesMap).forEach((replies) => replies.forEach((r) => allUserIds.add(r.user_id)));

      const profileMap: Record<string, { display_name?: string; avatar_url?: string }> = {};
      await Promise.all(
        Array.from(allUserIds).map(async (uid) => {
          try {
            const snap = await getDoc(doc(firestore, 'profiles', uid));
            if (snap.exists()) profileMap[uid] = snap.data() as { display_name?: string; avatar_url?: string };
          } catch {
            // Non-critical
          }
        })
      );

      // Batch-fetch comment and reply like/dislike status for current user
      const currentUserId = auth.currentUser?.uid ?? '';
      const commentLikedSet = new Set<string>();
      const replyLikedSet = new Set<string>();
      const commentDislikedSet = new Set<string>();
      const replyDislikedSet = new Set<string>();
      if (currentUserId) {
        await Promise.all([
          ...rawComments.map(async (c) => {
            try {
              const [likeSnap, dislikeSnap] = await Promise.all([
                getDoc(doc(firestore, 'comment_likes', `${currentUserId}_${c.id}`)),
                getDoc(doc(firestore, 'comment_dislikes', `${currentUserId}_${c.id}`)),
              ]);
              if (likeSnap.exists()) commentLikedSet.add(c.id);
              if (dislikeSnap.exists()) commentDislikedSet.add(c.id);
            } catch { /* non-critical */ }
          }),
          ...Object.values(repliesMap).flat().map(async (r) => {
            try {
              const [likeSnap, dislikeSnap] = await Promise.all([
                getDoc(doc(firestore, 'reply_likes', `${currentUserId}_${r.id}`)),
                getDoc(doc(firestore, 'reply_dislikes', `${currentUserId}_${r.id}`)),
              ]);
              if (likeSnap.exists()) replyLikedSet.add(r.id);
              if (dislikeSnap.exists()) replyDislikedSet.add(r.id);
            } catch { /* non-critical */ }
          }),
        ]);
      }

      return rawComments.map((c) => ({
        ...c,
        author_name: profileMap[c.user_id]?.display_name ?? `User ${c.user_id.slice(0, 6)}`,
        author_avatar_url: profileMap[c.user_id]?.avatar_url ?? null,
        reply_count: repliesMap[c.id]?.length ?? 0,
        like_count: (c as CommentModel & { like_count?: number }).like_count ?? 0,
        is_liked_by_current_user: commentLikedSet.has(c.id),
        is_disliked_by_current_user: commentDislikedSet.has(c.id),
        _replies: (repliesMap[c.id] ?? []).map((r) => ({
          ...r,
          author_name: profileMap[r.user_id]?.display_name ?? `User ${r.user_id.slice(0, 6)}`,
          author_avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
          like_count: (r as import('../models/commentModel').ReplyModel & { like_count?: number }).like_count ?? 0,
          is_liked_by_current_user: replyLikedSet.has(r.id),
          is_disliked_by_current_user: replyDislikedSet.has(r.id),
        })),
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch comments';
      throw new ServerException(message);
    }
  }

  async addReviewComment(reviewId: string, userId: string, text: string): Promise<CommentModel> {
    try {
      const profileSnap = await getDoc(doc(firestore, 'profiles', userId)).catch(() => null);
      const profile = profileSnap?.exists() ? profileSnap.data() as { display_name?: string; avatar_url?: string } : null;

      const docRef = await addDoc(collection(firestore, 'review_comments'), {
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: serverTimestamp(),
        reply_count: 0,
        like_count: 0,
      });
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { comment_count: increment(1) }).catch(() => {});

      return {
        id: docRef.id,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: Timestamp.now(),
        reply_count: 0,
        like_count: 0,
        author_name: profile?.display_name ?? `User ${userId.slice(0, 6)}`,
        author_avatar_url: profile?.avatar_url ?? null,
        is_liked_by_current_user: false,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add comment';
      throw new ServerException(message);
    }
  }

  async addCommentReply(commentId: string, reviewId: string, userId: string, text: string, replyingToName?: string): Promise<import('../models/commentModel').ReplyModel> {
    try {
      const profileSnap = await getDoc(doc(firestore, 'profiles', userId)).catch(() => null);
      const profile = profileSnap?.exists() ? profileSnap.data() as { display_name?: string; avatar_url?: string } : null;

      const replyData: Record<string, unknown> = {
        comment_id: commentId,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: serverTimestamp(),
        like_count: 0,
      };
      if (replyingToName) replyData.replying_to_name = replyingToName;

      const docRef = await addDoc(collection(firestore, 'review_replies'), replyData);
      updateDoc(doc(firestore, 'review_comments', commentId), { reply_count: increment(1) }).catch(() => {});

      return {
        id: docRef.id,
        comment_id: commentId,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: Timestamp.now(),
        like_count: 0,
        replying_to_name: replyingToName,
        author_name: profile?.display_name ?? `User ${userId.slice(0, 6)}`,
        author_avatar_url: profile?.avatar_url ?? null,
        is_liked_by_current_user: false,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add reply';
      throw new ServerException(message);
    }
  }

  async likeComment(commentId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${commentId}`;
      await setDoc(doc(firestore, 'comment_likes', likeId), {
        comment_id: commentId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, 'review_comments', commentId), { like_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to like comment';
      throw new ServerException(message);
    }
  }

  async unlikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${commentId}`;
      await deleteDoc(doc(firestore, 'comment_likes', likeId));
      updateDoc(doc(firestore, 'review_comments', commentId), { like_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unlike comment';
      throw new ServerException(message);
    }
  }

  async likeReply(replyId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${replyId}`;
      await setDoc(doc(firestore, 'reply_likes', likeId), {
        reply_id: replyId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, 'review_replies', replyId), { like_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to like reply';
      throw new ServerException(message);
    }
  }

  async unlikeReply(replyId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${replyId}`;
      await deleteDoc(doc(firestore, 'reply_likes', likeId));
      updateDoc(doc(firestore, 'review_replies', replyId), { like_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unlike reply';
      throw new ServerException(message);
    }
  }

  async dislikeReview(reviewId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${reviewId}`;
      await setDoc(doc(firestore, 'review_dislikes', dislikeId), {
        review_id: reviewId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { dislike_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to dislike review';
      throw new ServerException(message);
    }
  }

  async undislikeReview(reviewId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${reviewId}`;
      await deleteDoc(doc(firestore, 'review_dislikes', dislikeId));
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { dislike_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to undislike review';
      throw new ServerException(message);
    }
  }

  async dislikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${commentId}`;
      await setDoc(doc(firestore, 'comment_dislikes', dislikeId), {
        comment_id: commentId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, 'review_comments', commentId), { dislike_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to dislike comment';
      throw new ServerException(message);
    }
  }

  async undislikeComment(commentId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${commentId}`;
      await deleteDoc(doc(firestore, 'comment_dislikes', dislikeId));
      updateDoc(doc(firestore, 'review_comments', commentId), { dislike_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to undislike comment';
      throw new ServerException(message);
    }
  }

  async dislikeReply(replyId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${replyId}`;
      await setDoc(doc(firestore, 'reply_dislikes', dislikeId), {
        reply_id: replyId,
        user_id: userId,
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, 'review_replies', replyId), { dislike_count: increment(1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to dislike reply';
      throw new ServerException(message);
    }
  }

  async undislikeReply(replyId: string, userId: string): Promise<void> {
    try {
      const dislikeId = `${userId}_${replyId}`;
      await deleteDoc(doc(firestore, 'reply_dislikes', dislikeId));
      updateDoc(doc(firestore, 'review_replies', replyId), { dislike_count: increment(-1) }).catch(() => {});
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to undislike reply';
      throw new ServerException(message);
    }
  }

  async registerBusiness(data: RegisterBusinessData): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new ServerException('User must be authenticated to register a business');
      }

      const businessDoc = await addDoc(collection(firestore, this.BUSINESSES), {
        name: data.businessName,
        description: '',
        category_id: data.category,
        category_name: data.category,
        sub_category: data.subCategories[0] ?? '',
        sub_categories: data.subCategories,
        location: data.location || '',
        latitude: null,
        longitude: null,
        cover_image_url: null,
        logo_url: null,
        is_open: false,
        rating: 0,
        review_count: 0,
        is_featured: false,
        status: 'pending',
        is_verified: true,
        owner_id: currentUser.uid,
        contact: {
          phone: data.phone || null,
          email: data.email || null,
          website: data.website || null,
          instagram_handle: data.instagram || null,
          facebook_name: data.facebook || null,
          tiktok_handle: null,
        },
        platforms: [
          ...(data.instagram ? ['instagram'] : []),
          ...(data.facebook ? ['facebook'] : []),
        ],
        category_ratings: [],
        rating_distribution: [],
        menu_categories: [],
        delivery_services: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return businessDoc.id;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to register business';
      throw new ServerException(message);
    }
  }

  async updateBusiness(businessId: string, data: UpdateBusinessData): Promise<void> {
    try {
      const docRef = doc(firestore, this.BUSINESSES, businessId);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update business';
      throw new ServerException(message);
    }
  }

  async fuzzySearchBusiness(queryStr: string, categoryId?: string | null): Promise<BusinessModel | null> {
    try {
      const q = categoryId
        ? query(
            collection(firestore, this.BUSINESSES),
            where('category_id', '==', categoryId),
            orderBy('rating', 'desc'),
            limit(100),
          )
        : query(
            collection(firestore, this.BUSINESSES),
            orderBy('rating', 'desc'),
            limit(100),
          );
      const snapshot = await getDocs(q);
      const models = snapshot.docs
        .map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
      return findBestFuzzyMatch(queryStr, models, (m) => m.name);
    } catch {
      return null;
    }
  }

  async submitBusiness(params: SubmitBusinessParams): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new ServerException('User must be authenticated to submit a business');
      }
      const docRef = await addDoc(collection(firestore, this.BUSINESSES), {
        name: params.businessName,
        description: '',
        category_id: params.categoryId,
        category_name: params.categoryName,
        sub_category: '',
        sub_categories: [],
        location: params.location,
        latitude: null,
        longitude: null,
        cover_image_url: params.coverImageUrl || null,
        logo_url: params.logoUrl || null,
        is_open: false,
        rating: 0,
        review_count: 0,
        is_featured: false,
        status: params.isAdminSubmit ? 'active' : 'pending',
        is_verified: false,
        owner_id: currentUser.uid,
        submitted_by: currentUser.uid,
        contact: {
          phone: null,
          email: null,
          website: params.website || null,
          instagram_handle: null,
          facebook_name: null,
          tiktok_handle: null,
        },
        category_ratings: [],
        rating_distribution: [],
        menu_categories: [],
        delivery_services: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
      return docRef.id;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to submit business';
      throw new ServerException(message);
    }
  }

  async checkBusinessDuplicate(name: string, categoryId: string): Promise<DuplicateCheckResult> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('category_id', '==', categoryId),
        orderBy('rating', 'desc'),
        limit(100),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => docToBusinessModel(d.id, d.data() as Record<string, unknown>));

      // Exact match: same name (case-insensitive)
      const exactModel = models.find(
        (m) => m.name.toLowerCase() === name.toLowerCase(),
      );
      if (exactModel) {
        return { exact: { id: exactModel.id, name: exactModel.name }, similar: null };
      }

      // Similar match: fuzzy above 0.65 threshold
      const similarModel = findBestFuzzyMatch(name, models, (m) => m.name, 0.65);
      return {
        exact: null,
        similar: similarModel ? { id: similarModel.id, name: similarModel.name } : null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Duplicate check failed';
      throw new ServerException(message);
    }
  }

  async uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu' | 'gallery'): Promise<string> {
    try {
      let uploadData: Uint8Array | Blob;
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        if (!response.ok) throw new ServerException('Failed to read image file');
        uploadData = await response.blob();
      } else {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response as ArrayBuffer);
          xhr.onerror = () => reject(new ServerException('Failed to read image file'));
          xhr.responseType = 'arraybuffer';
          xhr.open('GET', imageUri, true);
          xhr.send(null);
        });
        uploadData = new Uint8Array(arrayBuffer);
      }

      const filename = `${type}_${Date.now()}.jpg`;
      const storagePath = `business_images/${businessId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, uploadData, { contentType: 'image/jpeg' });
        uploadTask.on(
          'state_changed',
          null,
          (error) => reject(new ServerException(error.message || 'Upload failed')),
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (err: unknown) {
              const e = err as { message?: string };
              reject(new ServerException(e.message || 'Failed to get download URL'));
            }
          },
        );
      });
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const e = error as { message?: string };
      throw new ServerException(e.message || 'Failed to upload image');
    }
  }

  async getPendingBusinesses(): Promise<BusinessDetailModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('status', '==', 'pending'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDetailModel));
      // Sort newest first in memory — avoids requiring a composite Firestore index
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending businesses';
      throw new ServerException(message);
    }
  }

  async getApprovedBusinesses(): Promise<BusinessDetailModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('status', '==', 'active'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDetailModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch approved businesses';
      throw new ServerException(message);
    }
  }

  async getRejectedBusinesses(): Promise<BusinessDetailModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('status', '==', 'rejected'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDetailModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch rejected businesses';
      throw new ServerException(message);
    }
  }

  async incrementSearchCount(businessId: string): Promise<void> {
    updateDoc(doc(firestore, this.BUSINESSES, businessId), { search_count: increment(1) }).catch(() => {});
    addDoc(collection(firestore, 'search_events'), { created_at: serverTimestamp() }).catch(() => {});
  }

  async incrementGlobalSearchCount(): Promise<void> {
    setDoc(
      doc(firestore, 'app_stats', 'global'),
      { total_searches: increment(1) },
      { merge: true },
    ).catch(() => {});
  }

  async acceptBusiness(businessId: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.BUSINESSES, businessId);
      const snap = await getDoc(docRef);
      const data = snap.data();
      // If this was a user-submitted business (has submitted_by field), clear owner_id
      // so the submitter is not treated as the business owner after activation.
      const wasUserSubmitted = !!data?.['submitted_by'];
      await updateDoc(docRef, {
        status: 'active',
        ...(wasUserSubmitted ? { owner_id: null } : {}),
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to accept business';
      throw new ServerException(message);
    }
  }

  async rejectBusiness(businessId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.BUSINESSES, businessId), {
        status: 'rejected',
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject business';
      throw new ServerException(message);
    }
  }

  async suspendBusiness(businessId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.BUSINESSES, businessId), {
        status: 'suspended',
        suspension_count: increment(1),
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to suspend business';
      throw new ServerException(message);
    }
  }

  async reApproveBusiness(businessId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.BUSINESSES, businessId), {
        status: 'active',
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to re-approve business';
      throw new ServerException(message);
    }
  }

  async getSuspendedBusinesses(): Promise<BusinessDetailModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('status', '==', 'suspended'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessDetailModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch suspended businesses';
      throw new ServerException(message);
    }
  }

  async getActiveCategoryInfo(): Promise<ActiveCategoryInfo> {
    // Return cached result if still fresh to avoid full collection scan
    if (this.categoryInfoCache && Date.now() - this.categoryInfoCacheTime < BusinessRemoteDataSourceImpl.CATEGORY_CACHE_TTL) {
      return this.categoryInfoCache;
    }

    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
      );
      const snapshot = await getDocs(q);

      const categoryIdSet = new Set<string>();
      const subsByCatId: Record<string, Set<string>> = {};

      for (const d of snapshot.docs) {
        const data = d.data();
        const catId = data['category_id'] as string | undefined;
        if (!catId) continue;

        categoryIdSet.add(catId);

        if (!subsByCatId[catId]) {
          subsByCatId[catId] = new Set();
        }

        // Collect subcategory from the explicit sub_category field
        const subCat = data['sub_category'] as string | undefined;
        if (subCat && subCat.trim()) {
          subsByCatId[catId].add(subCat.trim());
        }

        // Also collect from sub_categories array field
        const subCats = data['sub_categories'] as string[] | undefined;
        if (Array.isArray(subCats)) {
          for (const s of subCats) {
            if (typeof s === 'string' && s.trim()) {
              subsByCatId[catId].add(s.trim());
            }
          }
        }

        // Also collect from category_name (used by SubCategoryBrowserScreen filter)
        const catName = data['category_name'] as string | undefined;
        if (catName && catName.trim() && catName.trim() !== catId) {
          subsByCatId[catId].add(catName.trim());
        }
      }

      const result: ActiveCategoryInfo = {
        categoryIds: Array.from(categoryIdSet),
        subcategoryNamesByCategoryId: Object.fromEntries(
          Object.entries(subsByCatId).map(([k, v]) => [k, Array.from(v)]),
        ),
      };
      this.categoryInfoCache = result;
      this.categoryInfoCacheTime = Date.now();
      return result;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch active category info';
      throw new ServerException(message);
    }
  }

  async reportBusiness(businessId: string, businessName: string, reason: string, reportedByUserId: string, reporterDisplayName: string): Promise<void> {
    try {
      await addDoc(collection(firestore, 'reports'), {
        business_id: businessId,
        business_name: businessName,
        reason,
        reported_by: reportedByUserId,
        reporter_name: reporterDisplayName,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit report';
      throw new ServerException(message);
    }
  }

  async claimBusiness(
    businessId: string,
    businessName: string,
    claimantUserId: string,
    claimantName: string,
    claimantEmail: string,
    claimantPhone: string,
    claimantRole: string,
    proofDescription: string,
  ): Promise<void> {
    try {
      await addDoc(collection(firestore, 'business_claims'), {
        business_id: businessId,
        business_name: businessName,
        claimant_user_id: claimantUserId,
        claimant_name: claimantName,
        claimant_email: claimantEmail,
        claimant_phone: claimantPhone,
        claimant_role: claimantRole,
        proof_description: proofDescription,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit claim';
      throw new ServerException(message);
    }
  }

  async getHomeStats(): Promise<{ totalBusinesses: number; totalReviews: number }> {
    try {
      const [bizSnap, revSnap] = await Promise.all([
        getCountFromServer(collection(firestore, this.BUSINESSES)),
        getCountFromServer(collection(firestore, this.REVIEWS)),
      ]);
      return {
        totalBusinesses: bizSnap.data().count,
        totalReviews: revSnap.data().count,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch stats';
      throw new ServerException(message);
    }
  }

  async getBusinessCategoryStats(): Promise<Record<string, { total: number; bySubcategory: Record<string, number> }>> {
    try {
      const snapshot = await getDocs(collection(firestore, this.BUSINESSES));
      const stats: Record<string, { total: number; bySubcategory: Record<string, number> }> = {};

      for (const d of snapshot.docs) {
        const data = d.data();
        const catId = data['category_id'] as string | undefined;
        if (!catId) continue;

        if (!stats[catId]) stats[catId] = { total: 0, bySubcategory: {} };
        stats[catId].total += 1;

        // Count by sub_categories array (preferred), fall back to sub_category string
        const subCats = data['sub_categories'] as string[] | undefined;
        const validSubCats = Array.isArray(subCats) ? subCats.filter((s) => typeof s === 'string' && s.trim()) : [];

        if (validSubCats.length > 0) {
          for (const s of validSubCats) {
            const name = (s as string).trim();
            stats[catId].bySubcategory[name] = (stats[catId].bySubcategory[name] ?? 0) + 1;
          }
        } else {
          // Fallback chain: sub_category string → subcategory_id (old seed format)
          const subCat = (data['sub_category'] ?? data['subcategory_id']) as string | undefined;
          if (subCat && subCat.trim()) {
            const name = subCat.trim();
            stats[catId].bySubcategory[name] = (stats[catId].bySubcategory[name] ?? 0) + 1;
          }
        }
      }

      return stats;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch business category stats';
      throw new ServerException(message);
    }
  }

  async syncCriterionAddedToBusinesses(categoryId: string, criterion: { name: string; icon: string }): Promise<void> {
    try {
      const snapshot = await getDocs(
        query(collection(firestore, this.BUSINESSES), where('category_id', '==', categoryId)),
      );
      if (snapshot.empty) return;
      const BATCH_LIMIT = 500;
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
        const chunk = docs.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(firestore);
        for (const d of chunk) {
          const data = d.data();
          const active = (data['category_ratings'] ?? []) as Array<{ name: string; icon: string; rating: number }>;
          const deleted = (data['deleted_category_ratings'] ?? []) as Array<{ name: string; icon: string; rating: number }>;

          // Already in active — nothing to do
          if (active.some((c) => c.name.toLowerCase() === criterion.name.toLowerCase())) continue;

          // Check if we have a saved rating from a previous deletion — restore it
          const savedIdx = deleted.findIndex((c) => c.name.toLowerCase() === criterion.name.toLowerCase());
          let restoredEntry: { name: string; icon: string; rating: number };
          let newDeleted: Array<{ name: string; icon: string; rating: number }>;

          if (savedIdx !== -1) {
            // Restore original rating
            restoredEntry = { ...deleted[savedIdx], icon: criterion.icon };
            newDeleted = deleted.filter((_, i) => i !== savedIdx);
          } else {
            // Truly new criterion — start at 0
            restoredEntry = { name: criterion.name, icon: criterion.icon, rating: 0 };
            newDeleted = deleted;
          }

          batch.update(d.ref, {
            category_ratings: [...active, restoredEntry],
            deleted_category_ratings: newDeleted,
          });
        }
        await batch.commit();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sync criterion add to businesses';
      throw new ServerException(message);
    }
  }

  async syncCriterionRemovedFromBusinesses(categoryId: string, criterionLabel: string): Promise<void> {
    try {
      const snapshot = await getDocs(
        query(collection(firestore, this.BUSINESSES), where('category_id', '==', categoryId)),
      );
      if (snapshot.empty) return;
      const BATCH_LIMIT = 500;
      const docs = snapshot.docs;
      for (let i = 0; i < docs.length; i += BATCH_LIMIT) {
        const chunk = docs.slice(i, i + BATCH_LIMIT);
        const batch = writeBatch(firestore);
        for (const d of chunk) {
          const data = d.data();
          const active = (data['category_ratings'] ?? []) as Array<{ name: string; icon: string; rating: number }>;
          const deleted = (data['deleted_category_ratings'] ?? []) as Array<{ name: string; icon: string; rating: number }>;

          const target = active.find((c) => c.name.toLowerCase() === criterionLabel.toLowerCase());
          if (!target) continue; // not in active, nothing to move

          batch.update(d.ref, {
            // Remove from active
            category_ratings: active.filter((c) => c.name.toLowerCase() !== criterionLabel.toLowerCase()),
            // Save to deleted (preserving the rating for future recovery)
            deleted_category_ratings: [...deleted, target],
          });
        }
        await batch.commit();
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to sync criterion remove from businesses';
      throw new ServerException(message);
    }
  }
}
