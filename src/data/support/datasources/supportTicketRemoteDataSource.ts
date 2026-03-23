import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { SupportTicketModel } from '../models/supportTicketModel';
import { ServerException } from '@/core/error/exceptions';

export interface SupportTicketRemoteDataSource {
  submitTicket(
    subject: string,
    message: string,
    category: string,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<SupportTicketModel>;
  getUserTickets(userId: string): Promise<SupportTicketModel[]>;
  getAllTickets(): Promise<SupportTicketModel[]>;
  replyToTicket(ticketId: string, adminReply: string, status: string): Promise<void>;
}

export class SupportTicketRemoteDataSourceImpl implements SupportTicketRemoteDataSource {
  private readonly COLLECTION = 'support_tickets';

  async submitTicket(
    subject: string,
    message: string,
    category: string,
    userId: string,
    userEmail: string,
    userName: string,
  ): Promise<SupportTicketModel> {
    try {
      const now = serverTimestamp();
      const payload = {
        subject,
        message,
        category,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        status: 'open',
        created_at: now,
        updated_at: now,
      };
      const ref = await addDoc(collection(firestore, this.COLLECTION), payload);
      // Return a model with synthetic dates since serverTimestamp() is a sentinel
      const clientNow = new Date();
      return {
        id: ref.id,
        subject,
        message,
        category,
        user_id: userId,
        user_email: userEmail,
        user_name: userName,
        status: 'open',
        created_at: { toDate: () => clientNow } as never,
        updated_at: { toDate: () => clientNow } as never,
      };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to submit ticket';
      throw new ServerException(msg);
    }
  }

  async getUserTickets(userId: string): Promise<SupportTicketModel[]> {
    try {
      // Avoid composite index requirement by filtering only (no orderBy).
      // Sort client-side so the query works even while the index is building.
      const q = query(
        collection(firestore, this.COLLECTION),
        where('user_id', '==', userId),
      );
      const snap = await getDocs(q);
      const tickets = snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicketModel));
      tickets.sort((a, b) => {
        const aTime = a.created_at instanceof Timestamp ? a.created_at.toMillis() : 0;
        const bTime = b.created_at instanceof Timestamp ? b.created_at.toMillis() : 0;
        return bTime - aTime;
      });
      return tickets;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch tickets';
      throw new ServerException(msg);
    }
  }

  async getAllTickets(): Promise<SupportTicketModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        orderBy('created_at', 'desc'),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SupportTicketModel));
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to fetch all support tickets';
      throw new ServerException(msg);
    }
  }

  async replyToTicket(ticketId: string, adminReply: string, status: string): Promise<void> {
    try {
      await updateDoc(doc(firestore, this.COLLECTION, ticketId), {
        admin_reply: adminReply,
        status,
        updated_at: serverTimestamp(),
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Failed to reply to support ticket';
      throw new ServerException(msg);
    }
  }
}
