import { BusinessRepository } from '../repositories/businessRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface SuspendBusinessParams {
  businessId: string;
  ownerId: string;
  businessName: string;
}

export class SuspendBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: SuspendBusinessParams): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.suspendBusiness(params.businessId);
    if (result.isRight()) {
      this.notificationRepository.createNotification({
        userId: params.ownerId,
        type: 'business_rejected',
        title: 'Business Suspended',
        body: `Your business "${params.businessName}" has been suspended by an admin.`,
        referenceId: params.businessId,
        referenceType: 'business',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
