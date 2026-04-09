import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  persistentSingleTabManager,
} from 'firebase/firestore';
import {
  initializeAuth,
  getAuth,
} from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
import * as _firebaseAuth from 'firebase/auth';
// getReactNativePersistence is in the Metro-bundled RN build of firebase/auth but absent
// from the main TypeScript declarations. Access it via the module namespace.
const getReactNativePersistence = (
  _firebaseAuth as unknown as { getReactNativePersistence: (s: object) => Persistence }
).getReactNativePersistence;
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getRemoteConfig } from 'firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebase?.apiKey || process.env.FIREBASE_API_KEY || '',
  authDomain: isWeb
    ? `${Constants.expoConfig?.extra?.firebase?.projectId || process.env.FIREBASE_PROJECT_ID || ''}.firebaseapp.com`
    : Constants.expoConfig?.extra?.firebase?.authDomain || process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: Constants.expoConfig?.extra?.firebase?.projectId || process.env.FIREBASE_PROJECT_ID || '',
  storageBucket: Constants.expoConfig?.extra?.firebase?.storageBucket || process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: Constants.expoConfig?.extra?.firebase?.messagingSenderId || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: Constants.expoConfig?.extra?.firebase?.appId || process.env.FIREBASE_APP_ID || '',
  measurementId: Constants.expoConfig?.extra?.firebase?.measurementId || process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firestore with offline persistence
// Web uses single-tab manager to avoid IndexedDB primary lease conflicts
export const firestore = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: isWeb ? persistentSingleTabManager({}) : persistentMultipleTabManager(),
  }),
});

// Initialize Auth — getAuth on web (includes popup resolver automatically),
// initializeAuth on native (sets AsyncStorage persistence for offline support)
export const auth = isWeb
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

// Initialize Storage
export const storage = getStorage(app);

// Initialize Cloud Functions
export const functions = getFunctions(app);

// Initialize Remote Config
export const remoteConfig = getRemoteConfig(app);

export default app;
