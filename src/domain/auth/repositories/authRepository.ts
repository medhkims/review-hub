import { UserEntity } from '../entities/userEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface AuthRepository {
  signIn(email: string, password: string): Promise<Either<Failure, UserEntity>>;
  signUp(email: string, password: string, displayName: string): Promise<Either<Failure, UserEntity>>;
  signOut(): Promise<Either<Failure, void>>;
  getCurrentUser(): Promise<Either<Failure, UserEntity | null>>;
}
