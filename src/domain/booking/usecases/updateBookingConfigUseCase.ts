import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BookingConfigEntity } from '../entities/bookingConfigEntity';
import { BookingRepository } from '../repositories/bookingRepository';

export class UpdateBookingConfigUseCase {
  constructor(private readonly repository: BookingRepository) {}

  async execute(businessId: string, config: BookingConfigEntity): Promise<Either<Failure, void>> {
    return this.repository.updateBookingConfig(businessId, config);
  }
}
