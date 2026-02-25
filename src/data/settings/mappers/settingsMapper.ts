import { SettingsModel } from '../models/settingsModel';
import { SettingsEntity } from '@/domain/settings/entities/settingsEntity';

export class SettingsMapper {
  static toEntity(model: SettingsModel): SettingsEntity {
    return {
      language: model.language,
      theme: model.theme,
      notificationsEnabled: model.notifications_enabled,
      soundEnabled: model.sound_enabled,
    };
  }

  static toModel(entity: SettingsEntity): SettingsModel {
    return {
      language: entity.language,
      theme: entity.theme,
      notifications_enabled: entity.notificationsEnabled,
      sound_enabled: entity.soundEnabled,
    };
  }
}
