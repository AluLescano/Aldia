// DEPENDENCIES
import { useState } from 'react'

// UTILS
import { cn } from '@/shared/lib/cn'
import { formatDayMonth } from '@/shared/lib/formatDate'
import { todayISO } from '@/shared/lib/isoDate'
import { parseInRange } from '@/shared/lib/parseInRange'
import {
  formatDaysBefore,
  nextReminderDate,
  type ChargeSchedule,
} from '../../utils/reminders'

// TYPES
import type { SubscriptionReminder } from '@/shared/types'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import InputStepper from '@/shared/ui/InputStepper/InputStepper'
import IconButton from '@/shared/ui/IconButton/IconButton'

// ASSETS
import { IconBell } from '@/assets/icons/IconBell'
import { IconBellOff } from '@/assets/icons/IconBellOff'
import { IconDelete } from '@/assets/icons/IconDelete'
import styles from './ReminderPicker.module.scss'

const { list, empty, emptyIcon, card, bellIcon, texts, unit, note, secondary } = styles

interface RowProps {
  reminder: SubscriptionReminder
  maxDays: number
  onChangeDays: (days: number) => void
  onRemove: () => void
}

/** One reminder in edit mode: its days before the charge, editable, and a delete button. */
const ReminderRow = ({ reminder, maxDays, onChangeDays, onRemove }: RowProps) => {
  // The typed text, kept apart: it can be empty or out of range for a moment
  const [text, setText] = useState(String(reminder.daysBefore))

  const change = (next: string) => {
    setText(next)
    const days = parseInRange(next, 0, maxDays)
    if (days !== null) onChangeDays(days)
  }

  // While the text is invalid, the label keeps the last good value
  const days = parseInRange(text, 0, maxDays) ?? reminder.daysBefore

  return (
    <div className={card}>
      <InputStepper
        value={text}
        onChange={change}
        min={0}
        max={maxDays}
        label="Días antes del cobro"
        decreaseLabel="Un día menos"
        increaseLabel="Un día más"
      />
      <Typography variant="body" size="md" className={unit}>
        {days === 0 ? 'el mismo día' : days === 1 ? 'día antes' : 'días antes'}
      </Typography>
      <IconButton label="Eliminar notificación" onClick={onRemove}>
        <IconDelete />
      </IconButton>
    </div>
  )
}

interface ViewRowProps {
  reminder: SubscriptionReminder
  schedule: ChargeSchedule
  reminderTime: string
}

/** One reminder in view mode: what it is and when it rings next. */
const ReminderViewRow = ({ reminder, schedule, reminderTime }: ViewRowProps) => {
  const next = nextReminderDate(schedule, reminder, todayISO())

  return (
    <div className={card}>
      {/* Decorative: a plain span, not a button (it does nothing when tapped) */}
      <span className={bellIcon}>
        <IconBell />
      </span>
      <div className={texts}>
        <Typography variant="body" size="md">
          {formatDaysBefore(reminder.daysBefore)}
        </Typography>
        <Typography variant="label" size="sm" className={secondary}>
          {next
            ? `Próxima: ${formatDayMonth(next)}, ${reminderTime}`
            : 'Sin próximos avisos'}
        </Typography>
      </div>
    </div>
  )
}

interface Props {
  /** The subscription's reminders, from the form. */
  reminders: SubscriptionReminder[]
  /** When the charges fall, to show the next notification in view mode. */
  schedule: ChargeSchedule
  /** `HH:MM`, the time every notification rings (from the settings). */
  reminderTime: string
  /** The most days before a charge allowed for this cycle (`maxDaysBefore`). */
  maxDays: number
  /** Shows the note about the trial when there's one. */
  hasTrial: boolean
  onChangeDays: (id: string, days: number) => void
  onRemove: (id: string) => void
  /** View mode: the reminders are only listed, with when each rings next. */
  readOnly?: boolean
}

/**
 * Content of the "Notificaciones" sheet: the subscription's reminders, editable in edit mode
 * ("Agregar notificación" lives in the sheet's footer) and listed in view mode.
 */
const ReminderPicker = ({
  reminders,
  schedule,
  reminderTime,
  maxDays,
  hasTrial,
  onChangeDays,
  onRemove,
  readOnly,
}: Props) => {
  return (
    <div className={list}>
      {reminders.length === 0 && (
        <div className={empty}>
          <span className={emptyIcon}>
            <IconBellOff />
          </span>
          <Typography variant="body" size="md" className={note}>
            Sin notificaciones
          </Typography>
          <Typography variant="body" size="sm" className={cn(note, secondary)}>
            {`Toca ${readOnly ? 'Editar' : 'Agregar notificación'} para que te avisemos antes del cobro.`}
          </Typography>
        </div>
      )}
      {reminders.map((reminder) =>
        readOnly ? (
          <ReminderViewRow
            key={reminder.id}
            reminder={reminder}
            schedule={schedule}
            reminderTime={reminderTime}
          />
        ) : (
          <ReminderRow
            key={reminder.id}
            reminder={reminder}
            maxDays={maxDays}
            onChangeDays={(days) => onChangeDays(reminder.id, days)}
            onRemove={() => onRemove(reminder.id)}
          />
        ),
      )}
      {hasTrial && reminders.length > 0 && (
        <Typography variant="label" size="sm" className={cn(note, secondary)}>
          La primera vez, te avisaremos cuando termine tu período de prueba.
        </Typography>
      )}
    </div>
  )
}

export default ReminderPicker
