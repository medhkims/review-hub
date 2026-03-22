import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleAuth } from 'google-auth-library';

// ─── Spending Protection Types ────────────────────────────────────────────────
interface SpendingLimits {
  emergency_shutdown: boolean;       // Master kill switch for all paid operations
  vision_api_enabled: boolean;       // Toggle Vision OCR specifically
  vision_per_user_daily_limit: number; // Max Vision calls per user per day
  vision_global_daily_limit: number;   // Max Vision calls total per day
}

const DEFAULT_LIMITS: SpendingLimits = {
  emergency_shutdown: false,
  vision_api_enabled: true,
  vision_per_user_daily_limit: 5,    // Each user can validate up to 5 IDs per day
  vision_global_daily_limit: 2000,   // App-wide max 2,000 Vision calls/day (~$3/day, ~$90/month)
};

// ─── Spending Guard Helper ─────────────────────────────────────────────────────
async function checkSpendingGuard(userId: string): Promise<void> {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // 1. Load spending limits config (or use defaults)
  const limitsDoc = await db.collection('app_config').doc('spending_limits').get();
  const limits: SpendingLimits = limitsDoc.exists
    ? { ...DEFAULT_LIMITS, ...(limitsDoc.data() as Partial<SpendingLimits>) }
    : DEFAULT_LIMITS;

  // 2. Emergency shutdown — stops ALL paid operations immediately
  if (limits.emergency_shutdown) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Service temporarily unavailable due to spending limits. Contact support.'
    );
  }

  // 3. Vision API disabled
  if (!limits.vision_api_enabled) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'ID verification is temporarily disabled. Please try again later.'
    );
  }

  // 4. Check global daily cap
  const globalRef = db.collection('usage_tracking').doc(`vision_global_${today}`);
  const globalSnap = await globalRef.get();
  const globalCount: number = globalSnap.exists ? (globalSnap.data()?.count ?? 0) : 0;

  if (globalCount >= limits.vision_global_daily_limit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Daily verification limit reached for the app. Please try again tomorrow.'
    );
  }

  // 5. Check per-user daily cap
  const userRef = db.collection('usage_tracking').doc(`vision_user_${userId}_${today}`);
  const userSnap = await userRef.get();
  const userCount: number = userSnap.exists ? (userSnap.data()?.count ?? 0) : 0;

  if (userCount >= limits.vision_per_user_daily_limit) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      `You have reached the daily ID verification limit (${limits.vision_per_user_daily_limit} per day). Try again tomorrow.`
    );
  }
}

// ─── Usage Increment Helper ────────────────────────────────────────────────────
async function incrementVisionUsage(userId: string): Promise<void> {
  const db = admin.firestore();
  const today = new Date().toISOString().split('T')[0];

  const batch = db.batch();

  const globalRef = db.collection('usage_tracking').doc(`vision_global_${today}`);
  batch.set(globalRef, { count: admin.firestore.FieldValue.increment(1), date: today }, { merge: true });

  const userRef = db.collection('usage_tracking').doc(`vision_user_${userId}_${today}`);
  batch.set(userRef, { count: admin.firestore.FieldValue.increment(1), user_id: userId, date: today }, { merge: true });

  await batch.commit();
}

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

/**
 * Callable Function: Validate Tunisian ID Card
 *
 * Accepts a base64-encoded image, calls Google Cloud Vision OCR using the
 * function's service account credentials (no API key required).
 * Checks whether the image contains Tunisian national ID card Arabic keywords.
 *
 * Prerequisite: Cloud Vision API must be enabled for the project.
 * It was enabled automatically — no further setup needed.
 */
const visionAuth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
});

