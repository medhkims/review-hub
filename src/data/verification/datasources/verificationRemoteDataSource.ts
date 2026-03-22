import { firestore, storage } from '@/core/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Platform } from 'react-native';
import { VerificationModel } from '../models/verificationModel';
import { ServerException } from '@/core/error/exceptions';

export interface VerificationRemoteDataSource {
  submitVerification(
    userId: string,
    userEmail: string,
    userName: string,
    fullName: string,
    phoneNumber: string,
    idCardUrl: string,
  ): Promise<VerificationModel>;
  getUserVerification(userId: string): Promise<VerificationModel | null>;
  getPendingVerifications(): Promise<VerificationModel[]>;
  getVerificationsByStatus(status: string): Promise<VerificationModel[]>;
  updateVerificationStatus(
    id: string,
    status: string,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<void>;
  uploadIdCard(userId: string, imageUri: string, mimeType?: string): Promise<string>;
  sendOtp(phoneNumber: string): Promise<void>;
  verifyOtp(phoneNumber: string, code: string): Promise<void>;
}

export class VerificationRemoteDataSourceImpl implements VerificationRemoteDataSource {
  private readonly COLLECTION = 'verification_requests';
  private readonly STORAGE_PATH = 'id_cards';

  async submitVerification(
    userId: string,
    userEmail: string,
    userName: string,
    fullName: string,
    phoneNumber: string,
    idCardUrl: string,
  ): Promise<VerificationModel> {
    try {
      const now = serverTimestamp();
      const payload = {
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        full_name: fullName,
        phone_number: phoneNumber,
        id_card_url: idCardUrl,
        status: 'pending',
        submitted_at: now,
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      };
      const docRef = await addDoc(collection(firestore, this.COLLECTION), payload);
      const clientNow = new Date();
      return {
        id: docRef.id,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        full_name: fullName,
        phone_number: phoneNumber,
        id_card_url: idCardUrl,
        status: 'pending',
        submitted_at: { toDate: () => clientNow } as unknown as Timestamp,
        reviewed_at: null,
        reviewed_by: null,
        rejection_reason: null,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to submit verification';
      throw new ServerException(msg);
    }
  }

  async getUserVerification(userId: string): Promise<VerificationModel | null> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('user_id', '==', userId),
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      // Return the most recent one
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationModel));
      docs.sort((a, b) => {
        const aTime = a.submitted_at instanceof Timestamp ? a.submitted_at.toMillis() : 0;
        const bTime = b.submitted_at instanceof Timestamp ? b.submitted_at.toMillis() : 0;
        return bTime - aTime;
      });
      return docs[0];
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch verification';
      throw new ServerException(msg);
    }
  }

  async getPendingVerifications(): Promise<VerificationModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('status', '==', 'pending'),
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationModel));
      items.sort((a, b) => {
        const aTime = a.submitted_at instanceof Timestamp ? a.submitted_at.toMillis() : 0;
        const bTime = b.submitted_at instanceof Timestamp ? b.submitted_at.toMillis() : 0;
        return bTime - aTime;
      });
      return items;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch pending verifications';
      throw new ServerException(msg);
    }
  }

  async getVerificationsByStatus(status: string): Promise<VerificationModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        where('status', '==', status),
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as VerificationModel));
      items.sort((a, b) => {
        const aTime = a.submitted_at instanceof Timestamp ? a.submitted_at.toMillis() : 0;
        const bTime = b.submitted_at instanceof Timestamp ? b.submitted_at.toMillis() : 0;
        return bTime - aTime;
      });
      return items;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch verifications';
      throw new ServerException(msg);
    }
  }

  async updateVerificationStatus(
    id: string,
    status: string,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<void> {
    try {
      const docRef = doc(firestore, this.COLLECTION, id);
      await updateDoc(docRef, {
        status,
        reviewed_by: reviewedBy,
        reviewed_at: serverTimestamp(),
        rejection_reason: rejectionReason ?? null,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to update verification status';
      throw new ServerException(msg);
    }
  }

  async uploadIdCard(userId: string, imageUri: string, mimeType?: string): Promise<string> {
    try {
      let uploadData: Uint8Array | Blob;
      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        if (!response.ok) throw new ServerException('Failed to read ID card file');
        uploadData = await response.blob();
      } else {
        const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response as ArrayBuffer);
          xhr.onerror = () => reject(new ServerException('Failed to read ID card file'));
          xhr.responseType = 'arraybuffer';
          xhr.open('GET', imageUri, true);
          xhr.send(null);
        });
        uploadData = new Uint8Array(arrayBuffer);
      }

      const contentType = mimeType || 'image/jpeg';
      const extension = contentType.split('/')[1] || 'jpg';
      const filename = `id_card_${Date.now()}.${extension}`;
      const storagePath = `${this.STORAGE_PATH}/${userId}/${filename}`;
      const storageRef = ref(storage, storagePath);

      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, uploadData, { contentType });
        const timeoutId = setTimeout(() => {
          uploadTask.cancel();
          reject(new ServerException('Upload timed out. Please check your connection and try again.'));
        }, 60000);

        uploadTask.on(
          'state_changed',
          () => clearTimeout(timeoutId),
          (error) => {
            clearTimeout(timeoutId);
            reject(new ServerException(error.message || 'Upload failed'));
          },
          async () => {
            clearTimeout(timeoutId);
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
      throw new ServerException(e.message || 'Failed to upload ID card');
    }
  }

  async sendOtp(phoneNumber: string): Promise<void> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000));
      // Key by sanitised phone so it's easy to look up
      const key = phoneNumber.replace(/[^0-9]/g, '');
      await setDoc(doc(firestore, 'verification_otps', key), {
        phone: phoneNumber,
        code,
        expires_at: expiresAt,
        created_at: serverTimestamp(),
      });
      // In production a Firestore trigger / Cloud Function sends the SMS.
      // For development the code is readable in the Firebase console.
    } catch (error: unknown) {
      const raw = error instanceof Error ? error.message : '';
      const msg = raw.includes('permission') || raw.includes('PERMISSION')
        ? 'Permission denied. Please try again or contact support.'
        : raw && !raw.toLowerCase().startsWith('internal')
          ? raw
          : 'Failed to send verification code. Please try again.';
      throw new ServerException(msg);
    }
  }

  async verifyOtp(phoneNumber: string, code: string): Promise<void> {
    try {
      const key = phoneNumber.replace(/[^0-9]/g, '');
      const snap = await getDoc(doc(firestore, 'verification_otps', key));
      if (!snap.exists()) {
        throw new ServerException('OTP not found. Please request a new code.');
      }
      const data = snap.data();
      const expiresAt: Date = data.expires_at?.toDate?.() ?? new Date(0);
      if (new Date() > expiresAt) {
        throw new ServerException('OTP has expired. Please request a new code.');
      }
      if (data.code !== code) {
        throw new ServerException('Invalid OTP code. Please try again.');
      }
      await deleteDoc(doc(firestore, 'verification_otps', key));
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const msg = error instanceof Error ? error.message : 'Failed to verify OTP';
      throw new ServerException(msg);
    }
  }
}
