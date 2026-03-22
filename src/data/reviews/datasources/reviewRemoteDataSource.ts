import { firestore, auth } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { CreateReviewModel, UserReviewModel } from '../models/reviewModel';
import { ServerException } from '@/core/error/exceptions';
import { CATEGORY_MAP } from '@/core/constants/categoriesData';

export interface ReviewRemoteDataSource {
  createReview(model: CreateReviewModel): Promise<string>;
  getUserReviews(userId: string): Promise<UserReviewModel[]>;
  deleteReview(reviewId: string): Promise<void>;
  getPendingReviews(): Promise<UserReviewModel[]>;
  getApprovedReviews(): Promise<UserReviewModel[]>;
  getRejectedReviews(): Promise<UserReviewModel[]>;
  approveReview(reviewId: string): Promise<void>;
  rejectReview(reviewId: string): Promise<void>;
}

export class ReviewRemoteDataSourceImpl implements ReviewRemoteDataSource {
  private readonly REVIEWS = 'reviews';
  private readonly BUSINESSES = 'businesses';

  async createReview(model: CreateReviewModel): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.REVIEWS), model);

      // Only update business rating aggregation for approved (posted) reviews.
      // Pending reviews are not yet visible and must not affect the public rating.
      if (model.status !== 'pending') try {
        const businessRef = doc(firestore, this.BUSINESSES, model.business_id);
        const businessSnap = await getDoc(businessRef);

        if (businessSnap.exists()) {
          const data = businessSnap.data();
          const oldCount: number = typeof data['review_count'] === 'number' ? data['review_count'] : 0;
          const oldRating: number = typeof data['rating'] === 'number' ? data['rating'] : 0;
          const newCount = oldCount + 1;

          // Recalculate overall rating
          const newRating = parseFloat(((oldRating * oldCount + model.overall_rating) / newCount).toFixed(1));

          // Recalculate rating distribution
          const existingDist: Array<{ stars: number; percentage: number }> = Array.isArray(data['rating_distribution']) ? data['rating_distribution'] : [];
          const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          for (const entry of existingDist) {
            starCounts[entry.stars] = Math.round((entry.percentage / 100) * oldCount);
          }
          const roundedStar = Math.min(5, Math.max(1, Math.round(model.overall_rating)));
          starCounts[roundedStar] = (starCounts[roundedStar] ?? 0) + 1;
          const newDist = [5, 4, 3, 2, 1].map((s) => ({
            stars: s,
            percentage: parseFloat(((starCounts[s] / newCount) * 100).toFixed(1)),
          }));

          // Recalculate per-category ratings
          const existingCatRatings: Array<{ name: string; icon: string; rating: number }> =
            Array.isArray(data['category_ratings']) ? data['category_ratings'] : [];

          let newCatRatings: Array<{ name: string; icon: string; rating: number }>;
          if (existingCatRatings.length > 0) {
            // Update existing category ratings with weighted average
            newCatRatings = existingCatRatings.map((cat) => {
              const catKey = Object.keys(model.ratings).find(
                (k) => k.toLowerCase() === cat.name.toLowerCase(),
              );
              if (catKey !== undefined) {
                return {
                  ...cat,
                  rating: parseFloat(((cat.rating * oldCount + model.ratings[catKey]) / newCount).toFixed(1)),
                };
              }
              return cat;
            });
          } else {
            // New business — initialize category_ratings from the category definition
            const categoryId = data['category_id'] as string | undefined;
            const criteria = categoryId ? (CATEGORY_MAP[categoryId]?.ratingCriteria ?? []) : [];
            newCatRatings = criteria.map((criterion) => ({
              name: criterion.label,
              icon: criterion.icon,
              rating: model.ratings[criterion.key] ?? 0,
            }));
          }

          await updateDoc(businessRef, {
            review_count: newCount,
            rating: newRating,
            rating_distribution: newDist,
            category_ratings: newCatRatings,
            updated_at: serverTimestamp(),
          });
        } else {
          await updateDoc(businessRef, { updated_at: serverTimestamp() });
        }
      } catch {
        // Non-critical: business aggregation update failed
      }

      return docRef.id;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to create review';
      throw new ServerException(message);
    }
  }

  async getUserReviews(userId: string): Promise<UserReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('user_id', '==', userId),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserReviewModel));
      // Sort newest first in memory — avoids requiring a composite Firestore index
      models.sort((a, b) => {
        const aMs = a.created_at?.seconds ?? 0;
        const bMs = b.created_at?.seconds ?? 0;
        return bMs - aMs;
      });

      // Enrich with like status for the current user (doc ID is deterministic: `${uid}_${reviewId}`)
      const currentUid = auth.currentUser?.uid;
      if (currentUid && models.length > 0) {
        const likeChecks = await Promise.all(
          models.map((m) => getDoc(doc(firestore, 'review_likes', `${currentUid}_${m.id}`))),
        );
        likeChecks.forEach((snap, i) => {
          models[i].is_liked_by_current_user = snap.exists();
        });
      }

      return models;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
      throw new ServerException(message);
    }
  }

  async deleteReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(firestore, this.REVIEWS, reviewId);
      const reviewSnap = await getDoc(reviewRef);

      // Fetch review data before soft-deleting so we can reverse the aggregation
      const reviewData = reviewSnap.exists() ? reviewSnap.data() : null;

      // Soft delete: mark as 'removed' so the user can see their review history
      await updateDoc(reviewRef, { status: 'removed', updated_at: serverTimestamp() });

      if (!reviewData) return;

      // Only reverse aggregation if the review was posted (counted in the rating).
      // Pending/removed reviews were never included, so nothing to reverse.
      if (reviewData['status'] !== 'posted') return;

      try {
        const businessRef = doc(firestore, this.BUSINESSES, reviewData['business_id'] as string);
        const businessSnap = await getDoc(businessRef);

        if (businessSnap.exists()) {
          const data = businessSnap.data();
          const oldCount: number = typeof data['review_count'] === 'number' ? data['review_count'] : 0;
          const oldRating: number = typeof data['rating'] === 'number' ? data['rating'] : 0;
          const deletedRating: number = typeof reviewData['overall_rating'] === 'number' ? reviewData['overall_rating'] : 0;
          const deletedRatings: Record<string, number> = typeof reviewData['ratings'] === 'object' && reviewData['ratings'] !== null ? reviewData['ratings'] as Record<string, number> : {};
          const newCount = Math.max(0, oldCount - 1);

          if (newCount === 0) {
            // No reviews left — reset everything
            const existingDist: Array<{ stars: number; percentage: number }> = Array.isArray(data['rating_distribution']) ? data['rating_distribution'] : [];
            const zeroDist = existingDist.map((e) => ({ ...e, percentage: 0 }));
            const existingCatRatings: Array<{ name: string; icon: string; rating: number }> = Array.isArray(data['category_ratings']) ? data['category_ratings'] : [];
            const zeroCatRatings = existingCatRatings.map((c) => ({ ...c, rating: 0 }));

            await updateDoc(businessRef, {
              review_count: 0,
              rating: 0,
              rating_distribution: zeroDist,
              category_ratings: zeroCatRatings,
              updated_at: serverTimestamp(),
            });
          } else {
            const newRating = parseFloat(((oldRating * oldCount - deletedRating) / newCount).toFixed(1));

            // Recalculate rating distribution
            const existingDist: Array<{ stars: number; percentage: number }> = Array.isArray(data['rating_distribution']) ? data['rating_distribution'] : [];
            const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            for (const entry of existingDist) {
              starCounts[entry.stars] = Math.round((entry.percentage / 100) * oldCount);
            }
            const roundedStar = Math.min(5, Math.max(1, Math.round(deletedRating)));
            starCounts[roundedStar] = Math.max(0, (starCounts[roundedStar] ?? 0) - 1);
            const newDist = [5, 4, 3, 2, 1].map((s) => ({
              stars: s,
              percentage: parseFloat(((starCounts[s] / newCount) * 100).toFixed(1)),
            }));

            // Recalculate per-category ratings
            const existingCatRatings: Array<{ name: string; icon: string; rating: number }> = Array.isArray(data['category_ratings']) ? data['category_ratings'] : [];
            const newCatRatings = existingCatRatings.map((cat) => {
              const catKey = Object.keys(deletedRatings).find(
                (k) => k.toLowerCase() === cat.name.toLowerCase(),
              );
              if (catKey !== undefined) {
                return {
                  ...cat,
                  rating: parseFloat(((cat.rating * oldCount - deletedRatings[catKey]) / newCount).toFixed(1)),
                };
              }
              return cat;
            });

            await updateDoc(businessRef, {
              review_count: newCount,
              rating: newRating,
              rating_distribution: newDist,
              category_ratings: newCatRatings,
              updated_at: serverTimestamp(),
            });
          }
        }
      } catch {
        // Non-critical: business aggregation update failed
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to delete review';
      throw new ServerException(message);
    }
  }

  async getPendingReviews(): Promise<UserReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('status', '==', 'pending'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserReviewModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch pending reviews';
      throw new ServerException(message);
    }
  }

  async getApprovedReviews(): Promise<UserReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('status', '==', 'posted'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserReviewModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch approved reviews';
      throw new ServerException(message);
    }
  }

  async getRejectedReviews(): Promise<UserReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.REVIEWS),
        where('status', '==', 'removed'),
      );
      const snapshot = await getDocs(q);
      const models = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as UserReviewModel));
      return models.sort((a, b) => (b.created_at?.seconds ?? 0) - (a.created_at?.seconds ?? 0));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch rejected reviews';
      throw new ServerException(message);
    }
  }

  async approveReview(reviewId: string): Promise<void> {
    try {
      const reviewRef = doc(firestore, this.REVIEWS, reviewId);
      const reviewSnap = await getDoc(reviewRef);
      if (!reviewSnap.exists()) throw new ServerException('Review not found');

      const reviewData = reviewSnap.data() as UserReviewModel & Record<string, unknown>;

      // Mark as posted
      await updateDoc(reviewRef, { status: 'posted', updated_at: serverTimestamp() });

      // Now trigger business aggregation (same as createReview for posted reviews)
      try {
        const businessRef = doc(firestore, this.BUSINESSES, reviewData['business_id'] as string);
        const businessSnap = await getDoc(businessRef);

        if (businessSnap.exists()) {
          const data = businessSnap.data();
          const oldCount: number = typeof data['review_count'] === 'number' ? data['review_count'] : 0;
          const oldRating: number = typeof data['rating'] === 'number' ? data['rating'] : 0;
          const overallRating: number = typeof reviewData['overall_rating'] === 'number' ? reviewData['overall_rating'] : 0;
          const ratings: Record<string, number> = (typeof reviewData['ratings'] === 'object' && reviewData['ratings'] !== null) ? reviewData['ratings'] as Record<string, number> : {};
          const newCount = oldCount + 1;

          const newRating = parseFloat(((oldRating * oldCount + overallRating) / newCount).toFixed(1));

          const existingDist: Array<{ stars: number; percentage: number }> = Array.isArray(data['rating_distribution']) ? data['rating_distribution'] : [];
          const starCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          for (const entry of existingDist) {
            starCounts[entry.stars] = Math.round((entry.percentage / 100) * oldCount);
          }
          const roundedStar = Math.min(5, Math.max(1, Math.round(overallRating)));
          starCounts[roundedStar] = (starCounts[roundedStar] ?? 0) + 1;
          const newDist = [5, 4, 3, 2, 1].map((s) => ({
            stars: s,
            percentage: parseFloat(((starCounts[s] / newCount) * 100).toFixed(1)),
          }));

          const existingCatRatings: Array<{ name: string; icon: string; rating: number }> = Array.isArray(data['category_ratings']) ? data['category_ratings'] : [];
          let newCatRatings: Array<{ name: string; icon: string; rating: number }>;
          if (existingCatRatings.length > 0) {
            newCatRatings = existingCatRatings.map((cat) => {
              const catKey = Object.keys(ratings).find((k) => k.toLowerCase() === cat.name.toLowerCase());
              if (catKey !== undefined) {
                return { ...cat, rating: parseFloat(((cat.rating * oldCount + ratings[catKey]) / newCount).toFixed(1)) };
              }
              return cat;
            });
          } else {
            const categoryId = data['category_id'] as string | undefined;
            const criteria = categoryId ? (CATEGORY_MAP[categoryId]?.ratingCriteria ?? []) : [];
            newCatRatings = criteria.map((criterion) => ({
              name: criterion.label,
              icon: criterion.icon,
              rating: ratings[criterion.key] ?? 0,
            }));
          }

          await updateDoc(businessRef, {
            review_count: newCount,
            rating: newRating,
            rating_distribution: newDist,
            category_ratings: newCatRatings,
            updated_at: serverTimestamp(),
          });
        }
      } catch {
        // Non-critical: aggregation update failed
      }
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to approve review';
      throw new ServerException(message);
    }
  }

  async rejectReview(reviewId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.REVIEWS, reviewId), {
        status: 'removed',
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to reject review';
      throw new ServerException(message);
    }
  }
}
