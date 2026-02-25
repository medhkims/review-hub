import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { BusinessModel } from '../models/businessModel';
import { BusinessDetailModel } from '../models/businessDetailModel';
import { ReviewModel } from '../models/reviewModel';
import { ServerException } from '@/core/error/exceptions';
import { auth } from '@/core/firebase/firebaseConfig';

export interface RegisterBusinessData {
  businessName: string;
  category: string;
  subCategory: string;
  phone: string;
  location: string;
  website: string;
  facebook: string;
  instagram: string;
}

export interface UpdateBusinessData {
  [key: string]: unknown;
}

export interface BusinessRemoteDataSource {
  getFeaturedBusinesses(): Promise<BusinessModel[]>;
  getBusinessesByCategory(categoryId: string): Promise<BusinessModel[]>;
  searchBusinesses(queryStr: string): Promise<BusinessModel[]>;
  getUserFavoriteIds(userId: string): Promise<string[]>;
  addFavorite(businessId: string, userId: string): Promise<void>;
  removeFavorite(businessId: string, userId: string): Promise<void>;
  isFavorite(businessId: string, userId: string): Promise<boolean>;
  getBusinessDetail(businessId: string): Promise<BusinessDetailModel>;
  getBusinessByOwnerId(userId: string): Promise<BusinessDetailModel | null>;
  getBusinessReviews(businessId: string): Promise<ReviewModel[]>;
  registerBusiness(data: RegisterBusinessData): Promise<string>;
  updateBusiness(businessId: string, data: UpdateBusinessData): Promise<void>;
}

export class BusinessRemoteDataSourceImpl implements BusinessRemoteDataSource {
  private readonly BUSINESSES = 'businesses';
  private readonly FAVORITES = 'favorites';
  private readonly REVIEWS = 'reviews';

  async getFeaturedBusinesses(): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('is_featured', '==', true),
        orderBy('rating', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch featured businesses';
      throw new ServerException(message);
    }
  }

  async getBusinessesByCategory(categoryId: string): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('category_id', '==', categoryId),
        orderBy('rating', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch businesses';
      throw new ServerException(message);
    }
  }

  async searchBusinesses(queryStr: string): Promise<BusinessModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('name', '>=', queryStr),
        where('name', '<=', queryStr + '\uf8ff'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as BusinessModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to search businesses';
      throw new ServerException(message);
    }
  }

  async getUserFavoriteIds(userId: string): Promise<string[]> {
    try {
      const q = query(
        collection(firestore, this.FAVORITES),
        where('user_id', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => d.data().business_id as string);
    } catch {
      return [];
    }
  }

  async isFavorite(businessId: string, userId: string): Promise<boolean> {
    try {
      const favId = `${userId}_${businessId}`;
      const favDoc = await getDoc(doc(firestore, this.FAVORITES, favId));
      return favDoc.exists();
    } catch {
      return false;
    }
  }

  async addFavorite(businessId: string, userId: string): Promise<void> {
    try {
      const favId = `${userId}_${businessId}`;
      await setDoc(doc(firestore, this.FAVORITES, favId), {
        user_id: userId,
        business_id: businessId,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to add favorite';
      throw new ServerException(message);
    }
  }

  async removeFavorite(businessId: string, userId: string): Promise<void> {
    try {
      const favId = `${userId}_${businessId}`;
      await deleteDoc(doc(firestore, this.FAVORITES, favId));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to remove favorite';
      throw new ServerException(message);
    }
  }

  async getBusinessDetail(businessId: string): Promise<BusinessDetailModel> {
    try {
      const docRef = doc(firestore, this.BUSINESSES, businessId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new ServerException('Business not found');
      }
      return { id: docSnap.id, ...docSnap.data() } as BusinessDetailModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to fetch business detail';
      throw new ServerException(message);
    }
  }

  async getBusinessByOwnerId(userId: string): Promise<BusinessDetailModel | null> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES),
        where('owner_id', '==', userId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        return null;
      }
      const docSnap = snapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as BusinessDetailModel;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch business by owner';
      throw new ServerException(message);
    }
  }

  async getBusinessReviews(businessId: string): Promise<ReviewModel[]> {
    try {
      const q = query(
        collection(firestore, this.BUSINESSES, businessId, this.REVIEWS),
        orderBy('created_at', 'desc'),
        limit(20)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ReviewModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
      throw new ServerException(message);
    }
  }

  async registerBusiness(data: RegisterBusinessData): Promise<string> {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new ServerException('User must be authenticated to register a business');
      }

      const businessDoc = await addDoc(collection(firestore, this.BUSINESSES), {
        name: data.businessName,
        description: '',
        category_id: data.category,
        category_name: data.category,
        sub_category: data.subCategory || '',
        location: data.location || '',
        latitude: null,
        longitude: null,
        cover_image_url: null,
        logo_url: null,
        is_open: false,
        rating: 0,
        review_count: 0,
        is_featured: false,
        owner_id: currentUser.uid,
        contact: {
          phone: data.phone || null,
          email: null,
          website: data.website || null,
          instagram_handle: data.instagram || null,
          facebook_name: data.facebook || null,
          tiktok_handle: null,
        },
        category_ratings: [],
        rating_distribution: [],
        menu_categories: [],
        delivery_services: [],
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return businessDoc.id;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to register business';
      throw new ServerException(message);
    }
  }

  async updateBusiness(businessId: string, data: UpdateBusinessData): Promise<void> {
    try {
      const docRef = doc(firestore, this.BUSINESSES, businessId);
      await updateDoc(docRef, {
        ...data,
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update business';
      throw new ServerException(message);
    }
  }
}
