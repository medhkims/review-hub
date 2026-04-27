export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export interface BookingRequestEntity {
  id: string;
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  date: string;        // "2026-05-01"
  timeSlot: string;    // "09:00"
  status: BookingStatus;
  note: string;
  createdAt: Date;
}
