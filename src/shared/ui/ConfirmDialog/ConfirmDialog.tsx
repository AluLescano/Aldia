// DEPENDENCIES
import { useEffect, useRef, type ReactNode } from 'react'

// HOOKS
import { useBackHandler } from '@/shared/hooks/useBackHandler'

// COMPONENTS
import Typography from '../Typography/Typography'
import Button from '../Button/Button'

// ASSETS
import styles from './ConfirmDialog.module.scss'

interface Props {
  /** Shows the dialog while `true`. The parent owns this state (usually "is something pending?"). */
  isOpen: boolean
  /** Optional icon in a tile next to the title, e.g. `<IconReplace />`. */
  icon?: ReactNode
  title: string
  message: string
  /** The confirm button's text, a verb: "Reemplazar", "Eliminar". */
  confirmLabel: string
  /** Defaults to `'Cancelar'`. */
  cancelLabel?: string
  /**
   * `danger` makes the confirm button soft red and the icon tile amber, for actions that
   * replace or delete data. Defaults to `default` (brand green).
   */
  tone?: 'default' | 'danger'
  /** Extra content under the message, e.g. a summary of what's about to change. */
  children?: ReactNode
  onConfirm: () => void
  /** Runs on Cancelar, the Android back button and Esc. It should set `isOpen` to `false`. */
  onCancel: () => void
}

/**
 * A "stop and decide" question in the middle of the screen, with Cancelar and a confirm button.
 * Built on the browser's own `<dialog>` opened with `showModal()`: the screen behind can't be
 * tapped, focus stays inside, and it returns to whatever opened it on close. Cancelar gets the
 * focus first, so a stray Enter never confirms a destructive action.
 *
 * @example
 * <ConfirmDialog
 *   isOpen={pending !== null}
 *   icon={<IconReplace />}
 *   tone="danger"
 *   title="¿Reemplazar tus datos?"
 *   message="Tus datos de ahora se reemplazan por los de este backup."
 *   confirmLabel="Reemplazar"
 *   onConfirm={confirmImport}
 *   onCancel={cancel}
 * />
 */
export default function ConfirmDialog({
  isOpen,
  icon,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  tone = 'default',
  children,
  onConfirm,
  onCancel,
}: Props) {
  const { dialog, heading, iconTile, iconTileDanger, text, actions, action } = styles
  const dialogRef = useRef<HTMLDialogElement>(null)

  // A <dialog> is opened by calling it, not with a prop: keep it in step with `isOpen`
  useEffect(() => {
    const element = dialogRef.current
    if (!element) return

    if (isOpen && !element.open) element.showModal()
    else if (!isOpen && element.open) element.close()
  }, [isOpen])

  // App.tsx takes the Android back button for itself, so the dialog never hears it on its own
  useBackHandler(onCancel, isOpen)

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      // Esc on a computer: let our state close it, so `isOpen` never goes out of sync
      onCancel={(event) => {
        event.preventDefault()
        onCancel()
      }}
      className={dialog}
    >
      <div className={heading}>
        {icon && (
          <span
            className={tone === 'danger' ? `${iconTile} ${iconTileDanger}` : iconTile}
          >
            {icon}
          </span>
        )}
        <Typography variant="title" size="md">
          {title}
        </Typography>
      </div>
      <Typography variant="body" size="sm" className={text}>
        {message}
      </Typography>
      {children}
      <div className={actions}>
        <Button
          variant="secondary"
          size="medium"
          autoFocus
          onClick={onCancel}
          className={action}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={tone === 'danger' ? 'danger' : 'primary'}
          size="medium"
          onClick={onConfirm}
          className={action}
        >
          {confirmLabel}
        </Button>
      </div>
    </dialog>
  )
}
