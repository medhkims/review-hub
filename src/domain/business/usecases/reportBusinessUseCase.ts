import { BusinessRepository, ReportBusinessParams } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class ReportBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(params: ReportBusinessParams): Promise<Either<Failure, void>> {
    return this.businessRepository.reportBusiness(params);
  }
}
