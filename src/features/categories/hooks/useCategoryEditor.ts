// DEPENDENCIES
import { useState } from 'react'

// STORES
import { useCategoryStore } from '../store/categoryStore'

// UTILS
import { validateCategoryName } from '../utils/validateCategoryName'

// TYPES
import type { Category } from '@/shared/types'

/** What the category sheet is doing: showing the list, editing a name, or confirming a delete. */
export type EditorMode =
  | { type: 'view' }
  | { type: 'editing'; id: string | 'new' } // 'new' is the add row
  | { type: 'deleting'; id: string }

interface Options {
  /** Called with a newly created category (the form selects it). */
  onCreated: (category: Category) => void
  /** Called after a delete (the form falls back to "Otros" if it was the selected one). */
  onDeleted: (id: string) => void
}

/**
 * State of the category sheet's add / rename / delete flow. It lives in the sheet's
 * parent, not in the picker, because the sheet footer (the buttons) needs it too.
 * `error` is calculated from the draft on every render, so it's never out of date.
 */
export function useCategoryEditor({ onCreated, onDeleted }: Options) {
  const categories = useCategoryStore((state) => state.categories)
  const addCategory = useCategoryStore((state) => state.addCategory)
  const renameCategory = useCategoryStore((state) => state.renameCategory)
  const deleteCategory = useCategoryStore((state) => state.deleteCategory)

  const [mode, setMode] = useState<EditorMode>({ type: 'view' })
  const [draft, setDraft] = useState('')

  // Not stored: it is derived from the draft every render, so it can never be out of date
  const error =
    mode.type === 'editing'
      ? validateCategoryName(draft, categories, mode.id === 'new' ? undefined : mode.id)
      : null

  const reset = () => {
    setMode({ type: 'view' })
    setDraft('')
  }

  const startAdding = () => {
    setDraft('')
    setMode({ type: 'editing', id: 'new' })
  }

  const startEditing = (category: Category) => {
    setDraft(category.name)
    setMode({ type: 'editing', id: category.id })
  }

  const startDeleting = (id: string) => setMode({ type: 'deleting', id })

  const save = () => {
    if (mode.type !== 'editing' || error !== null) return
    if (mode.id === 'new') {
      const created = addCategory(draft)
      if (created) onCreated(created)
    } else {
      renameCategory(mode.id, draft)
    }
    reset()
  }

  const confirmDelete = () => {
    if (mode.type !== 'deleting') return
    deleteCategory(mode.id)
    onDeleted(mode.id)
    reset()
  }

  return {
    mode,
    draft,
    setDraft,
    error,
    startAdding,
    startEditing,
    startDeleting,
    save,
    confirmDelete,
    cancel: reset,
    reset,
  }
}

/** Everything `useCategoryEditor` returns, for the picker and the footer to receive as a prop. */
export type CategoryEditor = ReturnType<typeof useCategoryEditor>
