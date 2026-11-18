// DEPENDENCIES
import { Capacitor } from '@capacitor/core'
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'

/**
 * Hands a backup file to the user.
 * - On the phone: writes it to the app's cache folder (the FileProvider already shares from
 *   there) and opens Android's Share sheet, so it can go to Drive, WhatsApp, Files...
 *   Closing the sheet is not an error: the plugin rejects with "Share canceled" and this
 *   returns quietly. Any other failure is thrown for the caller to show.
 * - In a browser (`npm run dev`, later the desktop app): downloads it with a temporary link.
 */
export async function saveBackupFile(fileName: string, text: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: text,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    })
    try {
      await Share.share({ title: 'Backup de Aldia', files: [uri] })
    } catch (error) {
      if (error instanceof Error && error.message === 'Share canceled') {
        return
      }
      throw error
    }
    return
  }
  const blob = new Blob([text], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
