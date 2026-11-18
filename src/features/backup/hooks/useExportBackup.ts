// STORES
import { useToastStore } from '@/shared/store/toastStore'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { backupFileName } from '../utils/backup'
import { saveBackupFile } from '../utils/saveBackupFile'
import { currentBackup } from '../utils/currentBackup'

/**
 * The "Exportar backup" action: builds today's backup, then shares it (phone) or downloads
 * it (browser). A failure shows an alert toast; a share the user closes is not a failure.
 *
 * @example
 * const exportBackup = useExportBackup()
 * <SettingsRow title="Exportar backup" onClick={exportBackup} />
 */
export function useExportBackup() {
  const showToast = useToastStore((state) => state.showToast)

  async function exportBackup() {
    try {
      const today = todayISO()
      const backup = currentBackup(today)
      const text = JSON.stringify(backup, null, 2)
      await saveBackupFile(backupFileName(today), text)
    } catch (error) {
      console.error('[backup] export failed', error)
      showToast('No se pudo exportar el backup. Prueba de nuevo.', 'alert')
    }
  }

  return exportBackup
}