export const validateTunisianId = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const { imageBase64 } = data as { imageBase64?: string };
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'imageBase64 is required');
  }

  // ── Spending guard: check limits before hitting Vision API ──────────────────
  await checkSpendingGuard(context.auth.uid);

  try {
    const client = await visionAuth.getClient();
    const { token } = await client.getAccessToken();

    const response = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          requests: [{
            image: { content: imageBase64 },
            features: [{ type: 'TEXT_DETECTION', maxResults: 1 }],
          }],
        }),
      },
    );

    if (!response.ok) {
      console.error('Vision API error:', response.status, await response.text());
      return { isValid: true }; // fail open
    }

    const result = await response.json() as {
      responses?: Array<{ fullTextAnnotation?: { text?: string } }>;
    };
    const detectedText: string = result?.responses?.[0]?.fullTextAnnotation?.text ?? '';

    // Tunisian national ID card always contains at least one of these Arabic phrases
    const keywords = [
      'بطاقة الهوية',
      'الجمهورية التونسية',
      'الهوية الوطنية',
      'بطاقة التعريف',
    ];
    const isValid = keywords.some((kw) => detectedText.includes(kw));

    // ── Extract 8-digit Tunisian CIN number from detected text ───────────────
    const cinMatch = detectedText.match(/\b\d{8}\b/);
    const cinNumber: string | null = cinMatch ? cinMatch[0] : null;

    // ── Track usage AFTER successful Vision API call ─────────────────────────
    await incrementVisionUsage(context.auth!.uid);

    return { isValid, cinNumber };
  } catch (error) {
    // Re-throw spending/rate-limit errors as-is
    if (error instanceof functions.https.HttpsError) throw error;
    console.error('validateTunisianId error:', error);
    return { isValid: true, cinNumber: null }; // fail open for Vision API errors only
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

// ─── Budget Alert Handler ──────────────────────────────────────────────────────
/**
 * Triggered by Google Cloud Billing budget alerts via Pub/Sub.
 *
 * Setup in GCP Console:
 *   Billing → Budgets & alerts → Create budget → "Connect a Pub/Sub topic"
 *   Topic name: "billing-alerts" (must match PUBSUB_TOPIC below)
 *
 * When your monthly budget is 80% spent ($120) → Vision API disabled.
 * When your monthly budget is 100% spent ($150) → Full emergency shutdown.
 */
export const handleBudgetAlert = functions.pubsub
  .topic('billing-alerts')
  .onPublish(async (message) => {
    const budgetData = message.json as {
      budgetDisplayName?: string;
      alertThresholdExceeded?: number; // e.g. 0.9 = 90%, 1.0 = 100%
      costAmount?: number;
      budgetAmount?: number;
      currencyCode?: string;
    };

    const threshold = budgetData.alertThresholdExceeded ?? 0;
    const cost = budgetData.costAmount ?? 0;
    const budget = budgetData.budgetAmount ?? 0;

    console.log(`Budget alert: ${(threshold * 100).toFixed(0)}% spent — $${cost} of $${budget}`);

    const db = admin.firestore();
    const limitsRef = db.collection('app_config').doc('spending_limits');

    if (threshold >= 1.0) {
      // 100% spent ($150) — full emergency shutdown of all paid operations
      await limitsRef.set({
        emergency_shutdown: true,
        vision_api_enabled: false,
        shutdown_reason: `Budget limit reached: $${cost} of $${budget} ${budgetData.currencyCode ?? 'USD'}`,
        shutdown_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.error(`EMERGENCY SHUTDOWN triggered at $${cost} of $${budget}`);
    } else if (threshold >= 0.8) {
      // 80% spent ($120) — disable Vision OCR (most expensive service)
      await limitsRef.set({
        vision_api_enabled: false,
        shutdown_reason: `Vision API auto-disabled at 80% budget ($${cost} of $${budget})`,
        shutdown_at: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.warn(`Vision API disabled at 80% budget — $${cost} of $${budget} spent`);
    }
  });

// ─── Admin: Get Spending Stats ─────────────────────────────────────────────────
/**
 * Callable by admins to view today's Vision API usage and current limits.
 */
export const getSpendingStats = functions.https.onCall(async (_data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const db = admin.firestore();

  // Verify admin
  const profile = await db.collection('profiles').doc(context.auth.uid).get();
  if (!profile.exists || profile.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const today = new Date().toISOString().split('T')[0];

  const [limitsDoc, globalUsageDoc] = await Promise.all([
    db.collection('app_config').doc('spending_limits').get(),
    db.collection('usage_tracking').doc(`vision_global_${today}`).get(),
  ]);

  const limits = limitsDoc.exists
    ? { ...DEFAULT_LIMITS, ...(limitsDoc.data() as Partial<SpendingLimits>) }
    : DEFAULT_LIMITS;

  const todayVisionCalls: number = globalUsageDoc.exists ? (globalUsageDoc.data()?.count ?? 0) : 0;

  return {
    today,
    limits,
    usage: {
      vision_calls_today: todayVisionCalls,
      vision_calls_remaining: Math.max(0, limits.vision_global_daily_limit - todayVisionCalls),
    },
  };
});

// ─── Admin: Update Spending Limits ────────────────────────────────────────────
/**
 * Allows admins to update spending limits and toggle emergency shutdown.
 * Use this to re-enable the app after a shutdown.
 */
export const updateSpendingLimits = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  const db = admin.firestore();

  // Verify admin
  const profile = await db.collection('profiles').doc(context.auth.uid).get();
  if (!profile.exists || profile.data()?.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admins only');
  }

  const allowedFields: (keyof SpendingLimits)[] = [
    'emergency_shutdown',
    'vision_api_enabled',
    'vision_per_user_daily_limit',
    'vision_global_daily_limit',
  ];

  const updates: Partial<SpendingLimits> = {};
  for (const field of allowedFields) {
    if (field in data) {
      (updates as Record<string, unknown>)[field] = data[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No valid fields to update');
  }

  await db.collection('app_config').doc('spending_limits').set(
    { ...updates, updated_at: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );

  return { success: true, updated: updates };
});
