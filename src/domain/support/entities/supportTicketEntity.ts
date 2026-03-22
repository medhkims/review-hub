export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type SupportTicketCategory = 'ACCOUNT' | 'TECHNICAL' | 'BILLING' | 'GENERAL' | 'OTHER';

export interface SupportTicketEntity {
  id: string;
  subject: string;
  message: string;
  category: SupportTicketCategory;
  userId: string;
  userEmail: string;
  userName: string;
  status: SupportTicketStatus;
  createdAt: Date;
  updatedAt: Date;
  adminReply?: string;
}
