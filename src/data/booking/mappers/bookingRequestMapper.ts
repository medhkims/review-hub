import { BookingRequestModel } from '../models/bookingRequestModel';
import { BookingRequestEntity } from '@/domain/booking/entities/bookingRequestEntity';

export class BookingRequestMapper {
  static toEntity(model: BookingRequestModel): BookingRequestEntity {
    return {
      id: model.id,
      businessId: model.business_id,
      businessName: model.business_name,
      userId: model.user_id,
      userName: model.user_name,
      date: model.date,
      timeSlot: model.time_slot,
      status: model.status,
      note: model.note,
      createdAt: model.created_at?.toDate?.() ?? new Date(),
    };
  }
}
