import { useToastStore } from '@/shared/store/toastStore'
import { todayISO } from '@/shared/lib/isoDate'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { storeSnapshot } from '../utils/storeSnapshot'
import { createBackup, backupFileName } from '../utils/backup'
import { saveBackupFile } from '../utils/saveBackupFile'

export function useExportBackup() {
  const showToast = useToastStore((state) => state.showToast)

  async function exportBackup() {
    try {
      const today = todayISO()
      const backup = createBackup(
        {
          subscriptions: storeSnapshot(useSubscriptionStore),
          categories: storeSnapshot(useCategoryStore),
          settings: storeSnapshot(useSettingsStore),
        },
        __APP_VERSION__,
        today,
      )
      const text = JSON.stringify(backup, null, 2)
      await saveBackupFile(backupFileName(today), text)
    } catch (error) {
      console.error(`Backup export failed`, error)
      showToast('No se pudo exportar el backup. Prueba de nuevo.', 'alert')
    }
  }

  return exportBackup
}
