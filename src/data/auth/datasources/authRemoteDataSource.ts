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
  signInWithCredential,
  signInWithPopup,
} from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
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
    if (Platform.OS === 'web') {
      return this._signInWithGoogleWeb();
    }
    return this._signInWithGoogleNative();
  }

  private async _signInWithGoogleWeb(): Promise<UserModel> {
    try {
      const googleProvider = new GoogleAuthProvider();
      googleProvider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, googleProvider);
      return this._ensureProfileAndReturn(result.user);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Google sign in failed',
        firebaseError.code
      );
    }
  }

  private async _signInWithGoogleNative(): Promise<UserModel> {
    try {
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }

      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        throw new AuthException('Google sign in was cancelled');
      }

      const idToken = response.data?.idToken;
      if (!idToken) {
        throw new AuthException('No ID token received from Google');
      }

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      return this._ensureProfileAndReturn(result.user);
    } catch (error: unknown) {
      if (error instanceof AuthException) {
        throw error;
      }
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          throw new AuthException('Google sign in was cancelled');
        } else if (error.code === statusCodes.IN_PROGRESS) {
          throw new AuthException('Google sign in is already in progress');
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new AuthException('Google Play Services not available');
        }
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(
        firebaseError.message || 'Google sign in failed',
        firebaseError.code
      );
    }
  }

  private async _ensureProfileAndReturn(user: FirebaseUser): Promise<UserModel> {
    const profileRef = doc(firestore, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);
    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: user.uid,
        user_id: user.uid,
        display_name: user.displayName || 'Anonymous User',
        email: user.email || '',
        phone_number: user.phoneNumber || null,
        bio: '',
        avatar_url: user.photoURL || null,
        followers_count: 0,
        following_count: 0,
        role: DEFAULT_ROLE,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });
    }
    return UserMapper.fromFirebaseUser(user);
  }
}
