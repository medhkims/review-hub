import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { FaqModel } from '../models/faqModel';
import { ServerException } from '@/core/error/exceptions';

export interface FaqRemoteDataSource {
  getFaqs(): Promise<FaqModel[]>;
  getAllFaqs(): Promise<FaqModel[]>;
  createFaq(question: string, answer: string, order: number, audience: string[]): Promise<FaqModel>;
  updateFaq(id: string, question: string, answer: string, order: number, audience: string[]): Promise<FaqModel>;
  deleteFaq(id: string): Promise<void>;
}

export class FaqRemoteDataSourceImpl implements FaqRemoteDataSource {
  private readonly COLLECTION = 'faqs';

  async getFaqs(): Promise<FaqModel[]> {
    try {
      const q = query(collection(firestore, this.COLLECTION), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs
        .map((d) => ({ id: d.id, ...d.data() } as FaqModel))
        .filter((f) => f.is_active);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch FAQs';
      throw new ServerException(msg);
    }
  }

  async getAllFaqs(): Promise<FaqModel[]> {
    try {
      const q = query(collection(firestore, this.COLLECTION), orderBy('order', 'asc'));
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as FaqModel));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch all FAQs';
      throw new ServerException(msg);
    }
  }

  async createFaq(question: string, answer: string, order: number, audience: string[]): Promise<FaqModel> {
    try {
      const now = serverTimestamp();
      const payload = {
        question,
        answer,
        order,
        audience,
        is_active: true,
        created_at: now,
        updated_at: now,
      };
      const ref = await addDoc(collection(firestore, this.COLLECTION), payload);
      const clientNow = Timestamp.now();
      return {
        id: ref.id,
        question,
        answer,
        order,
        audience,
        is_active: true,
        created_at: clientNow,
        updated_at: clientNow,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to create FAQ';
      throw new ServerException(msg);
    }
  }

  async updateFaq(id: string, question: string, answer: string, order: number, audience: string[]): Promise<FaqModel> {
    try {
      const ref = doc(firestore, this.COLLECTION, id);
      const now = serverTimestamp();
      await updateDoc(ref, { question, answer, order, audience, updated_at: now });
      const clientNow = Timestamp.now();
      return {
        id,
        question,
        answer,
        order,
        audience,
        is_active: true,
        created_at: clientNow,
        updated_at: clientNow,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update FAQ';
      throw new ServerException(msg);
    }
  }

  async deleteFaq(id: string): Promise<void> {
    try {
      await deleteDoc(doc(firestore, this.COLLECTION, id));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to delete FAQ';
      throw new ServerException(msg);
    }
  }
}
