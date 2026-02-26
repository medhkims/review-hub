import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ConversationModel } from '../models/conversationModel';
import { MessageModel } from '../models/messageModel';
import { ServerException } from '@/core/error/exceptions';

export interface ChatRemoteDataSource {
  getConversations(userId: string): Promise<ConversationModel[]>;
  getMessages(conversationId: string): Promise<MessageModel[]>;
  sendMessage(conversationId: string, senderId: string, text: string): Promise<MessageModel>;
}

export class ChatRemoteDataSourceImpl implements ChatRemoteDataSource {
  async getConversations(userId: string): Promise<ConversationModel[]> {
    try {
      const conversationsRef = collection(firestore, 'conversations');
      const q = query(
        conversationsRef,
        where('participant_ids', 'array-contains', userId),
        orderBy('last_message_at', 'desc'),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as ConversationModel,
      );
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to fetch conversations',
        err.code,
      );
    }
  }

  async getMessages(conversationId: string): Promise<MessageModel[]> {
    try {
      const messagesRef = collection(
        firestore,
        'conversations',
        conversationId,
        'messages',
      );
      const q = query(messagesRef, orderBy('created_at', 'asc'));
      const snapshot = await getDocs(q);

      return snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as MessageModel,
      );
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to fetch messages',
        err.code,
      );
    }
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string,
  ): Promise<MessageModel> {
    try {
      const messagesRef = collection(
        firestore,
        'conversations',
        conversationId,
        'messages',
      );

      const messageData = {
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        created_at: serverTimestamp(),
        is_pending: false,
      };

      const docRef = await addDoc(messagesRef, messageData);

      // Update the conversation's last_message and last_message_at
      const conversationRef = doc(firestore, 'conversations', conversationId);
      await updateDoc(conversationRef, {
        last_message: text,
        last_message_at: serverTimestamp(),
      });

      return {
        id: docRef.id,
        conversation_id: conversationId,
        sender_id: senderId,
        text,
        created_at: Timestamp.now(),
        is_pending: false,
      };
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string };
      throw new ServerException(
        err.message || 'Failed to send message',
        err.code,
      );
    }
  }
}
