import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { AnnouncementModel } from '../models/announcementModel';
import { ServerException } from '@/core/error/exceptions';

export interface AnnouncementRemoteDataSource {
  getAnnouncements(businessId: string): Promise<AnnouncementModel[]>;
  createAnnouncement(businessId: string, data: {
    title: string;
    description: string;
    image_url?: string | null;
    valid_until?: Date | null;
  }): Promise<AnnouncementModel>;
  updateAnnouncement(businessId: string, announcementId: string, data: Record<string, unknown>): Promise<void>;
  deleteAnnouncement(businessId: string, announcementId: string): Promise<void>;
}

export class AnnouncementRemoteDataSourceImpl implements AnnouncementRemoteDataSource {
  private getCollection(businessId: string) {
    return collection(firestore, 'businesses', businessId, 'announcements');
  }

  async getAnnouncements(businessId: string): Promise<AnnouncementModel[]> {
    try {
      const q = query(this.getCollection(businessId), orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AnnouncementModel[];
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to fetch announcements');
    }
  }

  async createAnnouncement(businessId: string, data: {
    title: string;
    description: string;
    image_url?: string | null;
    valid_until?: Date | null;
  }): Promise<AnnouncementModel> {
    try {
      const docData = {
        title: data.title,
        description: data.description,
        image_url: data.image_url ?? null,
        valid_until: data.valid_until ? Timestamp.fromDate(data.valid_until) : null,
        created_at: serverTimestamp(),
      };
      const ref = await addDoc(this.getCollection(businessId), docData);
      return {
        id: ref.id,
        title: data.title,
        description: data.description,
        image_url: data.image_url ?? null,
        valid_until: data.valid_until ? Timestamp.fromDate(data.valid_until) : null,
        created_at: Timestamp.now(),
      };
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to create announcement');
    }
  }

  async updateAnnouncement(businessId: string, announcementId: string, data: Record<string, unknown>): Promise<void> {
    try {
      const docRef = doc(firestore, 'businesses', businessId, 'announcements', announcementId);
      await updateDoc(docRef, data);
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to update announcement');
    }
  }

  async deleteAnnouncement(businessId: string, announcementId: string): Promise<void> {
    try {
      const docRef = doc(firestore, 'businesses', businessId, 'announcements', announcementId);
      await deleteDoc(docRef);
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to delete announcement');
    }
  }
}
