import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingRequestEntity } from '../entities/bookingRequestEntity';
import { BookingRepository } from '../repositories/bookingRepository';

export class GetBusinessBookingRequestsUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(businessId: string): Promise<Either<Failure, BookingRequestEntity[]>> {
    return this.repository.getBookingRequestsForBusiness(businessId);
  }
}
