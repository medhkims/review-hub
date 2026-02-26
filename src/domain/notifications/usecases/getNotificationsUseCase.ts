import { NotificationRepository } from '../repositories/notificationRepository';
import { NotificationEntity } from '../entities/notificationEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetNotificationsUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(userId: string): Promise<Either<Failure, NotificationEntity[]>> {
    return this.notificationRepository.getNotifications(userId);
  }
}
