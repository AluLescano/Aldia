// HOOKS
import { useExportBackup } from '@/features/backup/hooks/useExportBackup'
import { useImportBackup } from '@/features/backup/hooks/useImportBackup'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import SettingsRow from '@/features/settings/components/SettingsRow/SettingsRow'

// ASSETS
import { IconDownload } from '@/assets/icons/IconDownload'
import { IconUpload } from '@/assets/icons/IconUpload'

import styles from './SettingsPage.module.scss'

/**
 * The Ajustes tab: the title with the app version, then one group per topic. For now only
 * "Nube y backup" (export / import a JSON backup); the rows get their actions in the
 * export and import quests. More groups (Moneda, Interfaz, Notificaciones…) come later.
 */
const SettingsPage = () => {
  const { container, header, version, group, label, card, footnote } = styles

  const exportBackup = useExportBackup()
  const { inputRef, chooseFile, onFileChosen } = useImportBackup()

  return (
    <div className={container}>
      <div className={header}>
        <Typography variant="title" size="xl">
          Ajustes
        </Typography>
        <Typography
          variant="label"
          size="xs"
          className={version}
        >{`v${__APP_VERSION__}`}</Typography>
      </div>
      <section className={group}>
        <Typography variant="overline" size="xs" className={label}>
          Nube & Backup
        </Typography>
        <div className={card}>
          <SettingsRow
            icon={<IconDownload />}
            title="Exportar backup"
            description="Guarda tus datos en un archivo"
            onClick={exportBackup}
          />
          <SettingsRow
            icon={<IconUpload />}
            title="Importar backup"
            description="Reemplaza tus datos por los de un archivo"
            onClick={chooseFile}
          />
        </div>
        <input ref={inputRef} type="file" hidden onChange={onFileChosen} />
        <Typography variant="body" size="xs" className={footnote}>
          Tus datos se guardan solo en este teléfono. Exporta un backup para llevarlos a
          otro teléfono o guardarlos donde quieras.
        </Typography>
      </section>
    </div>
  )
}

export default SettingsPage
