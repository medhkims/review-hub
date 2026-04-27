import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingConfigEntity } from '../entities/bookingConfigEntity';
import { BookingRepository } from '../repositories/bookingRepository';

export class GetBookingConfigUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(businessId: string): Promise<Either<Failure, BookingConfigEntity | null>> {
    return this.repository.getBookingConfig(businessId);
  }
}
