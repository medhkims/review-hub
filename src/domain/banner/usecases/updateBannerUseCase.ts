import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BannerRepository, UpdateBannerParams } from '../repositories/bannerRepository';
import { BannerEntity } from '../entities/bannerEntity';

export class UpdateBannerUseCase {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async execute(id: string, params: UpdateBannerParams): Promise<Either<Failure, BannerEntity>> {
    return this.bannerRepository.updateBanner(id, params);
  }
}
