import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { createId } from '@/shared/lib/id'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'

import type { Category } from '@/shared/types'
import { validateCategoryName } from './utils/validateCategoryName'

export const OTHERS_ID = 'others'

// New categories get the next color of this list (Statistics will need a color per category)
const CATEGORY_COLORS = [
  '#7C6BD6',
  '#4A7FB5',
  '#D9684A',
  '#C1569B',
  '#D9A441',
  '#5CB386',
  '#3E8E7E',
  '#4C9BD5',
]

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'ai', name: 'IA', color: '#7C6BD6' },
  { id: 'business', name: 'Negocios', color: '#4A7FB5' },
  { id: 'entertainment', name: 'Entretenimiento', color: '#D9684A' },
  { id: 'gaming', name: 'Juegos', color: '#C1569B' },
  { id: 'learning', name: 'Aprendizaje', color: '#D9A441' },
  { id: 'lifestyle', name: 'Estilo de vida', color: '#5CB386' },
  { id: 'productivity', name: 'Productividad', color: '#3E8E7E' },
  { id: 'shopping', name: 'Compras', color: '#E0846B' },
  { id: 'storage', name: 'Almacén', color: '#6E7F94' },
  { id: 'technology', name: 'Tecnología', color: '#4C9BD5' },
  { id: 'bills', name: 'Servicios', color: '#C79A3E' },
  { id: OTHERS_ID, name: 'Otros', color: '#8E9FAF' },
]

interface CategoryStore {
  categories: Category[]
  addCategory: (name: string) => Category | null
  renameCategory: (id: string, name: string) => void
  deleteCategory: (id: string) => void
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: DEFAULT_CATEGORIES,

      // Builds the category from the name, and returns it so the picker can select it right away
      addCategory: (name) => {
        if (validateCategoryName(name, get().categories) !== null) return null
        const category: Category = {
          id: `custom-${createId()}`,
          name: name.trim(),
          color: CATEGORY_COLORS[get().categories.length % CATEGORY_COLORS.length],
          isCustom: true,
        }
        set((state) => ({ categories: [...state.categories, category] }))
        return category
      },

      renameCategory: (id, name) => {
        if (id === OTHERS_ID) return
        if (validateCategoryName(name, get().categories, id) !== null) return
        set((state) => ({
          categories: state.categories.map((category) =>
            category.id === id ? { ...category, name: name.trim() } : category,
          ),
        }))
      },

      deleteCategory: (id) => {
        if (id === OTHERS_ID) return
        // First move its subscriptions to "Otros", so none is ever left pointing at nothing
        useSubscriptionStore.getState().reassignCategory(id, OTHERS_ID)
        set((state) => ({
          categories: state.categories.filter((category) => category.id !== id),
        }))
      },
    }),
    { name: 'aldia_categories_v1' },
  ),
)
