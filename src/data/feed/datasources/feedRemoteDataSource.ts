import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { PostModel } from '../models/postModel';
import { ServerException } from '@/core/error/exceptions';

export interface FeedRemoteDataSource {
  getPosts(page: number, pageSize: number, lastDocTimestamp?: Timestamp): Promise<PostModel[]>;
  createPost(
    userId: string,
    authorName: string,
    avatarUrl: string | null,
    content: string,
    imageUrl?: string,
  ): Promise<PostModel>;
  likePost(postId: string, userId: string): Promise<void>;
  unlikePost(postId: string, userId: string): Promise<void>;
  isPostLikedByUser(postId: string, userId: string): Promise<boolean>;
  getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>>;
}

export class FeedRemoteDataSourceImpl implements FeedRemoteDataSource {
  private readonly POSTS = 'posts';
  private readonly POST_LIKES = 'post_likes';

  async getPosts(page: number, pageSize: number, lastDocTimestamp?: Timestamp): Promise<PostModel[]> {
    try {
      let q;
      if (page > 1 && lastDocTimestamp) {
        q = query(
          collection(firestore, this.POSTS),
          orderBy('created_at', 'desc'),
          startAfter(lastDocTimestamp),
          limit(pageSize),
        );
      } else {
        q = query(
          collection(firestore, this.POSTS),
          orderBy('created_at', 'desc'),
          limit(pageSize),
        );
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch posts';
      throw new ServerException(message);
    }
  }

  async createPost(
    userId: string,
    authorName: string,
    avatarUrl: string | null,
    content: string,
    imageUrl?: string,
  ): Promise<PostModel> {
    try {
      const postData = {
        author_id: userId,
        author_name: authorName,
        author_avatar_url: avatarUrl,
        content,
        image_url: imageUrl || null,
        likes_count: 0,
        comments_count: 0,
        created_at: serverTimestamp(),
      };

      const docRef = await addDoc(collection(firestore, this.POSTS), postData);
      const newDoc = await getDoc(docRef);

      return { id: newDoc.id, ...newDoc.data() } as PostModel;
    } catch (error: unknown) {
      if (error instanceof ServerException) throw error;
      const message = error instanceof Error ? error.message : 'Failed to create post';
      throw new ServerException(message);
    }
  }

  async likePost(postId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${postId}`;
      await setDoc(doc(firestore, this.POST_LIKES, likeId), {
        user_id: userId,
        post_id: postId,
        created_at: serverTimestamp(),
      });

      const postRef = doc(firestore, this.POSTS, postId);
      await updateDoc(postRef, {
        likes_count: increment(1),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to like post';
      throw new ServerException(message);
    }
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    try {
      const likeId = `${userId}_${postId}`;
      await deleteDoc(doc(firestore, this.POST_LIKES, likeId));

      const postRef = doc(firestore, this.POSTS, postId);
      await updateDoc(postRef, {
        likes_count: increment(-1),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to unlike post';
      throw new ServerException(message);
    }
  }

  async isPostLikedByUser(postId: string, userId: string): Promise<boolean> {
    try {
      const likeId = `${userId}_${postId}`;
      const likeDoc = await getDoc(doc(firestore, this.POST_LIKES, likeId));
      return likeDoc.exists();
    } catch {
      return false;
    }
  }

  async getLikedPostIds(userId: string, postIds: string[]): Promise<Set<string>> {
    const likedIds = new Set<string>();
    try {
      const checkPromises = postIds.map(async (postId) => {
        const likeId = `${userId}_${postId}`;
        const likeDoc = await getDoc(doc(firestore, this.POST_LIKES, likeId));
        if (likeDoc.exists()) {
          likedIds.add(postId);
        }
      });
      await Promise.all(checkPromises);
      return likedIds;
    } catch {
      return likedIds;
    }
  }
}
