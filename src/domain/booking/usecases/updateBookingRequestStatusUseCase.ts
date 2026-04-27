import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingStatus } from '../entities/bookingRequestEntity';
import { BookingRepository } from '../repositories/bookingRepository';

export class UpdateBookingRequestStatusUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(requestId: string, status: BookingStatus): Promise<Either<Failure, void>> {
    return this.repository.updateBookingRequestStatus(requestId, status);
  }
}
