import { CategoryRepository } from '../repositories/categoryRepository';
import { BusinessRepository } from '../repositories/businessRepository';
import { CategoryEntity } from '../entities/categoryEntity';
import { Either, right } from '@/core/types/either';
import { Failure } from '@/core/error/failures';

/**
 * Returns only the categories (and their subcategories) that have at least
 * one registered business.  Categories with zero businesses are hidden.
 * Subcategories with zero businesses are hidden from the subcategory tab bar.
 *
 * Falls back to the full unfiltered list if the active-info query fails, so
 * the UI never breaks due to a secondary network error.
 */
export class GetActiveCategoriesUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly businessRepository: BusinessRepository,
  ) {}

  async execute(): Promise<Either<Failure, CategoryEntity[]>> {
    const [categoriesResult, activeInfoResult] = await Promise.all([
      this.categoryRepository.getCategories(),
      this.businessRepository.getActiveCategoryInfo(),
    ]);

    // If categories themselves failed, propagate the failure.
    if (categoriesResult.isLeft()) return categoriesResult;

    let filtered: CategoryEntity[] = [];

    categoriesResult.fold(
      () => {},
      (categories) => {
        // If active-info query failed, show all categories unfiltered.
        if (activeInfoResult.isLeft()) {
          filtered = categories;
          return;
        }

        activeInfoResult.fold(
          () => { filtered = categories; },
          (activeInfo) => {
            // Only show categories that have at least one business.
            // If no businesses exist at all, no categories are shown.
            filtered = categories
              .filter((cat) => activeInfo.categoryIds.includes(cat.id))
              .map((cat) => {
                const activeSubs = activeInfo.subcategoryNamesByCategoryId[cat.id] ?? [];

                // Only keep subcategories that have at least one business.
                return {
                  ...cat,
                  subcategories: cat.subcategories.filter((sub) =>
                    activeSubs.includes(sub.name),
                  ),
                };
              });
          },
        );
      },
    );

    return right(filtered);
  }
}
