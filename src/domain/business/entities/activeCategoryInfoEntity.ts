export interface ActiveCategoryInfoEntity {
  /** IDs of categories that have at least one business */
  categoryIds: string[];
  /**
   * Maps each category ID to the set of subcategory names that have at least
   * one business (derived from the business's sub_category / category_name fields).
   */
  subcategoryNamesByCategoryId: Record<string, string[]>;
}
