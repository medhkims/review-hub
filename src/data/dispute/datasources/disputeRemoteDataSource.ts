import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { DisputeModel } from '../models/disputeModel';
import { ServerException } from '@/core/error/exceptions';

export interface DisputeRemoteDataSource {
  submitDispute(data: Omit<DisputeModel, 'id' | 'created_at' | 'resolved_at' | 'resolved_by_id' | 'reviewer_notified_at' | 'reviewer_response' | 'admin_notes'>): Promise<string>;
  getDisputes(status?: string): Promise<DisputeModel[]>;
  getDisputesByReview(reviewId: string): Promise<DisputeModel[]>;
  resolveDispute(disputeId: string, status: string, adminNotes: string, resolvedById: string): Promise<void>;
  removeReview(reviewId: string): Promise<void>;
}

export class DisputeRemoteDataSourceImpl implements DisputeRemoteDataSource {
  private readonly COLLECTION = 'review_disputes';
  private readonly REVIEWS = 'reviews';

  async submitDispute(
    data: Omit<DisputeModel, 'id' | 'created_at' | 'resolved_at' | 'resolved_by_id' | 'reviewer_notified_at' | 'reviewer_response' | 'admin_notes'>,
  ): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.COLLECTION), {
        ...data,
        admin_notes: null,
        created_at: serverTimestamp(),
        resolved_at: null,
        resolved_by_id: null,
        reviewer_notified_at: null,
        reviewer_response: null,
      });
      return docRef.id;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to submit dispute';
      throw new ServerException(message);
    }
  }

  async getDisputes(status?: string): Promise<DisputeModel[]> {
    try {
      const ref = collection(firestore, this.COLLECTION);
      const q = status
        ? query(ref, where('status', '==', status), orderBy('created_at', 'desc'))
        : query(ref, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DisputeModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch disputes';
      throw new ServerException(message);
    }
  }

  async getDisputesByReview(reviewId: string): Promise<DisputeModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('review_id', '==', reviewId),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DisputeModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch disputes for review';
      throw new ServerException(message);
    }
  }

  async resolveDispute(
    disputeId: string,
    status: string,
    adminNotes: string,
    resolvedById: string,
  ): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.COLLECTION, disputeId), {
        status,
        admin_notes: adminNotes,
        resolved_by_id: resolvedById,
        resolved_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to resolve dispute';
      throw new ServerException(message);
    }
  }

  async removeReview(reviewId: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.REVIEWS, reviewId), {
        status: 'removed',
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove review';
      throw new ServerException(message);
    }
  }
}
