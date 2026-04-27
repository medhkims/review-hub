import { BookingConfigModel } from '../models/bookingConfigModel';
import { BookingConfigEntity } from '@/domain/booking/entities/bookingConfigEntity';

export class BookingConfigMapper {
  static toEntity(model: BookingConfigModel): BookingConfigEntity {
    return {
      isEnabled: model.is_enabled,
      slotDurationMinutes: model.slot_duration_minutes,
      availableDays: Array.isArray(model.available_days) ? model.available_days : [],
      availableTimeSlots: Array.isArray(model.available_time_slots)
        ? model.available_time_slots.map((s) => ({ start: s.start, end: s.end }))
        : [],
    };
  }

  static toModel(entity: BookingConfigEntity): BookingConfigModel {
    return {
      is_enabled: entity.isEnabled,
      slot_duration_minutes: entity.slotDurationMinutes,
      available_days: entity.availableDays,
      available_time_slots: entity.availableTimeSlots.map((s) => ({ start: s.start, end: s.end })),
    };
  }
}
