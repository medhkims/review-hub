import { BusinessRepository } from '../repositories/businessRepository';

export class IncrementSearchCountUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  execute(businessId: string): void {
    // Fire-and-forget — result is intentionally ignored
    this.businessRepository.incrementSearchCount(businessId).catch(() => {});
  }
}
