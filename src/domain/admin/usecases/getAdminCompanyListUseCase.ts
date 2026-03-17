import { AdminRepository } from '../repositories/adminRepository';
import { CompanyFilter, CompanyRankItem } from '../entities/adminDashboardEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetAdminCompanyListUseCase {
  constructor(private readonly adminRepository: AdminRepository) {}

  async execute(filter: CompanyFilter): Promise<Either<Failure, CompanyRankItem[]>> {
    return this.adminRepository.getCompanyList(filter);
  }
}
