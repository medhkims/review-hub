import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BannerRepository, CreateBannerParams } from '../repositories/bannerRepository';
import { BannerEntity } from '../entities/bannerEntity';

export class CreateBannerUseCase {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async execute(params: CreateBannerParams): Promise<Either<Failure, BannerEntity>> {
    return this.bannerRepository.createBanner(params);
  }
}
