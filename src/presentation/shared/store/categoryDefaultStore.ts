import { create } from 'zustand';
import { CategoryDefaultEntity } from '@/domain/categoryDefaults/entities/categoryDefaultEntity';
import { container } from '@/core/di/container';

interface CategoryDefaultState {
  defaults: Record<string, CategoryDefaultEntity>;
  isLoaded: boolean;
  load: () => Promise<void>;
  setDefault: (entity: CategoryDefaultEntity) => void;
}

export const useCategoryDefaultStore = create<CategoryDefaultState>((set, get) => ({
  defaults: {},
  isLoaded: false,
  load: async () => {
    if (get().isLoaded) return;
    const result = await container.getCategoryDefaultsUseCase.execute();
    result.fold(
      () => set({ isLoaded: true }),
      (data) => {
        const map: Record<string, CategoryDefaultEntity> = {};
        data.forEach((d) => { map[d.categoryId] = d; });
        set({ defaults: map, isLoaded: true });
      },
    );
  },
  setDefault: (entity) =>
    set((state) => ({ defaults: { ...state.defaults, [entity.categoryId]: entity } })),
}));
