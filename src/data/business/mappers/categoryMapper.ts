import { CategoryModel } from '../models/categoryModel';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';

export class CategoryMapper {
  static toEntity(model: CategoryModel, index: number): CategoryEntity {
    return {
      id: model.id,
      name: model.name,
      icon: model.icon,
      sortOrder: index,
    };
  }

  static toModel(entity: CategoryEntity): CategoryModel {
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
    };
  }
}
