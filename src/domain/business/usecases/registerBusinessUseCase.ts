import { BusinessRepository } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface RegisterBusinessParams {
  businessName: string;
  category: string;
  subCategory: string;
  phone: string;
  location: string;
  website: string;
  facebook: string;
  instagram: string;
}

export class RegisterBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(params: RegisterBusinessParams): Promise<Either<Failure, string>> {
    return this.businessRepository.registerBusiness(params);
  }
}
