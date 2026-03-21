import { CategoryModel, SubcategoryModel, RatingCriterionModel } from '../models/categoryModel';
import { CategoryEntity } from '@/domain/business/entities/categoryEntity';
import { SubcategoryEntity } from '@/domain/business/entities/subcategoryEntity';
import { RatingCriterionEntity } from '@/domain/business/entities/ratingCriterionEntity';

export class CategoryMapper {
  static toEntity(model: CategoryModel, index: number): CategoryEntity {
    return {
      id: model.id,
      name: model.name,
      icon: model.icon,
      logoUrl: model.logo_url,
      sortOrder: model.sort_order ?? index,
      subcategories: (model.subcategories ?? []).map(CategoryMapper.subcategoryToEntity),
      ratingCriteria: (model.rating_criteria ?? []).map(CategoryMapper.ratingCriterionToEntity),
      deletedRatingCriteria: (model.deleted_rating_criteria ?? []).map(CategoryMapper.ratingCriterionToEntity),
      isDeleted: model.is_deleted,
    };
  }

  static toModel(entity: CategoryEntity): CategoryModel {
    return {
      id: entity.id,
      name: entity.name,
      icon: entity.icon,
      logo_url: entity.logoUrl,
      sort_order: entity.sortOrder,
      subcategories: entity.subcategories.map(CategoryMapper.subcategoryToModel),
      rating_criteria: entity.ratingCriteria.map(CategoryMapper.ratingCriterionToModel),
    };
  }

  private static subcategoryToEntity(model: SubcategoryModel): SubcategoryEntity {
    return {
      id: model.id,
      name: model.name,
      categoryId: model.category_id,
      isDeleted: model.is_deleted,
    };
  }

  private static subcategoryToModel(entity: SubcategoryEntity): SubcategoryModel {
    return {
      id: entity.id,
      name: entity.name,
      category_id: entity.categoryId,
    };
  }

  private static ratingCriterionToEntity(model: RatingCriterionModel): RatingCriterionEntity {
    return {
      key: model.key,
      label: model.label,
      icon: model.icon,
    };
  }

  private static ratingCriterionToModel(entity: RatingCriterionEntity): RatingCriterionModel {
    return {
      key: entity.key,
      label: entity.label,
      icon: entity.icon,
    };
  }
}
