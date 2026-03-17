import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';
import { AdminDashboardStats } from '../entities/adminDashboardEntity';
import { AdminRepository } from '../repositories/adminRepository';

export class GetAdminDashboardStatsUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  execute(): Promise<Either<Failure, AdminDashboardStats>> {
    return this.adminRepository.getDashboardStats();
  }
}
