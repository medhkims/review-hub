import { WeeklyPickRepository } from '../repositories/weeklyPickRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class DeleteWeeklyPickUseCase {
  constructor(private readonly weeklyPickRepository: WeeklyPickRepository) {}

  async execute(id: string): Promise<Either<Failure, void>> {
    return this.weeklyPickRepository.deleteWeeklyPick(id);
  }
}
