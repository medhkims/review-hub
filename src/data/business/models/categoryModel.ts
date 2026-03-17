export interface SubcategoryModel {
  id: string;
  name: string;
  category_id: string;
  is_deleted?: boolean;
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
  logo_url?: string;
  sort_order: number;
  subcategories: SubcategoryModel[];
  rating_criteria: RatingCriterionModel[];
  is_deleted?: boolean;
}
