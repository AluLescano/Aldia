import { useRef, useState, type ChangeEvent } from 'react'
import { useToastStore } from '@/shared/store/toastStore'
import { readBackup } from '../utils/backup'
import { currentVersions } from '../utils/applyBackup'
import type { Backup } from '../types'

export function useImportBackup() {
  const showToast = useToastStore((state) => state.showToast)
  const inputRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)

  const chooseFile = () => inputRef.current?.click()

  const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
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

  return { inputRef, chooseFile, onFileChosen, pending, cancel }
}
