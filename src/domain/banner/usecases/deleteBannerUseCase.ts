import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { BannerRepository } from '../repositories/bannerRepository';

export class DeleteBannerUseCase {
  constructor(private readonly bannerRepository: BannerRepository) {}

  async execute(id: string): Promise<Either<Failure, void>> {
    return this.bannerRepository.deleteBanner(id);
  }
}
