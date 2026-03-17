import { AdminInfoRepository } from '../repositories/adminInfoRepository';
import { AdminInfoEntity } from '../entities/adminInfoEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetAdminInfoUseCase {
  constructor(private readonly repository: AdminInfoRepository) {}

  async execute(): Promise<Either<Failure, AdminInfoEntity>> {
    return this.repository.getAdminInfo();
  }
}
