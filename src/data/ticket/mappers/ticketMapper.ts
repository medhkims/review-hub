import { TicketModel } from '../models/ticketModel';
import { TicketEntity, TicketStatus, TicketPriority } from '@/domain/ticket/entities/ticketEntity';

function deriveStatus(status: string): TicketStatus {
  switch (status) {
    case 'in_progress': return 'IN_PROGRESS';
    case 'resolved':    return 'RESOLVED';
    case 'closed':      return 'CLOSED';
    default:            return 'OPEN';
  }
}

function derivePriority(reason: string): TicketPriority {
  const lower = reason.toLowerCase();
  if (lower.includes('spam') || lower.includes('inappropriate')) return 'HIGH';
  if (lower.includes('wronginfo') || lower.includes('closed'))   return 'MEDIUM';
  if (lower.startsWith('other:'))                                 return 'LOW';
  return 'LOW';
}

export class TicketMapper {
  static toEntity(model: TicketModel): TicketEntity {
    return {
      id: model.id,
      businessId: model.business_id,
      businessName: model.business_name,
      reason: model.reason,
      reportedByUserId: model.reported_by,
      reporterName: model.reporter_name || 'Anonymous',
      status: deriveStatus(model.status),
      priority: derivePriority(model.reason),
      createdAt: model.created_at?.toDate?.() ?? new Date(),
      updatedAt: model.updated_at?.toDate?.() ?? model.created_at?.toDate?.() ?? new Date(),
      assignedToId: model.assigned_to_id,
      assignedToName: model.assigned_to_name,
      assignedToRole: model.assigned_to_role as 'admin' | 'moderator' | undefined,
    };
  }
}
