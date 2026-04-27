export interface TimeSlotModel {
  start: string;
  end: string;
}

export interface BookingConfigModel {
  is_enabled: boolean;
  slot_duration_minutes: number;
  available_days: string[];
  available_time_slots: TimeSlotModel[];
}
