import { AuthRepository } from '@/domain/auth/repositories/authRepository';
import { UserEntity } from '@/domain/auth/entities/userEntity';
import { UserRole } from '@/core/types/userRole';
import { AuthRemoteDataSource } from '../datasources/authRemoteDataSource';
import { AuthLocalDataSource } from '../datasources/authLocalDataSource';
import { UserMapper } from '../mappers/userMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure, AuthFailure, CacheFailure } from '@/core/error/failures';
import { AuthException, ServerException, CacheException } from '@/core/error/exceptions';

export class AuthRepositoryImpl implements AuthRepository {
  constructor(
    private readonly remoteDataSource: AuthRemoteDataSource,
    private readonly localDataSource: AuthLocalDataSource
  ) {}

  async signIn(email: string, password: string): Promise<Either<Failure, UserEntity>> {
    try {
      const model = await this.remoteDataSource.signIn(email, password);
      const entity = UserMapper.toEntity(model);

      // Cache the user
      await this.localDataSource.cacheUser(model);

      return right(entity);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new NetworkFailure('Connection failed'));
    }
  }

  async signUp(email: string, password: string, displayName: string, role?: UserRole, phoneNumber?: string): Promise<Either<Failure, UserEntity>> {
    try {
      const model = await this.remoteDataSource.signUp(email, password, displayName, role, phoneNumber);
      const entity = UserMapper.toEntity(model);

      // Cache the user
      await this.localDataSource.cacheUser(model);

      return right(entity);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new NetworkFailure('Connection failed'));
    }
  }

  async signOut(): Promise<Either<Failure, void>> {
    try {
      await this.remoteDataSource.signOut();
      await this.localDataSource.clearCache();
      return right(undefined);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      if (error instanceof CacheException) {
        // Still return success if only cache clear failed
        return right(undefined);
      }
      return left(new NetworkFailure('Sign out failed'));
    }
  }

  async getCurrentUser(): Promise<Either<Failure, UserEntity | null>> {
    try {
      // Try to get from remote first
      const model = await this.remoteDataSource.getCurrentUser();

      if (model === null) {
        // Clear cache if no remote user
        await this.localDataSource.clearCache();
        return right(null);
      }

      const entity = UserMapper.toEntity(model);

      // Update cache
      await this.localDataSource.cacheUser(model);

      return right(entity);
    } catch (error) {
      // If remote fails, try cache
      try {
        const cachedModel = await this.localDataSource.getCachedUser();
        if (cachedModel === null) {
          return right(null);
        }
        const entity = UserMapper.toEntity(cachedModel);
        return right(entity);
      } catch (cacheError) {
        if (error instanceof ServerException) {
          return left(new ServerFailure(error.message));
        }
        return left(new CacheFailure('Failed to get current user'));
      }
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<Either<Failure, void>> {
    try {
      await this.remoteDataSource.changePassword(currentPassword, newPassword);
      return right(undefined);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      return left(new NetworkFailure('Failed to change password'));
    }
  }

  async signInWithGoogle(): Promise<Either<Failure, UserEntity>> {
    try {
      const model = await this.remoteDataSource.signInWithGoogle();
      const entity = UserMapper.toEntity(model);

      // Cache the user
      await this.localDataSource.cacheUser(model);

      return right(entity);
    } catch (error) {
      if (error instanceof AuthException) {
        return left(new AuthFailure(error.message));
      }
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      return left(new NetworkFailure('Google sign in failed'));
    }
  }
}
