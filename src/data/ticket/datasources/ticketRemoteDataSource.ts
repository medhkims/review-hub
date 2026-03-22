import { firestore } from '@/core/firebase/firebaseConfig';
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { TicketModel } from '../models/ticketModel';
import { ServerException } from '@/core/error/exceptions';

export interface TicketRemoteDataSource {
  getTickets(): Promise<TicketModel[]>;
  updateTicketStatus(
    ticketId: string,
    status: string,
    assignee?: { id: string; name: string; role: string },
  ): Promise<void>;
}

export class TicketRemoteDataSourceImpl implements TicketRemoteDataSource {
  private readonly COLLECTION = 'reports';

  async getTickets(): Promise<TicketModel[]> {
    try {
      const q = query(
        collection(firestore, this.COLLECTION),
        orderBy('created_at', 'desc'),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TicketModel));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
      throw new ServerException(message);
    }
  }

  async updateTicketStatus(
    ticketId: string,
    status: string,
    assignee?: { id: string; name: string; role: string },
  ): Promise<void> {
    try {
      const payload: Record<string, unknown> = {
        status,
        updated_at: serverTimestamp(),
      };
      if (status === 'in_progress' && assignee) {
        // Save who picked it up
        payload.assigned_to_id   = assignee.id;
        payload.assigned_to_name = assignee.name;
        payload.assigned_to_role = assignee.role;
      } else if (status === 'pending') {
        // Reopened → clear handler
        payload.assigned_to_id   = null;
        payload.assigned_to_name = null;
        payload.assigned_to_role = null;
      }
      // resolved / closed → leave existing handler fields untouched
      await updateDoc(doc(firestore, this.COLLECTION, ticketId), payload);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to update ticket status';
      throw new ServerException(message);
    }
  }
}
