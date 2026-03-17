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
            // No businesses registered yet — show all categories unfiltered.
            if (activeInfo.categoryIds.length === 0) {
              filtered = categories;
              return;
            }
            const matching = categories
              .filter((cat) => activeInfo.categoryIds.includes(cat.id));

            // If no categories matched the active business data (e.g. a
            // category_id mismatch between businesses and the categories
            // collection), fall back to showing ALL categories so the home
            // screen is never left with an empty category strip.
            if (matching.length === 0) {
              filtered = categories;
              return;
            }

            filtered = matching
              .map((cat) => {
                const activeSubs = activeInfo.subcategoryNamesByCategoryId[cat.id] ?? [];

                // No sub-category data recorded yet — keep all subcategory tabs visible.
                if (activeSubs.length === 0) return cat;

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
