import { BusinessRepository } from '../repositories/businessRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface ReApproveBusinessParams {
  businessId: string;
  ownerId: string;
  businessName: string;
}

export class ReApproveBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: ReApproveBusinessParams): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.reApproveBusiness(params.businessId);
    if (result.isRight()) {
      this.notificationRepository.createNotification({
        userId: params.ownerId,
        type: 'business_approved',
        title: 'Business Re-Approved',
        body: `Your business "${params.businessName}" has been approved and is now live again!`,
        referenceId: params.businessId,
        referenceType: 'business',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
