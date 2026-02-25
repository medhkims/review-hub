import { BusinessRepository, RegisterBusinessParams } from '../repositories/businessRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export { type RegisterBusinessParams } from '../repositories/businessRepository';

export class RegisterBusinessUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(params: RegisterBusinessParams): Promise<Either<Failure, string>> {
    return this.businessRepository.registerBusiness(params);
  }
}
