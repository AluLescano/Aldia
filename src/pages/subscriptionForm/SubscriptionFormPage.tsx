// DEPENDENCIES
import { useState } from 'react'

// STORES
import { useUIStore } from '@/shared/store/uiStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store/settingsStore'
import { useToastStore } from '@/shared/store/toastStore'
import { useCategoryStore } from '@/features/categories/store/categoryStore'

// COMPONENTS
import IconButton from '@/shared/ui/IconButton/IconButton'
import SubscriptionForm from '@/features/subscriptions/components/SubscriptionForm/SubscriptionForm'
import PauseToggleIcon from '@/features/subscriptions/components/PauseToggleIcon/PauseToggleIcon'
import PriceChangeSheet from '@/features/subscriptions/components/PriceChangeSheet/PriceChangeSheet'
import ScheduleChangeSheet from '@/features/subscriptions/components/ScheduleChangeSheet/ScheduleChangeSheet'

// HOOKS
import { useSubscriptionActions } from '@/features/subscriptions/hooks/useSubscriptionActions'
import { useBackHandler } from '@/shared/hooks/useBackHandler'

// UTILS
import { createId } from '@/shared/lib/id'
import { todayISO } from '@/shared/lib/isoDate'
import { nextScheduledCharge } from '@/features/subscriptions/utils/schedule'
import {
  applyScheduleEdit,
  editAnchor,
  sameCycle,
} from '@/features/subscriptions/utils/scheduleEdit'
import {
  applyPriceEdit,
  pastCharges,
  upcomingPrice,
} from '@/features/subscriptions/utils/subscriptionHistory'
import { subscriptionToFormValues } from '@/features/subscriptions/utils/subscriptionToFormValues'
import { newSubscriptionValues } from '@/features/subscriptions/utils/newSubscriptionValues'
import {
  formValuesToSubscriptionData,
  type SubscriptionData,
} from '@/features/subscriptions/utils/formValuesToSubscriptionData'

// TYPES
import type { SubscriptionFormValues } from '@/features/subscriptions/types'
import type { Preset, Schedule } from '@/shared/types'

// ASSETS
import { IconEdit } from '@/assets/icons/IconEdit'
import { IconDelete } from '@/assets/icons/IconDelete'

import styles from './SubscriptionFormPage.module.scss'
import PageHeader from '@/shared/ui/PageHeader/PageHeader'

interface Props {
  /** The preset picked to create a subscription from. Ignored when `subscriptionId` is set. */
  preset?: Preset
  /** Opens an existing subscription in view mode (edit, pause and delete from the header). */
  subscriptionId?: string
  /** A new one's first charge, when it was added from a Calendario day. Missing = today. */
  firstBillDate?: string
}

/**
 * Overlay screen for one subscription. Without `subscriptionId` it creates a new one
 * (from a preset or empty); with it, it shows the saved one and can edit, pause or delete it.
 */
