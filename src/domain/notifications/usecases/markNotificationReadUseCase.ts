import { NotificationRepository } from '../repositories/notificationRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class MarkNotificationReadUseCase {
  constructor(private readonly notificationRepository: NotificationRepository) {}

  async execute(notificationId: string): Promise<Either<Failure, void>> {
    return this.notificationRepository.markAsRead(notificationId);
  }
}
