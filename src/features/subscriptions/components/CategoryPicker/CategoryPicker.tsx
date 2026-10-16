// HOOKS
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

// STORE
import { OTHERS_ID, useCategoryStore } from '@/features/categories/categoryStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'

// TYPES
import type { CategoryEditor } from '@/features/categories/useCategoryEditor'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import InputText from '@/shared/ui/InputText/InputText'

// ASSETS
import { IconDelete } from '@/assets/icons/IconDelete'
import { IconEdit } from '@/assets/icons/IconEdit'

import styles from './CategoryPicker.module.scss'

const { list, row, selected, nameButton, actions, iconButton, editRow, confirmRow } =
  styles

// Same entrance and exit as the subscription cards on Home
const rowMotion = {
  initial: { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
}

interface NameInputProps {
  editor: CategoryEditor
}

// The text field that takes the place of a row. Saving and cancelling live in the sheet footer.
const NameInput = ({ editor }: NameInputProps) => {
  // An empty draft is invalid too, but shouting about it before the first key is rude
  const errorMessage =
    editor.draft.trim() !== '' ? (editor.error ?? undefined) : undefined

  return (
    <InputText
      size="medium"
      width="full"
      autoFocus
      enterKeyHint="done"
      aria-label="Nombre de la categoría"
      value={editor.draft}
      errorMessage={errorMessage}
      onChange={(event) => editor.setDraft(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          event.preventDefault() // do not submit the subscription form behind the sheet
          editor.save()
        } else if (event.key === 'Escape') {
          event.stopPropagation() // cancel the edit, but do not close the sheet too
          editor.cancel()
        }
      }}
    />
  )
}

interface Props {
  value: string // the selected category id
  onSelect: (categoryId: string) => void
  editor: CategoryEditor
}

const CategoryPicker = ({ value, onSelect, editor }: Props) => {
  const categories = useCategoryStore((state) => state.categories)
  const subscriptions = useSubscriptionStore((state) => state.subscriptions)
  const reduceMotion = useReducedMotion()
  const { mode } = editor

  const transition = { duration: reduceMotion ? 0 : 0.2 }

  return (
    <ul className={list}>
      {/* popLayout takes an exiting row out of the flow, so the others glide up at once */}
      <AnimatePresence mode="popLayout" initial={false}>
        {categories.map((category) => {
          // What this row is doing right now. The <li> stays the same element in every
          // state (same key), so switching between them never counts as "leaving".
          const state =
            mode.type !== 'view' && mode.id === category.id ? mode.type : 'view'
          const isSelected = category.id === value

          const className =
            state === 'editing'
              ? editRow
              : state === 'deleting'
                ? confirmRow
                : `${row} ${isSelected ? selected : ''}`

          const affected =
            state === 'deleting'
              ? subscriptions.filter(
                  (subscription) => subscription.categoryId === category.id,
                ).length
              : 0

          return (
            // "position" only slides the row to its new place; a full layout animation
            // would stretch the text and the input while the row changes height
            <motion.li
              key={category.id}
              layout="position"
              {...rowMotion}
              transition={transition}
              className={className}
            >
              {state === 'editing' && <NameInput editor={editor} />}

              {state === 'deleting' && (
                <>
                  <Typography variant="body" size="medium">
                    {`¿Eliminar «${category.name}»?`}
                  </Typography>
                  <Typography variant="body" size="small">
                    {affected === 0
                      ? 'Ninguna suscripción la usa.'
                      : `${affected} ${affected === 1 ? 'suscripción pasa' : 'suscripciones pasan'} a Otros.`}
                  </Typography>
                </>
              )}

              {state === 'view' && (
                <>
                  <button
                    type="button"
                    className={nameButton}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(category.id)}
                  >
                    <Typography variant="body" size="medium">
                      {category.name}
                    </Typography>
                  </button>

                  {category.id !== OTHERS_ID && (
                    <div className={actions}>
                      <button
                        type="button"
                        className={iconButton}
                        aria-label={`Editar ${category.name}`}
                        onClick={() => editor.startEditing(category)}
                      >
                        <IconEdit />
                      </button>
                      <button
                        type="button"
                        className={iconButton}
                        aria-label={`Eliminar ${category.name}`}
                        onClick={() => editor.startDeleting(category.id)}
                      >
                        <IconDelete />
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.li>
          )
        })}

        {mode.type === 'editing' && mode.id === 'new' && (
          <motion.li
            key="new"
            layout="position"
            {...rowMotion}
            transition={transition}
            className={editRow}
          >
            <NameInput editor={editor} />
          </motion.li>
        )}
      </AnimatePresence>
    </ul>
  )
}

export default CategoryPicker
