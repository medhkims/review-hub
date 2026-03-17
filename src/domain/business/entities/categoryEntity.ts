import { SubcategoryEntity } from './subcategoryEntity';
import { RatingCriterionEntity } from './ratingCriterionEntity';

export interface CategoryEntity {
  id: string;
  name: string;
  icon: string;
  logoUrl?: string;
  sortOrder: number;
  subcategories: SubcategoryEntity[];
  ratingCriteria: RatingCriterionEntity[];
  isDeleted?: boolean;
}
