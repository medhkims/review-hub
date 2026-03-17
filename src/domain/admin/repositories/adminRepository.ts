import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AdminDashboardStats, CompanyFilter, CompanyRankItem } from '../entities/adminDashboardEntity';

export interface AdminRepository {
  getDashboardStats(): Promise<Either<Failure, AdminDashboardStats>>;
  getCompanyList(filter: CompanyFilter): Promise<Either<Failure, CompanyRankItem[]>>;
}
