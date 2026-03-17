import { AdminInfoEntity } from '../entities/adminInfoEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface AdminInfoRepository {
  getAdminInfo(): Promise<Either<Failure, AdminInfoEntity>>;
  updateAdminInfo(info: AdminInfoEntity): Promise<Either<Failure, void>>;
  uploadAdminPicture(uri: string, mimeType?: string): Promise<Either<Failure, string>>;
}
