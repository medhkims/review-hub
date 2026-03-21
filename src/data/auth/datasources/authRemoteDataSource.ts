import { auth, firestore, functions } from '@/core/firebase/firebaseConfig';
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
  onAuthStateChanged,
} from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { GoogleSignin, isSuccessResponse, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { Platform } from 'react-native';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { UserModel } from '../models/userModel';
import { UserMapper } from '../mappers/userMapper';
import { AuthException, ServerException } from '@/core/error/exceptions';
import { UserRole, DEFAULT_ROLE } from '@/core/types/userRole';

export interface AuthRemoteDataSource {
  signIn(email: string, password: string): Promise<UserModel>;
  signUp(email: string, password: string, displayName: string, role?: UserRole, phoneNumber?: string, gender?: 'male' | 'female', birthday?: Date): Promise<UserModel>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<UserModel | null>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  signInWithGoogle(loginHint?: string): Promise<UserModel>;
  sendPhoneOtp(phone: string): Promise<void>;
  verifyPhoneOtp(businessId: string, code: string): Promise<void>;
}

function friendlyAuthError(code: string | undefined): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/unauthorized-domain':
      return 'This domain is not authorized for Google sign-in. Please contact support.';
    case 'auth/operation-not-allowed':
      return 'Google sign-in is not enabled. Please contact support.';
    default:
      return `Sign-in failed (${code ?? 'unknown'}). Please try again.`;
  }
}

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  async signIn(email: string, password: string): Promise<UserModel> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return UserMapper.fromFirebaseUser(userCredential.user);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
    }
  }

  async signUp(
    email: string,
    password: string,
    displayName: string,
    role: UserRole = DEFAULT_ROLE,
    phoneNumber?: string,
    gender?: 'male' | 'female',
    birthday?: Date,
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
      try {
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
          gender: gender || null,
          birthday: birthday ? Timestamp.fromDate(birthday) : null,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      } catch (firestoreError: unknown) {
        const fe = firestoreError as { code?: string };
        if (fe.code === 'permission-denied') {
          throw new ServerException(
            'Profile creation was denied. Please verify your information and try again.',
          );
        }
        throw new ServerException('Failed to create your profile. Please try again.');
      }

      return UserMapper.fromFirebaseUser(updatedUser);
    } catch (error: unknown) {
      if (error instanceof ServerException) {
        throw error;
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
    }
  }

  async getCurrentUser(): Promise<UserModel | null> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          unsubscribe();
          if (user) {
            resolve(UserMapper.fromFirebaseUser(user));
          } else {
            resolve(null);
          }
        },
        (error) => {
          unsubscribe();
          reject(new ServerException(error.message));
        },
      );
    });
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
      throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
    }
  }

  async signInWithGoogle(loginHint?: string): Promise<UserModel> {
    if (Platform.OS === 'web') {
      return this._signInWithGoogleWeb(loginHint);
    }
    return this._signInWithGoogleNative();
  }

  private async _signInWithGoogleWeb(loginHint?: string): Promise<UserModel> {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters(
      loginHint ? { login_hint: loginHint } : { prompt: 'select_account' },
    );

    // React Native Web attaches __reactFiber$... props to every DOM node, creating circular
    // references. Firebase auth calls JSON.stringify internally when opening the popup, which
    // throws on those refs. Patch JSON.stringify to skip circular values for the duration.
    const _origStringify = JSON.stringify;
    // @ts-expect-error: intentional temporary global patch for RN Web circular fiber refs
    JSON.stringify = (value: unknown, _rep?: unknown, space?: unknown) => {
      const seen = new WeakSet<object>();
      return _origStringify.call(JSON, value, (_key: string, val: unknown) => {
        if (val !== null && typeof val === 'object') {
          if (seen.has(val as object)) return undefined;
          seen.add(val as object);
        }
        return val;
      }, space as string | number | undefined);
    };

    try {
      const result = await signInWithPopup(auth, googleProvider);
      return this._ensureProfileAndReturn(result.user);
    } catch (error: unknown) {
      const firebaseError = error as { message?: string; code?: string };

      if (firebaseError.code) {
        throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
      }

      // popup.close() may throw a non-Firebase error after auth succeeds (COOP/Expo Router).
      // Wait up to 4s for onAuthStateChanged to confirm the user is signed in.
      const signedInUser = await new Promise<FirebaseUser | null>((resolve) => {
        if (auth.currentUser) { resolve(auth.currentUser); return; }
        const timer = setTimeout(() => { unsubscribe(); resolve(null); }, 4000);
        const unsubscribe = onAuthStateChanged(auth, (u) => {
          if (u) { clearTimeout(timer); unsubscribe(); resolve(u); }
        });
      });

      if (signedInUser) {
        return this._ensureProfileAndReturn(signedInUser);
      }

      throw new AuthException(
        firebaseError.message ?? 'Google sign-in failed. Please try again.',
      );
    } finally {
      JSON.stringify = _origStringify;
    }
  }

  private async _signInWithGoogleNative(): Promise<UserModel> {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

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
      if (error instanceof AuthException) throw error;
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            throw new AuthException('Google sign in was cancelled');
          case statusCodes.IN_PROGRESS:
            throw new AuthException('Google sign in is already in progress');
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new AuthException('Google Play Services not available');
        }
      }
      const firebaseError = error as { message?: string; code?: string };
      throw new AuthException(friendlyAuthError(firebaseError.code), firebaseError.code);
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

  async sendPhoneOtp(phone: string): Promise<void> {
    try {
      const sendOtp = httpsCallable<{ phone: string }, { success: boolean }>(functions, 'sendPhoneOtp');
      await sendOtp({ phone });
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'functions/not-found' || err.code === 'functions/unimplemented') {
        throw new ServerException('SMS service is not yet configured. Please contact support.');
      }
      throw new ServerException(err.message ?? 'Failed to send verification code. Please try again.');
    }
  }

  async verifyPhoneOtp(businessId: string, code: string): Promise<void> {
    try {
      const verifyOtp = httpsCallable<{ businessId: string; code: string }, { verified: boolean }>(functions, 'verifyPhoneOtp');
      const result = await verifyOtp({ businessId, code });
      if (!result.data.verified) {
        throw new ServerException('Invalid or expired code. Please try again.');
      }
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const err = error as { code?: string; message?: string };
      if (err.code === 'functions/not-found' || err.code === 'functions/unimplemented') {
        throw new ServerException('SMS service is not yet configured. Please contact support.');
      }
      if (err.code === 'functions/invalid-argument') {
        throw new ServerException('Invalid or expired code. Please try again.');
      }
      throw new ServerException(err.message ?? 'Verification failed. Please try again.');
    }
  }
}
