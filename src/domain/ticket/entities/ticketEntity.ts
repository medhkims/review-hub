export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface TicketEntity {
  id: string;
  businessId: string;
  businessName: string;
  reason: string;
  reportedByUserId: string;
  reporterName: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: Date;
  updatedAt: Date;
  assignedToId?: string;
  assignedToName?: string;
  assignedToRole?: 'admin' | 'moderator';
}
