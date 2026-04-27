import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ClaimBusinessParams {
  businessId: string;
  businessName: string;
  claimantUserId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantRole: string;
  proofDescription: string;
}

export class ClaimBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(params: ClaimBusinessParams): Promise<Either<Failure, void>> {
    return this.businessRepository.claimBusiness(params);
  }
}
