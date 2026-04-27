import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingConfigEntity } from '../entities/bookingConfigEntity';
import { BookingRequestEntity, BookingStatus } from '../entities/bookingRequestEntity';

export interface CreateBookingParams {
  businessId: string;
  businessName: string;
  userId: string;
  userName: string;
  date: string;
  timeSlot: string;
  note: string;
}

export interface BookingRepository {
  getBookingConfig(businessId: string): Promise<Either<Failure, BookingConfigEntity | null>>;
  updateBookingConfig(businessId: string, config: BookingConfigEntity): Promise<Either<Failure, void>>;
  createBookingRequest(params: CreateBookingParams): Promise<Either<Failure, BookingRequestEntity>>;
  getBookingRequestsForBusiness(businessId: string): Promise<Either<Failure, BookingRequestEntity[]>>;
  getBookingRequestsForUser(userId: string): Promise<Either<Failure, BookingRequestEntity[]>>;
  updateBookingRequestStatus(requestId: string, status: BookingStatus): Promise<Either<Failure, void>>;
}
