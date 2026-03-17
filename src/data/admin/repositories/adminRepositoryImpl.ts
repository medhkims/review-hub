import { AdminRepository } from '@/domain/admin/repositories/adminRepository';
import { AdminDashboardStats, CompanyFilter, CompanyRankItem } from '@/domain/admin/entities/adminDashboardEntity';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure } from '@/core/error/failures';
import { ServerException } from '@/core/error/exceptions';
import { AdminRemoteDataSource } from '../datasources/adminRemoteDataSource';

export class AdminRepositoryImpl implements AdminRepository {
  constructor(private readonly remote: AdminRemoteDataSource) {}

  async getDashboardStats(): Promise<Either<Failure, AdminDashboardStats>> {
    try {
      const stats = await this.remote.getDashboardStats();
      return right(stats);
    } catch (error: unknown) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to load admin dashboard'));
    }
  }

  async getCompanyList(filter: CompanyFilter): Promise<Either<Failure, CompanyRankItem[]>> {
    try {
      const list = await this.remote.getCompanyList(filter);
      return right(list);
    } catch (error: unknown) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new ServerFailure('Failed to load company list'));
    }
  }
}
