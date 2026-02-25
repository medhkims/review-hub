import { auth, firestore } from '@/core/firebase/firebaseConfig';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithRedirect,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { UserModel } from '../models/userModel';
import { UserMapper } from '../mappers/userMapper';
import { AuthException, ServerException } from '@/core/error/exceptions';
import { UserRole, DEFAULT_ROLE } from '@/core/types/userRole';

export interface AuthRemoteDataSource {
  signIn(email: string, password: string): Promise<UserModel>;
  signUp(email: string, password: string, displayName: string, role?: UserRole, phoneNumber?: string): Promise<UserModel>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserModel | null>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  signInWithGoogle(): Promise<UserModel>;
}

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  async signIn(email: string, password: string): Promise<UserModel> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return UserMapper.fromFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Sign in failed',
        firebaseError.code
      );
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole = DEFAULT_ROLE,
    phoneNumber?: string,
  ): Promise<UserModel> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });

      // Reload user to get updated profile
      await userCredential.user.reload();
      const updatedUser = auth.currentUser;

      if (!updatedUser) {
        throw new ServerException('Failed to get updated user after sign up');
      }

      // Create the profile document in Firestore
      const profileRef = doc(firestore, 'profiles', updatedUser.uid);
      await setDoc(profileRef, {
        id: updatedUser.uid,
        user_id: updatedUser.uid,
        display_name: displayName,
        email: email,
        phone_number: phoneNumber || null,
        bio: '',
        avatar_url: updatedUser.photoURL || null,
        followers_count: 0,
        following_count: 0,
        role: role,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return UserMapper.fromFirebaseUser(updatedUser);
    } catch (error: unknown) {
      if (error instanceof ServerException) {
        throw error;
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Sign up failed',
        firebaseError.code
      );
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Sign out failed',
        firebaseError.code
      );
    }
  }

  async getCurrentUser(): Promise<UserModel | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return null;
      }
      return UserMapper.fromFirebaseUser(user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to get current user';
      throw new ServerException(message);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new AuthException('No authenticated user found');
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error: unknown) {
      if (error instanceof AuthException) {
        throw error;
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Failed to change password',
        firebaseError.code
      );
    }
  }

  async signInWithGoogle(): Promise<UserModel> {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({
        prompt: 'select_account',
      });

      const result = await getRedirectResult(auth);

      if (result && result.user) {
        // Ensure profile document exists for Google sign-in users
        const profileRef = doc(firestore, 'profiles', result.user.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            id: result.user.uid,
            user_id: result.user.uid,
            display_name: result.user.displayName || 'Anonymous User',
            email: result.user.email || '',
            phone_number: result.user.phoneNumber || null,
            bio: '',
            avatar_url: result.user.photoURL || null,
            followers_count: 0,
            following_count: 0,
            role: DEFAULT_ROLE,
            created_at: serverTimestamp(),
            updated_at: serverTimestamp(),
          });
        }
        return UserMapper.fromFirebaseUser(result.user);
      }

      await signInWithRedirect(auth, googleProvider);

      throw new AuthException('Redirecting to Google...');
    } catch (error: unknown) {
      if (error instanceof AuthException) {
        if (error.message === 'Redirecting to Google...') {
          throw error;
        }
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Google sign in failed',
        firebaseError.code
      );
    }
  }
}
