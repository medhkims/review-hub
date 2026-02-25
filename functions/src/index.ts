import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

/**
 * Cloud Function: Create User Profile
 *
 * Triggered when a new user signs up via Firebase Auth.
 * Automatically creates a profile document in Firestore.
 */
export const createUserProfile = functions.auth.user().onCreate(async (user) => {
  const { uid, email, displayName, photoURL, phoneNumber } = user;

  try {
    const profileRef = admin.firestore().collection('profiles').doc(uid);

    // Check if profile already exists (shouldn't happen, but just in case)
    const existingProfile = await profileRef.get();
    if (existingProfile.exists) {
      console.log(`Profile already exists for user ${uid}`);
      return null;
    }

    // Create the profile document
    await profileRef.set({
      id: uid,
      user_id: uid,
      display_name: displayName || 'Anonymous User',
      email: email || '',
      phone_number: phoneNumber || null,
      bio: '',
      avatar_url: photoURL || null,
      followers_count: 0,
      following_count: 0,
      role: 'simple_user',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Successfully created profile for user ${uid}`);
    return null;
  } catch (error) {
    console.error(`Error creating profile for user ${uid}:`, error);
    throw error;
  }
});

/**
 * Cloud Function: Delete User Data
 *
 * Triggered when a user account is deleted.
 * Cleans up all user-related data from Firestore.
 */
export const deleteUserData = functions.auth.user().onDelete(async (user) => {
  const { uid } = user;
  const db = admin.firestore();

  try {
    // Batch delete user data
    const batch = db.batch();

    // Delete profile
    const profileRef = db.collection('profiles').doc(uid);
    batch.delete(profileRef);

    // Delete user settings
    const settingsRef = db.collection('user_settings').doc(uid);
    batch.delete(settingsRef);

    // TODO: Delete user posts, conversations, reviews, etc.
    // For now, we'll keep them with orphaned user_id for data integrity

    await batch.commit();

    console.log(`Successfully deleted data for user ${uid}`);
    return null;
  } catch (error) {
    console.error(`Error deleting data for user ${uid}:`, error);
    throw error;
  }
});

/**
 * Cloud Function: Update Profile Denormalized Data
 *
 * When a user updates their profile, update denormalized data
 * across posts, messages, reviews, etc.
 */
export const updateDenormalizedProfileData = functions.firestore
  .document('profiles/{userId}')
  .onUpdate(async (change, context) => {
    const userId = context.params.userId;
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if relevant fields changed
    const displayNameChanged = beforeData.display_name !== afterData.display_name;
    const avatarChanged = beforeData.avatar_url !== afterData.avatar_url;

    if (!displayNameChanged && !avatarChanged) {
      console.log(`No relevant changes for user ${userId}`);
      return null;
    }

    const db = admin.firestore();
    const batch = db.batch();

    try {
      // Update posts
      if (displayNameChanged || avatarChanged) {
        const postsSnapshot = await db
          .collection('posts')
          .where('user_id', '==', userId)
          .limit(500) // Process in batches
          .get();

        postsSnapshot.forEach((doc) => {
          const updates: any = {};
          if (displayNameChanged) updates.author_name = afterData.display_name;
          if (avatarChanged) updates.author_avatar = afterData.avatar_url;
          batch.update(doc.ref, updates);
        });
      }

      // TODO: Update conversations, reviews, etc.

      await batch.commit();

      console.log(`Successfully updated denormalized data for user ${userId}`);
      return null;
    } catch (error) {
      console.error(`Error updating denormalized data for user ${userId}:`, error);
      throw error;
    }
  });

/**
 * Callable Function: Get User Profile by ID
 *
 * Allows clients to fetch other users' profiles (for viewing, following, etc.)
 * Returns public profile data only.
 */
export const getUserProfile = functions.https.onCall(async (data, context) => {
  // Require authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to view profiles'
    );
  }

  const { userId } = data;

  if (!userId || typeof userId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'userId must be a valid string'
    );
  }

  try {
    const profileDoc = await admin
      .firestore()
      .collection('profiles')
      .doc(userId)
      .get();

    if (!profileDoc.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Profile not found'
      );
    }

    const profileData = profileDoc.data();

    // Return public data only (exclude private fields in future)
    return {
      id: profileData?.id,
      display_name: profileData?.display_name,
      bio: profileData?.bio,
      avatar_url: profileData?.avatar_url,
      followers_count: profileData?.followers_count,
      following_count: profileData?.following_count,
    };
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    throw new functions.https.HttpsError(
      'internal',
      error.message || 'Failed to fetch profile'
    );
  }
});

/**
 * Callable Function: Update User Role
 *
 * Only admins can change user roles.
 * Verifies caller's admin status server-side before updating.
 */
/**
 * Callable Function: Register Business Owner
 *
 * Called after sign-up when a user registers as a business owner.
 * Updates the user's profile role to 'business_owner' and creates
 * the business document in Firestore.
 */
export const registerBusinessOwner = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  const uid = context.auth.uid;
  const {
    businessName,
    category,
    subCategory,
    phone,
    location,
    website,
    facebook,
    instagram,
  } = data;

  if (!businessName || typeof businessName !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'businessName is required'
    );
  }

  if (!category || typeof category !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'category is required'
    );
  }

  const db = admin.firestore();

  try {
    // Check that the user's profile exists
    const profileRef = db.collection('profiles').doc(uid);
    const profileSnap = await profileRef.get();

    if (!profileSnap.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'User profile not found. Please try again shortly.'
      );
    }

    // Update profile role to business_owner
    await profileRef.update({
      role: 'business_owner',
      phone_number: phone || null,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Create business document
    const businessRef = db.collection('businesses').doc();
    await businessRef.set({
      name: businessName,
      description: '',
      category_id: category,
      category_name: category,
      sub_category: subCategory || '',
      location: location || '',
      cover_image_url: null,
      logo_url: null,
      rating: 0,
      review_count: 0,
      is_featured: false,
      owner_id: uid,
      contact: {
        phone: phone || '',
        website: website || '',
        facebook: facebook || '',
        instagram: instagram || '',
      },
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`Business registered for user ${uid}, business ID: ${businessRef.id}`);

    return { success: true, businessId: businessRef.id };
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Failed to register business';
    console.error(`Error registering business for user ${uid}:`, error);
    throw new functions.https.HttpsError('internal', message);
  }
});

export const updateUserRole = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated'
    );
  }

  // Verify caller is an admin
  const callerProfile = await admin
    .firestore()
    .collection('profiles')
    .doc(context.auth.uid)
    .get();

  if (!callerProfile.exists || callerProfile.data()?.role !== 'admin') {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can change user roles'
    );
  }

  const { targetUserId, newRole } = data;

  if (!targetUserId || typeof targetUserId !== 'string') {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'targetUserId must be a valid string'
    );
  }

  const validRoles = ['admin', 'moderator', 'simple_user', 'business_owner'];
  if (!validRoles.includes(newRole)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid role specified'
    );
  }

  try {
    const targetProfile = await admin
      .firestore()
      .collection('profiles')
      .doc(targetUserId)
      .get();

    if (!targetProfile.exists) {
      throw new functions.https.HttpsError(
        'not-found',
        'Target user profile not found'
      );
    }

    await admin
      .firestore()
      .collection('profiles')
      .doc(targetUserId)
      .update({
        role: newRole,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    return { success: true, targetUserId, newRole };
  } catch (error: unknown) {
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Failed to update role';
    throw new functions.https.HttpsError('internal', message);
  }
});