export const SubscriptionFormPage = ({
  preset,
  subscriptionId,
  firstBillDate,
}: Props) => {
  const { container } = styles
  const popOverlay = useUIStore((state) => state.popOverlay)
  const closeAllOverlays = useUIStore((state) => state.closeAllOverlays)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const showToast = useToastStore((state) => state.showToast)
  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)
  const categories = useCategoryStore((state) => state.categories)

  // Read from the store on every render, so pausing or editing shows up here right away
  const existing = useSubscriptionStore((state) =>
    state.subscriptions.find((sub) => sub.id === subscriptionId),
  )
  const { isPaused, togglePause, remove } = useSubscriptionActions(existing)

  const [isEditing, setIsEditing] = useState(false)
  const readOnly = existing !== undefined && !isEditing

  const initialValues = existing
    ? subscriptionToFormValues(existing, todayISO())
    : newSubscriptionValues(preset, selectedCurrency, categories, firstBillDate)

  // In edit mode, back drops the changes and returns to view mode; otherwise it closes the screen.
  // The changes are dropped by the form's `key` below: a new key mounts a fresh form
  // that reads the saved values again (no reset code needed).
  const handleBack = isEditing ? () => setIsEditing(false) : popOverlay

  useBackHandler(() => setIsEditing(false), isEditing)

  /*
   * An edit waiting for an answer. Up to two "¿Desde cuándo?" questions, one after the
   * other: first the schedule (when the charge day or the cycle changed), then the price.
   * `schedule` is null while the schedule question is open, and the new schedule after.
   */
  const [pending, setPending] = useState<{
    data: SubscriptionData
    schedule: Schedule | null
  } | null>(null)

  const today = todayISO()

  // Saves an edit. The new price starts on `priceFrom` (a charge day); the charges before
  // keep theirs. `fields` has no `pauses`, so a paused subscription stays paused when edited
  const saveEdit = (data: SubscriptionData, schedule: Schedule, priceFrom: string) => {
    if (!existing) return
    const { price, currency, ...fields } = data
    updateSubscription(existing.id, {
      ...fields,
      schedule,
      priceHistory: applyPriceEdit(
        existing.priceHistory,
        { from: priceFrom, price, currency },
        schedule[0].from,
      ),
    })
    setPending(null)
    showToast('Cambios guardados', 'success')
    setIsEditing(false)
  }

  // Second step: ask about the price only when it changed and there are past charges to
  // pick from; otherwise it starts on the next charge
  const continueWithPrice = (data: SubscriptionData, schedule: Schedule) => {
    if (!existing) return
    const shown = upcomingPrice(existing, today)
    const priceChanged = data.price !== shown.price || data.currency !== shown.currency
    if (priceChanged && pastCharges({ schedule }, today).length > 0) {
      setPending({ data, schedule })
      return
    }
    saveEdit(data, schedule, nextScheduledCharge(schedule, today))
  }

  // What the form showed as the date and cycle, to tell whether they changed
  const anchor = existing ? editAnchor(existing, today) : null

  const handleSubmit = (values: SubscriptionFormValues) => {
    const data = formValuesToSubscriptionData(values)
    if (!data) return

    if (existing && anchor) {
      // First step: the schedule. The form gives one date and one cycle
      const [edit] = data.schedule
      const scheduleChanged =
        edit.from !== anchor.date || !sameCycle(edit.billingCycle, anchor.billingCycle)
      if (!scheduleChanged) {
        continueWithPrice(data, existing.schedule)
        return
      }
      // Only ask when it's the next charge that moved and there are past charges to keep.
      // Otherwise (a trial, an ended one, nothing charged yet) the form's date is the first
      // charge itself: one rhythm from there
      if (anchor.kind === 'next' && pastCharges(existing, today).length > 0) {
        setPending({ data, schedule: null })
        return
      }
      continueWithPrice(data, [edit])
      return
    }

    const { price, currency, ...fields } = data

    addSubscription({
      ...fields,
      priceHistory: [{ from: fields.schedule[0].from, price, currency }],
      id: createId(),
      pauses: [],
      createdAt: new Date().toISOString(),
    })
    showToast('¡Se ha agregado la subscripción!', 'success')
    closeAllOverlays()
  }

  return (
    <div className={container}>
      <PageHeader
        glass
        title={existing?.name ?? 'Nueva Subscripción'}
        onBack={handleBack}
        backLabel={isEditing ? 'Descartar cambios' : 'Volver'}
        actions={
          existing && (
            <>
              <IconButton
                onClick={togglePause}
                label={isPaused ? 'Reanudar subscripción' : 'Pausar subscripción'}
              >
                <PauseToggleIcon isPaused={isPaused} />
              </IconButton>
              {!isEditing && (
                <IconButton
                  onClick={() => setIsEditing(true)}
                  label="Editar subscripción"
                >
                  <IconEdit />
                </IconButton>
              )}
              <IconButton onClick={remove} label="Eliminar subscripción">
                <IconDelete />
              </IconButton>
            </>
          )
        }
      />
      <div>
        <SubscriptionForm
          key={isEditing ? 'edit' : 'view'} // see handleBack
          initialValues={initialValues}
          dateLabel={anchor?.kind === 'next' ? 'Próximo cobro' : undefined}
          submitLabel={existing ? 'Guardar' : 'Agregar Subscripción'}
          readOnly={readOnly}
          onSubmit={handleSubmit}
        />
      </div>

      <ScheduleChangeSheet
        isOpen={pending !== null && pending.schedule === null}
        onClose={() => setPending(null)}
        edit={
          pending
            ? {
                date: pending.data.schedule[0].from,
                billingCycle: pending.data.schedule[0].billingCycle,
              }
            : null
        }
        nextCharge={anchor?.date ?? ''}
        pastCharges={existing ? pastCharges(existing, today) : []}
        firstCharge={existing?.schedule[0].from ?? ''}
        onPick={(from) => {
          if (!existing || !pending) return
          const [edit] = pending.data.schedule
          const schedule = applyScheduleEdit(
            existing.schedule,
            { date: edit.from, billingCycle: edit.billingCycle },
            from,
          )
          continueWithPrice(pending.data, schedule)
        }}
      />

      <PriceChangeSheet
        isOpen={pending !== null && pending.schedule !== null}
        onClose={() => setPending(null)}
        nextCharge={pending?.schedule ? nextScheduledCharge(pending.schedule, today) : ''}
        pastCharges={
          pending?.schedule ? pastCharges({ schedule: pending.schedule }, today) : []
        }
        onPick={(from) =>
          pending?.schedule && saveEdit(pending.data, pending.schedule, from)
        }
      />
    </div>
  )
}
