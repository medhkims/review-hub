import { BusinessRepository } from '../repositories/businessRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface AcceptBusinessParams {
  businessId: string;
  ownerId: string;
  businessName: string;
}

export class AcceptBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: AcceptBusinessParams): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.acceptBusiness(params.businessId);
    if (result.isRight()) {
      // Fire-and-forget: notification failure must not block the approval
      this.notificationRepository.createNotification({
        userId: params.ownerId,
        type: 'business_approved',
        title: 'Business Approved',
        body: `Your business "${params.businessName}" has been approved and is now live!`,
        referenceId: params.businessId,
        referenceType: 'business',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
