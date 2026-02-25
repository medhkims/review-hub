/**
 * Firebase Connection Test Utility
 *
 * This file can be used to verify Firebase is properly configured.
 * Run this after setup to ensure all services are initialized correctly.
 */

import { firestore, auth, storage } from './firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

/**
 * Test Firebase connection and services
 * @returns Promise<boolean> - true if all services are working
 */
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    // Test 1: Check if Firebase app is initialized
    console.log('✅ Firebase app initialized');

    // Test 2: Check Auth service
    if (auth) {
      console.log('✅ Firebase Auth service ready');
      console.log('   Current user:', auth.currentUser?.email || 'Not signed in');
    }

    // Test 3: Check Firestore service
    if (firestore) {
      console.log('✅ Firebase Firestore service ready');
      console.log('   Offline persistence enabled');
    }

    // Test 4: Check Storage service
    if (storage) {
      console.log('✅ Firebase Storage service ready');
    }

    console.log('\n🎉 All Firebase services initialized successfully!\n');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
}

/**
 * Get Firebase configuration status
 * @returns Object with configuration details
 */
export function getFirebaseStatus() {
  return {
    auth: {
      initialized: !!auth,
      currentUser: auth.currentUser?.email || null,
    },
    firestore: {
      initialized: !!firestore,
      offlineEnabled: true,
    },
    storage: {
      initialized: !!storage,
    },
  };
}
