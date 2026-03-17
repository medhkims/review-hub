import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BannerRepository } from '../repositories/bannerRepository';
import { BannerEntity } from '../entities/bannerEntity';

export class GetBannersUseCase {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async execute(): Promise<Either<Failure, BannerEntity[]>> {
    return this.bannerRepository.getBanners();
  }
}
