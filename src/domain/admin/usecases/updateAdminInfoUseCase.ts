import { AdminInfoRepository } from '../repositories/adminInfoRepository';
import { AdminInfoEntity } from '../entities/adminInfoEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateAdminInfoUseCase {
  constructor(private readonly repository: AdminInfoRepository) {}

  async execute(info: AdminInfoEntity): Promise<Either<Failure, void>> {
    return this.repository.updateAdminInfo(info);
  }
}
