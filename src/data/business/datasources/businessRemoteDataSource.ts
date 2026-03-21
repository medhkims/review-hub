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
  uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu'): Promise<string>;
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
  addCommentReply(commentId: string, reviewId: string, userId: string, text: string): Promise<ReplyModel>;
}

export class BusinessRemoteDataSourceImpl implements BusinessRemoteDataSource {
  private readonly BUSINESSES = 'businesses';
  private readonly FAVORITES = 'favorites';
  private readonly REVIEWS = 'reviews';

  async getFeaturedBusinesses(): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('is_featured', '==', true),
        orderBy('rating', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch featured businesses';
      throw new ServerException(message);
    }
  }

  async getNewBusinesses(): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
          .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
      }
      // Fallback: some businesses may not have created_at — fetch by rating
      const fallbackQ = query(
        collection(firestore, this.BUSINESSES),
        orderBy('rating', 'desc'),
        limit(20)
      );
      const fallbackSnap = await getDocs(fallbackQ);
      return fallbackSnap.docs
        .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
        .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
    } catch {
      // created_at index may not exist yet — fall back to rating order
      try {
        const fallbackQ = query(
          collection(firestore, this.BUSINESSES),
          orderBy('rating', 'desc'),
          limit(20)
        );
        const fallbackSnap = await getDocs(fallbackQ);
        return fallbackSnap.docs
          .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
          .filter((m) => !m.status || m.status === 'active' || m.status === 'blocked');
      } catch (fallbackError: unknown) {
        const message = fallbackError instanceof Error ? fallbackError.message : 'Failed to fetch new businesses';
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
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
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
        const model = { id: d.id, ...data } as BusinessModel;

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
                (item) =>
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

      // Check which reviews the current user has liked
      const currentUserId = auth.currentUser?.uid ?? null;
      const likedSet = new Set<string>();
      if (currentUserId && rawReviews.length > 0) {
        await Promise.all(
          rawReviews.map(async (r) => {
            try {
              const likeDoc = await getDoc(doc(firestore, 'review_likes', `${currentUserId}_${r.id}`));
              if (likeDoc.exists()) likedSet.add(r.id);
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
      }));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
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

      return rawComments.map((c) => ({
        ...c,
        author_name: profileMap[c.user_id]?.display_name ?? `User ${c.user_id.slice(0, 6)}`,
        author_avatar_url: profileMap[c.user_id]?.avatar_url ?? null,
        reply_count: repliesMap[c.id]?.length ?? 0,
        _replies: (repliesMap[c.id] ?? []).map((r) => ({
          ...r,
          author_name: profileMap[r.user_id]?.display_name ?? `User ${r.user_id.slice(0, 6)}`,
          author_avatar_url: profileMap[r.user_id]?.avatar_url ?? null,
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
      });
      updateDoc(doc(firestore, this.REVIEWS, reviewId), { comment_count: increment(1) }).catch(() => {});

      return {
        id: docRef.id,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: Timestamp.now(),
        reply_count: 0,
        author_name: profile?.display_name ?? `User ${userId.slice(0, 6)}`,
        author_avatar_url: profile?.avatar_url ?? null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add comment';
      throw new ServerException(message);
    }
  }

  async addCommentReply(commentId: string, reviewId: string, userId: string, text: string): Promise<import('../models/commentModel').ReplyModel> {
    try {
      const profileSnap = await getDoc(doc(firestore, 'profiles', userId)).catch(() => null);
      const profile = profileSnap?.exists() ? profileSnap.data() as { display_name?: string; avatar_url?: string } : null;

      const docRef = await addDoc(collection(firestore, 'review_replies'), {
        comment_id: commentId,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: serverTimestamp(),
      });
      updateDoc(doc(firestore, 'review_comments', commentId), { reply_count: increment(1) }).catch(() => {});

      return {
        id: docRef.id,
        comment_id: commentId,
        review_id: reviewId,
        user_id: userId,
        text: text.trim(),
        created_at: Timestamp.now(),
        author_name: profile?.display_name ?? `User ${userId.slice(0, 6)}`,
        author_avatar_url: profile?.avatar_url ?? null,
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add reply';
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
        .map((d) => ({ id: d.id, ...d.data() } as BusinessModel))
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
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessModel));

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

  async uploadBusinessImage(businessId: string, imageUri: string, type: 'cover' | 'logo' | 'menu'): Promise<string> {
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
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        orderBy('rating', 'desc'),
        limit(500),
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

        // Also collect from category_name (used by SubCategoryBrowserScreen filter)
        const catName = data['category_name'] as string | undefined;
        if (catName && catName.trim() && catName.trim() !== catId) {
          subsByCatId[catId].add(catName.trim());
        }
      }

      return {
        categoryIds: Array.from(categoryIdSet),
        subcategoryNamesByCategoryId: Object.fromEntries(
          Object.entries(subsByCatId).map(([k, v]) => [k, Array.from(v)]),
        ),
      };
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
}
