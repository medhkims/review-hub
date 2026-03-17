import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { BannerRepository, CreateBannerParams, UpdateBannerParams } from '@/domain/banner/repositories/bannerRepository';
import { BannerEntity } from '@/domain/banner/entities/bannerEntity';
import { BannerRemoteDataSource } from '../datasources/bannerRemoteDataSource';
import { BannerMapper } from '../mappers/bannerMapper';

export class BannerRepositoryImpl implements BannerRepository {
  constructor(private readonly remote: BannerRemoteDataSource) {}

  async getBanners(): Promise<Either<Failure, BannerEntity[]>> {
    try {
      const models = await this.remote.getBanners();
      return right(models.map(BannerMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to load banners'));
    }
  }

  async getAllBanners(): Promise<Either<Failure, BannerEntity[]>> {
    try {
      const models = await this.remote.getAllBanners();
      return right(models.map(BannerMapper.toEntity));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to load banners'));
    }
  }

  async createBanner(params: CreateBannerParams): Promise<Either<Failure, BannerEntity>> {
    try {
      const model = await this.remote.createBanner(params);
      return right(BannerMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to create banner'));
    }
  }

  async updateBanner(id: string, params: UpdateBannerParams): Promise<Either<Failure, BannerEntity>> {
    try {
      const model = await this.remote.updateBanner(id, params);
      return right(BannerMapper.toEntity(model));
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update banner'));
    }
  }

  async deleteBanner(id: string): Promise<Either<Failure, void>> {
    try {
      await this.remote.deleteBanner(id);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to delete banner'));
    }
  }
}
