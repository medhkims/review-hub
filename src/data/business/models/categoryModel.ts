export interface SubcategoryModel {
  id: string;
  name: string;
  category_id: string;
}

export interface RatingCriterionModel {
  key: string;
  label: string;
  icon: string;
}

export interface CategoryModel {
  id: string;
  name: string;
  icon: string;
  subcategories: SubcategoryModel[];
  rating_criteria: RatingCriterionModel[];
}
