import { WeeklyPickRepository, CreateWeeklyPickParams } from '../repositories/weeklyPickRepository';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class CreateWeeklyPickUseCase {
  constructor(private readonly weeklyPickRepository: WeeklyPickRepository) {}

  async execute(params: CreateWeeklyPickParams): Promise<Either<Failure, string>> {
    return this.weeklyPickRepository.createWeeklyPick(params);
  }
}
