// TYPES
import type { CategoryEditor } from '@/features/categories/hooks/useCategoryEditor'

// COMPONENTS
import Button from '@/shared/ui/Button/Button'

interface Props {
  editor: CategoryEditor
}

// The sheet footer shows the buttons of whatever the picker is doing right now.
// The footer keeps the primary action first: it renders at the bottom (column-reverse).
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
