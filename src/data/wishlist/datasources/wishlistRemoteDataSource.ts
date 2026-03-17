import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  setDoc,
  addDoc,
  Timestamp,
  query,
  orderBy,
  where,
  limit,
} from 'firebase/firestore';
import { WishlistItemModel } from '../models/wishlistItemModel';
import { WishlistAddInput } from '@/domain/wishlist/repositories/wishlistRepository';
import { ServerException } from '@/core/error/exceptions';

export interface WishlistRemoteDataSource {
  getWishlist(userId: string): Promise<WishlistItemModel[]>;
  addWishlistItem(userId: string, input: WishlistAddInput): Promise<WishlistItemModel>;
  removeFromWishlist(userId: string, itemId: string): Promise<void>;
}

export class WishlistRemoteDataSourceImpl implements WishlistRemoteDataSource {
  private getWishlistCollection(userId: string) {
    return collection(firestore, 'users', userId, 'wishlist');
  }

  async getWishlist(userId: string): Promise<WishlistItemModel[]> {
    try {
      const wishlistRef = this.getWishlistCollection(userId);
      const q = query(wishlistRef, orderBy('added_at', 'desc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as WishlistItemModel
      );
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to fetch wishlist',
        err.code
      );
    }
  }

  async addWishlistItem(
    userId: string,
    input: WishlistAddInput,
  ): Promise<WishlistItemModel> {
    try {
      // Use placeId as document ID to prevent duplicates
      const itemRef = doc(firestore, 'users', userId, 'wishlist', input.placeId);

      const addedAt = Timestamp.fromDate(new Date());

      await setDoc(itemRef, {
        user_id: userId,
        place_id: input.placeId,
        place_name: input.placeName,
        place_image_url: input.placeImageUrl,
        rating: input.rating,
        review_count: input.reviewCount,
        location: input.location,
        added_at: addedAt,
      });

      // Also write to top-level favorites collection so business owners can count saves
      addDoc(collection(firestore, 'favorites'), {
        user_id: userId,
        business_id: input.placeId,
        added_at: addedAt,
      }).catch(() => {});

      return {
        id: input.placeId,
        user_id: userId,
        place_id: input.placeId,
        place_name: input.placeName,
        place_image_url: input.placeImageUrl,
        rating: input.rating,
        review_count: input.reviewCount,
        location: input.location,
        added_at: addedAt,
      };
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to add wishlist item',
        err.code
      );
    }
  }

  async removeFromWishlist(userId: string, itemId: string): Promise<void> {
    try {
      const itemRef = doc(firestore, 'users', userId, 'wishlist', itemId);
      await deleteDoc(itemRef);

      // Also remove the corresponding favorites doc (fire-and-forget)
      getDocs(query(
        collection(firestore, 'favorites'),
        where('user_id', '==', userId),
        where('business_id', '==', itemId),
        limit(1),
      )).then(snap => {
        snap.forEach(d => deleteDoc(d.ref).catch(() => {}));
      }).catch(() => {});
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to remove wishlist item',
        err.code
      );
    }
  }
}
