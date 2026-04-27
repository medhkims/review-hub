import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingRequestEntity } from '../entities/bookingRequestEntity';
import { BookingRepository, CreateBookingParams } from '../repositories/bookingRepository';

export class CreateBookingRequestUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(params: CreateBookingParams): Promise<Either<Failure, BookingRequestEntity>> {
    return this.repository.createBookingRequest(params);
  }
}
