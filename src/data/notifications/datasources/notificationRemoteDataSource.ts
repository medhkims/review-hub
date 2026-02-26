import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { NotificationModel } from '../models/notificationModel';
import { ServerException } from '@/core/error/exceptions';

export interface NotificationRemoteDataSource {
  getNotifications(userId: string): Promise<NotificationModel[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}

export class NotificationRemoteDataSourceImpl implements NotificationRemoteDataSource {
  async getNotifications(userId: string): Promise<NotificationModel[]> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as NotificationModel,
      );
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to fetch notifications',
        err.code,
      );
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(firestore, 'notifications', notificationId);
      await updateDoc(notificationRef, { is_read: true });
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to mark notification as read',
        err.code,
      );
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        where('is_read', '==', false),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      const batch = writeBatch(firestore);
      snapshot.docs.forEach((d) => {
        batch.update(d.ref, { is_read: true });
      });
      await batch.commit();
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to mark all notifications as read',
        err.code,
      );
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const q = query(
        notificationsRef,
        where('user_id', '==', userId),
        where('is_read', '==', false),
      );
      const snapshot = await getDocs(q);

      return snapshot.size;
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to get unread count',
        err.code,
      );
    }
  }
}
