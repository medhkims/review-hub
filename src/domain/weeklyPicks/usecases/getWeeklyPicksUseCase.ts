import { WeeklyPickRepository } from '../repositories/weeklyPickRepository';
import { WeeklyPickEntity } from '../entities/weeklyPickEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class GetWeeklyPicksUseCase {
  constructor(private readonly weeklyPickRepository: WeeklyPickRepository) {}

  async execute(): Promise<Either<Failure, WeeklyPickEntity[]>> {
    return this.weeklyPickRepository.getWeeklyPicks();
  }
}
