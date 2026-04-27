import { BusinessRepository } from '../repositories/businessRepository';
import { BusinessEntity } from '../entities/businessEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetNearbyBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(latitude: number, longitude: number, radiusKm: number = 10): Promise<Either<Failure, BusinessEntity[]>> {
    return this.businessRepository.getNearbyBusinesses(latitude, longitude, radiusKm);
  }
}
