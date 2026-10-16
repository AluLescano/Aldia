// COMPONENTS
import Button from '@/shared/ui/Button/Button'

// TYPES
import type { CategoryEditor } from '../../hooks/useCategoryEditor'

interface Props {
  /** The same editor `CategoryPicker` gets. */
  editor: CategoryEditor
}

/**
 * The category sheet's footer: the buttons for whatever the picker is doing right now
 * ("Agregar otra categoría", or Guardar / Eliminar + Cancelar). The primary action is
 * written first; the footer shows it at the bottom (column-reverse).
 */
const CategoryFooter = ({ editor }: Props) => {
  const { mode } = editor

  if (mode.type === 'editing') {
    return (
      <>
        <Button
          type="button"
          variant="primary"
          size="large"
          width="full"
          disabled={editor.error !== null}
          onClick={editor.save}
        >
          Guardar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="large"
          width="full"
          onClick={editor.cancel}
        >
          Cancelar
        </Button>
      </>
    )
  }

  if (mode.type === 'deleting') {
    return (
      <>
        <Button
          type="button"
          variant="primary"
          size="large"
          width="full"
          onClick={editor.confirmDelete}
        >
          Eliminar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="large"
          width="full"
          onClick={editor.cancel}
        >
          Cancelar
        </Button>
      </>
    )
  }

  return (
    <Button
      type="button"
      variant="primary"
      size="large"
      width="full"
      onClick={editor.startAdding}
    >
      Agregar otra categoría
    </Button>
  )
}

export default CategoryFooter
