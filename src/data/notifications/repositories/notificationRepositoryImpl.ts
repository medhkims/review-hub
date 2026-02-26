import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { NotificationEntity } from '@/domain/notifications/entities/notificationEntity';
import { NotificationRemoteDataSource } from '../datasources/notificationRemoteDataSource';
import { NotificationMapper } from '../mappers/notificationMapper';
import { NetworkInfo } from '@/core/network/networkInfo';
import { Either, left, right } from '@/core/types/either';
import { Failure, ServerFailure, NetworkFailure } from '@/core/error/failures';
import { ServerException, NetworkException } from '@/core/error/exceptions';

export class NotificationRepositoryImpl implements NotificationRepository {
  constructor(
    private readonly remote: NotificationRemoteDataSource,
    private readonly network: NetworkInfo,
  ) {}

  async getNotifications(userId: string): Promise<Either<Failure, NotificationEntity[]>> {
    try {
      const models = await this.remote.getNotifications(userId);
      const entities = models.map(NotificationMapper.toEntity);
      return right(entities);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async markAsRead(notificationId: string): Promise<Either<Failure, void>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot mark notification as read while offline'));
    }

    try {
      await this.remote.markAsRead(notificationId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async markAllAsRead(userId: string): Promise<Either<Failure, void>> {
    const isOnline = await this.network.isConnected();

    if (!isOnline) {
      return left(new NetworkFailure('Cannot mark all notifications as read while offline'));
    }

    try {
      await this.remote.markAllAsRead(userId);
      return right(undefined);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }

  async getUnreadCount(userId: string): Promise<Either<Failure, number>> {
    try {
      const count = await this.remote.getUnreadCount(userId);
      return right(count);
    } catch (error) {
      if (error instanceof ServerException) {
        return left(new ServerFailure(error.message));
      }
      if (error instanceof NetworkException) {
        return left(new NetworkFailure(error.message));
      }
      return left(new ServerFailure('An unexpected error occurred'));
    }
  }
}
