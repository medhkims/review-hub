import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { CreateReviewModel } from '../models/reviewModel';
import { ServerException } from '@/core/error/exceptions';

export interface ReviewRemoteDataSource {
  createReview(model: CreateReviewModel): Promise<string>;
}

export class ReviewRemoteDataSourceImpl implements ReviewRemoteDataSource {
  private readonly REVIEWS = 'reviews';
  private readonly BUSINESSES = 'businesses';

  async createReview(model: CreateReviewModel): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.REVIEWS), model);

      // Update business rating aggregation
      try {
        const businessRef = doc(firestore, this.BUSINESSES, model.business_id);
        await updateDoc(businessRef, {
          review_count: increment(1),
          updated_at: serverTimestamp(),
        });
      } catch {
        // Non-critical: business aggregation update failed
        // The review is still created successfully
      }

      return docRef.id;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to create review';
      throw new ServerException(message);
    }
  }
}
