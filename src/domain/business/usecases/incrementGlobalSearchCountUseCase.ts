import { BusinessRepository } from '../repositories/businessRepository';

export class IncrementGlobalSearchCountUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  execute(): void {
    // Fire-and-forget — result is intentionally ignored
    this.businessRepository.incrementGlobalSearchCount().catch(() => {});
  }
}
