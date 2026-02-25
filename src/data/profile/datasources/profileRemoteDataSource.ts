import { firestore, auth } from '@/core/firebase/firebaseConfig';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateEmail as firebaseUpdateEmail } from 'firebase/auth';
import { ProfileModel } from '../models/profileModel';
import { ServerException, AuthException } from '@/core/error/exceptions';

export interface ProfileRemoteDataSource {
  getProfile(userId: string): Promise<ProfileModel>;
  updateProfile(userId: string, updates: Partial<ProfileModel>): Promise<ProfileModel>;
  updateEmail(userId: string, newEmail: string): Promise<void>;
}

export class ProfileRemoteDataSourceImpl implements ProfileRemoteDataSource {
  private readonly COLLECTION = 'profiles';

  async getProfile(userId: string): Promise<ProfileModel> {
    try {
      const profileRef = doc(firestore, this.COLLECTION, userId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        throw new ServerException(`Profile not found for user: ${userId}`, 'profile/not-found');
      }

      return { id: profileSnap.id, ...profileSnap.data() } as ProfileModel;
    } catch (error: any) {
      if (error instanceof ServerException) throw error;
      throw new ServerException(error.message || 'Failed to fetch profile', error.code);
    }
  }

  async updateProfile(userId: string, updates: Partial<ProfileModel>): Promise<ProfileModel> {
    try {
      const profileRef = doc(firestore, this.COLLECTION, userId);

      // Add updated_at timestamp
      const updateData = {
        ...updates,
        updated_at: serverTimestamp(),
      };

      await updateDoc(profileRef, updateData);

      // Fetch and return the updated profile
      return this.getProfile(userId);
    } catch (error: any) {
      throw new ServerException(error.message || 'Failed to update profile', error.code);
    }
  }

  async updateEmail(userId: string, newEmail: string): Promise<void> {
    try {
      const currentUser = auth.currentUser;

      if (!currentUser || currentUser.uid !== userId) {
        throw new AuthException('User not authenticated or user ID mismatch', 'auth/unauthorized');
      }

      // Update Firebase Auth email
      await firebaseUpdateEmail(currentUser, newEmail);

      // Update Firestore profile email
      const profileRef = doc(firestore, this.COLLECTION, userId);
      await updateDoc(profileRef, {
        email: newEmail,
        updated_at: serverTimestamp(),
      });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        throw new AuthException('Please re-authenticate to change your email', error.code);
      }
      throw new AuthException(error.message || 'Failed to update email', error.code);
    }
  }
}
