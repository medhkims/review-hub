import { BusinessRepository } from '../repositories/businessRepository';
import { NotificationRepository } from '@/domain/notifications/repositories/notificationRepository';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface RejectBusinessParams {
  businessId: string;
  ownerId: string;
  businessName: string;
}

export class RejectBusinessUseCase {
  constructor(
    private readonly businessRepository: BusinessRepository,
    private readonly notificationRepository: NotificationRepository,
  ) {}

  async execute(params: RejectBusinessParams): Promise<Either<Failure, void>> {
    const result = await this.businessRepository.rejectBusiness(params.businessId);
    if (result.isRight()) {
      this.notificationRepository.createNotification({
        userId: params.ownerId,
        type: 'business_rejected',
        title: 'Business Not Approved',
        body: `Your business "${params.businessName}" was not approved at this time.`,
        referenceId: params.businessId,
        referenceType: 'business',
        imageUrl: null,
      });
    }
    return result.isRight() ? right(undefined) : result;
  }
}
