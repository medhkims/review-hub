import { SubcategoryEntity } from './subcategoryEntity';
import { RatingCriterionEntity } from './ratingCriterionEntity';

export interface CategoryEntity {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
  subcategories: SubcategoryEntity[];
  ratingCriteria: RatingCriterionEntity[];
}
