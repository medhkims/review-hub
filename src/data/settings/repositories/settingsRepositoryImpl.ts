import { SettingsRepository } from '@/domain/settings/repositories/settingsRepository';
import { SettingsEntity } from '@/domain/settings/entities/settingsEntity';
import { SettingsLocalDataSource } from '../datasources/settingsLocalDataSource';
import { SettingsMapper } from '../mappers/settingsMapper';
import { Either, left, right } from '@/core/types/either';
import { Failure, CacheFailure } from '@/core/error/failures';
import { CacheException } from '@/core/error/exceptions';

export class SettingsRepositoryImpl implements SettingsRepository {
  constructor(private readonly localDataSource: SettingsLocalDataSource) {}

  async getSettings(): Promise<Either<Failure, SettingsEntity>> {
    try {
      const model = await this.localDataSource.getSettings();
      const entity = SettingsMapper.toEntity(model);
      return right(entity);
    } catch (error) {
      if (error instanceof CacheException) {
        return left(new CacheFailure(error.message));
      }
      return left(new CacheFailure('Failed to get settings'));
    }
  }

  async updateSettings(partialSettings: Partial<SettingsEntity>): Promise<Either<Failure, SettingsEntity>> {
    try {
      // Convert entity to model for the partial update
      const partialModel: Partial<import('../models/settingsModel').SettingsModel> = {};

      if (partialSettings.language !== undefined) {
        partialModel.language = partialSettings.language;
      }
      if (partialSettings.theme !== undefined) {
        partialModel.theme = partialSettings.theme;
      }
      if (partialSettings.notificationsEnabled !== undefined) {
        partialModel.notifications_enabled = partialSettings.notificationsEnabled;
      }
      if (partialSettings.soundEnabled !== undefined) {
        partialModel.sound_enabled = partialSettings.soundEnabled;
      }

      const updatedModel = await this.localDataSource.updateSettings(partialModel);
      const entity = SettingsMapper.toEntity(updatedModel);
      return right(entity);
    } catch (error) {
      if (error instanceof CacheException) {
        return left(new CacheFailure(error.message));
      }
      return left(new CacheFailure('Failed to update settings'));
    }
  }
}
