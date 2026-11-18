// DEPENDENCIES
import { useRef, useState, type ChangeEvent } from 'react'

// STORES
import { useToastStore } from '@/shared/store/toastStore'

// UTILS
import { fileStorage } from '@/shared/lib/fileStorage'
import { todayISO } from '@/shared/lib/isoDate'
import { readBackup } from '../utils/backup'
import { applyBackup, currentVersions } from '../utils/applyBackup'
import { currentBackup } from '../utils/currentBackup'

// TYPES
import type { Backup } from '../types'

// ASSETS
import { IconUndo } from '@/assets/icons/IconUndo'

/**
 * Everything the "Importar backup" row needs, in three steps:
 * 1. `chooseFile` opens the file picker (through the hidden input that gets `inputRef`
 *    and `onFileChosen`).
 * 2. `onFileChosen` reads and checks the file. A bad file gets an alert toast with the
 *    reason; a good one becomes `pending`, which opens the confirm dialog.
 * 3. `confirmImport` saves a safety copy of the current data, loads the backup and shows a
 *    toast with Deshacer. `cancel` drops the pending backup.
 *
 * @example
 * const { inputRef, chooseFile, onFileChosen, pending, cancel, confirmImport } = useImportBackup()
 */
export function useImportBackup() {
  const showToast = useToastStore((state) => state.showToast)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  const chooseFile = () => inputRef.current?.click()

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    // Cleared right away, so picking the same file again still fires `change`
    event.target.value = ''
    if (!file) return

    let text: string
    try {
      text = await file.text()
    } catch {
      showToast('No se pudo leer el archivo.', 'alert')
      return
    }

    const result = readBackup(text, currentVersions())
    if (result.worked === false) {
      showToast(result.reason, 'alert')
      return
    }
    setPending(result.backup)
  }

  const cancel = () => setPending(null)

  const undoImport = async (copy: Backup) => {
    try {
      await applyBackup(copy)
      showToast('Recuperaste tus datos anteriores', 'success')
    } catch (error) {
      console.error('[backup] undo import failed', error)
      showToast('No se pudo deshacer la importación.', 'alert')
    }
  }

  const confirmImport = async () => {
    if (!pending) return
    const backup = pending
    setPending(null)

    // Taken before anything changes: it's what Deshacer, and a failed import, go back to
    const safetyCopy = currentBackup(todayISO())

    try {
      // Also on disk, in case the app dies halfway through
      await fileStorage.setItem('before-import', JSON.stringify(safetyCopy))
      await applyBackup(backup)
      showToast('Backup importado', 'success', {
        action: {
          label: 'Deshacer',
          icon: <IconUndo />,
          onClick: () => undoImport(safetyCopy),
        },
      })
    } catch (error) {
      console.error('[backup] import failed', error)
      // Some stores may already hold the backup: put the old data back so nothing is mixed
      try {
        await applyBackup(safetyCopy)
      } catch (restoreError) {
        console.error('[backup] restoring after a failed import failed too', restoreError)
      }
      showToast('No se pudo importar el backup. Tus datos no cambiaron.', 'alert')
    }
  }

  return { inputRef, chooseFile, onFileChosen, pending, cancel, confirmImport }
}
