import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { firestore } from '@/core/firebase/firebaseConfig';
import { BookingConfigModel } from '../models/bookingConfigModel';
import { BookingRequestModel } from '../models/bookingRequestModel';
import { ServerException } from '@/core/error/exceptions';

export interface BookingRemoteDataSource {
  getBookingConfig(businessId: string): Promise<BookingConfigModel | null>;
  updateBookingConfig(businessId: string, data: BookingConfigModel): Promise<void>;
  createBookingRequest(data: Omit<BookingRequestModel, 'id' | 'created_at'>): Promise<BookingRequestModel>;
  getBookingRequestsForBusiness(businessId: string): Promise<BookingRequestModel[]>;
  getBookingRequestsForUser(userId: string): Promise<BookingRequestModel[]>;
  updateBookingRequestStatus(requestId: string, status: string): Promise<void>;
}

export class BookingRemoteDataSourceImpl implements BookingRemoteDataSource {
  async getBookingConfig(businessId: string): Promise<BookingConfigModel | null> {
    try {
      const configRef = doc(firestore, 'businesses', businessId, 'booking_config', 'config');
      const snapshot = await getDoc(configRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as BookingConfigModel;
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to fetch booking config');
    }
  }

  async updateBookingConfig(businessId: string, data: BookingConfigModel): Promise<void> {
    try {
      const configRef = doc(firestore, 'businesses', businessId, 'booking_config', 'config');
      await setDoc(configRef, data);
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to update booking config');
    }
  }

  async createBookingRequest(data: Omit<BookingRequestModel, 'id' | 'created_at'>): Promise<BookingRequestModel> {
    try {
      const colRef = collection(firestore, 'booking_requests');
      const docRef = await addDoc(colRef, {
        ...data,
        created_at: serverTimestamp(),
      });
      return {
        id: docRef.id,
        ...data,
        created_at: Timestamp.now(),
      };
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to create booking request');
    }
  }

  async getBookingRequestsForBusiness(businessId: string): Promise<BookingRequestModel[]> {
    try {
      const q = query(
        collection(firestore, 'booking_requests'),
        where('business_id', '==', businessId),
        orderBy('created_at', 'desc'),
        firestoreLimit(50),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRequestModel);
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to fetch booking requests');
    }
  }

  async getBookingRequestsForUser(userId: string): Promise<BookingRequestModel[]> {
    try {
      const q = query(
        collection(firestore, 'booking_requests'),
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
        firestoreLimit(50),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as BookingRequestModel);
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to fetch user bookings');
    }
  }

  async updateBookingRequestStatus(requestId: string, status: string): Promise<void> {
    try {
      const docRef = doc(firestore, 'booking_requests', requestId);
      await updateDoc(docRef, { status });
    } catch (error) {
      throw new ServerException(error instanceof Error ? error.message : 'Failed to update booking status');
    }
  }
}
