import { AdminInfoRepository } from '@/domain/admin/repositories/adminInfoRepository';
import { AdminInfoEntity } from '@/domain/admin/entities/adminInfoEntity';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { AdminInfoRemoteDataSource } from '../datasources/adminInfoRemoteDataSource';
import { AdminInfoMapper } from '../mappers/adminInfoMapper';

export class AdminInfoRepositoryImpl implements AdminInfoRepository {
  constructor(private readonly remote: AdminInfoRemoteDataSource) {}

  async getAdminInfo(): Promise<Either<Failure, AdminInfoEntity>> {
    try {
      const model = await this.remote.getAdminInfo();
      return right(AdminInfoMapper.toEntity(model));
    } catch (error: unknown) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to load admin info'));
    }
  }

  async updateAdminInfo(info: AdminInfoEntity): Promise<Either<Failure, void>> {
    try {
      await this.remote.updateAdminInfo(AdminInfoMapper.toModel(info));
      return right(undefined);
    } catch (error: unknown) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to update admin info'));
    }
  }

  async uploadAdminPicture(uri: string, mimeType?: string): Promise<Either<Failure, string>> {
    try {
      const url = await this.remote.uploadAdminPicture(uri, mimeType);
      return right(url);
    } catch (error: unknown) {
      if (error instanceof ServerException) return left(new ServerFailure(error.message));
      return left(new ServerFailure('Failed to upload picture'));
    }
  }
}
