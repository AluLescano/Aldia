// HOOKS
import { useExportBackup } from '@/features/backup/hooks/useExportBackup'
import { useImportBackup } from '@/features/backup/hooks/useImportBackup'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import ConfirmDialog from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import SettingsRow from '@/features/settings/components/SettingsRow/SettingsRow'

// UTILS
import { formatDate } from '@/shared/lib/formatDate'
import { backupSummary } from '@/features/backup/utils/backupSummary'

// ASSETS
import { IconDownload } from '@/assets/icons/IconDownload'
import { IconUpload } from '@/assets/icons/IconUpload'
import { IconReplace } from '@/assets/icons/IconReplace'
import { IconFile } from '@/assets/icons/IconFile'
import styles from './SettingsPage.module.scss'

// "1 suscripción" / "12 suscripciones"
const plural = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`

/**
 * The Ajustes tab: the title with the app version, then one group per topic. For now only
 * "Nube y backup": export a JSON backup, or import one after confirming in a dialog that
 * shows what the file brings. More groups (Moneda, Interfaz, Notificaciones…) come later.
 */
const SettingsPage = () => {
  const {
    container,
    header,
    version,
    group,
    label,
    card,
    footnote,
    backupChip,
    backupChipIcon,
    backupChipDetail,
  } = styles

  const exportBackup = useExportBackup()
  const { inputRef, pending, chooseFile, cancel, onFileChosen, confirmImport } =
    useImportBackup()

  const summary = pending ? backupSummary(pending) : null
  const counts = summary
    ? [
        plural(summary.subscriptions, 'suscripción', 'suscripciones'),
        // The 12 default categories come with every install; only the user's own are news
        summary.customCategories > 0 &&
          plural(summary.customCategories, 'categoría propia', 'categorías propias'),
      ]
        .filter(Boolean)
        .join(' · ')
    : ''

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
        {/* No `accept`: some Android pickers grey out .json files from Drive */}
        <input ref={inputRef} type="file" hidden onChange={onFileChosen} />
        <Typography variant="body" size="xs" className={footnote}>
          Tus datos se guardan solo en este teléfono. Exporta un backup para llevarlos a
          otro teléfono o guardarlos donde quieras.
        </Typography>
      </section>
      <ConfirmDialog
        isOpen={pending !== null}
        icon={<IconReplace />}
        tone="danger"
        title="¿Reemplazar tus datos?"
        message="Tus datos de ahora se reemplazan por los de este backup."
        confirmLabel="Reemplazar"
        onCancel={cancel}
        onConfirm={confirmImport}
      >
        {pending && (
          <div className={backupChip}>
            <IconFile className={backupChipIcon} />
            <div>
              <Typography variant="body" size="sm">
                {`Backup del ${formatDate(pending.exportedOn)}`}
              </Typography>
              <Typography variant="body" size="xs" className={backupChipDetail}>
                {counts}
              </Typography>
            </div>
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}

export default SettingsPage
