export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "09:30"
}

export interface BookingConfigEntity {
  isEnabled: boolean;
  slotDurationMinutes: number;
  availableDays: string[];     // e.g., ["monday", "tuesday"]
  availableTimeSlots: TimeSlot[];
}
