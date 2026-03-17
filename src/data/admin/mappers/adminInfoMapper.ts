import { AdminInfoModel } from '../models/adminInfoModel';
import { AdminInfoEntity, VisibleTo } from '@/domain/admin/entities/adminInfoEntity';

export class AdminInfoMapper {
  static toEntity(model: AdminInfoModel): AdminInfoEntity {
    return {
      pictureUrl: model.picture_url,
      address: model.address
        ? { value: model.address.value, visibleTo: model.address.visible_to as VisibleTo[] }
        : null,
      emails: model.emails.map((e) => ({
        id: e.id,
        label: e.label,
        value: e.value,
        visibleTo: e.visible_to as VisibleTo[],
      })),
      phones: model.phones.map((p) => ({
        id: p.id,
        label: p.label,
        value: p.value,
        visibleTo: p.visible_to as VisibleTo[],
      })),
    };
  }

  static toModel(entity: AdminInfoEntity): AdminInfoModel {
    return {
      picture_url: entity.pictureUrl,
      address: entity.address
        ? { value: entity.address.value, visible_to: entity.address.visibleTo }
        : null,
      emails: entity.emails.map((e) => ({
        id: e.id,
        label: e.label,
        value: e.value,
        visible_to: e.visibleTo,
      })),
      phones: entity.phones.map((p) => ({
        id: p.id,
        label: p.label,
        value: p.value,
        visible_to: p.visibleTo,
      })),
    };
  }
}
