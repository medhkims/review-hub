import { SettingsEntity } from '../entities/settingsEntity';
import { Either } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

export interface SettingsRepository {
  getSettings(): Promise<Either<Failure, SettingsEntity>>;
  updateSettings(settings: Partial<SettingsEntity>): Promise<Either<Failure, SettingsEntity>>;
}
