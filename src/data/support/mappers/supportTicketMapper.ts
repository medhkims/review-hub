import { SupportTicketModel } from '../models/supportTicketModel';
import {
  SupportTicketEntity,
  SupportTicketStatus,
  SupportTicketCategory,
} from '@/domain/support/entities/supportTicketEntity';

function deriveStatus(s: string): SupportTicketStatus {
  switch (s) {
    case 'in_progress': return 'IN_PROGRESS';
    case 'resolved':    return 'RESOLVED';
    case 'closed':      return 'CLOSED';
    default:            return 'OPEN';
  }
}

function deriveCategory(c: string): SupportTicketCategory {
  switch (c?.toUpperCase()) {
    case 'ACCOUNT':   return 'ACCOUNT';
    case 'TECHNICAL': return 'TECHNICAL';
    case 'BILLING':   return 'BILLING';
    case 'GENERAL':   return 'GENERAL';
    default:          return 'OTHER';
  }
}

export class SupportTicketMapper {
  static toEntity(model: SupportTicketModel): SupportTicketEntity {
    return {
      id: model.id,
      subject: model.subject,
      message: model.message,
      category: deriveCategory(model.category),
      userId: model.user_id,
      userEmail: model.user_email,
      userName: model.user_name,
      status: deriveStatus(model.status),
      createdAt: model.created_at?.toDate?.() ?? new Date(),
      updatedAt: model.updated_at?.toDate?.() ?? model.created_at?.toDate?.() ?? new Date(),
      adminReply: model.admin_reply,
    };
  }
}
