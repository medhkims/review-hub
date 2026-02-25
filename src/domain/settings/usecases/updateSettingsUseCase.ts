import { SettingsRepository } from '../repositories/settingsRepository';
import { SettingsEntity } from '../entities/settingsEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export class UpdateSettingsUseCase {
  constructor(private readonly settingsRepository: SettingsRepository) {}

  async execute(settings: Partial<SettingsEntity>): Promise<Either<Failure, SettingsEntity>> {
    return this.settingsRepository.updateSettings(settings);
  }
}
