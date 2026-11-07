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

// HOOKS
import { useSubscriptionActions } from '@/features/subscriptions/hooks/useSubscriptionActions'
import { useBackHandler } from '@/shared/hooks/useBackHandler'

// UTILS
import { createId } from '@/shared/lib/id'
import { todayISO } from '@/shared/lib/isoDate'
import { nextBillDate } from '@/features/subscriptions/utils/billingCycle'
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
import type { Preset } from '@/shared/types'

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

  // An edit waiting for the "¿Desde cuándo?" answer (only when the price changed)
  const [pendingEdit, setPendingEdit] = useState<SubscriptionData | null>(null)

  // Saves an edit. The new price starts on `from` (a charge day); the charges before keep
  // theirs. `fields` has no `pauses`, so a paused subscription stays paused when it is edited
  const saveEdit = (data: SubscriptionData, from: string) => {
    if (!existing) return
    const { price, currency, ...fields } = data
    updateSubscription(existing.id, {
      ...fields,
      priceHistory: applyPriceEdit(
        existing.priceHistory,
        { from, price, currency },
        fields.firstBillDate,
      ),
    })
    setPendingEdit(null)
    showToast('Cambios guardados', 'success')
    setIsEditing(false)
  }

  const today = todayISO()
  const editNextCharge = pendingEdit
    ? nextBillDate(pendingEdit.firstBillDate, pendingEdit.billingCycle, today)
    : ''

  const handleSubmit = (values: SubscriptionFormValues) => {
    const data = formValuesToSubscriptionData(values)
    if (!data) return

    if (existing) {
      const shown = upcomingPrice(existing, today)
      const priceChanged = data.price !== shown.price || data.currency !== shown.currency
      // Only ask when there are past charges to pick from; otherwise it's the next one
      if (priceChanged && pastCharges(data, today).length > 0) {
        setPendingEdit(data)
        return
      }
      saveEdit(data, nextBillDate(data.firstBillDate, data.billingCycle, today))
      return
    }

    const { price, currency, ...fields } = data

    addSubscription({
      ...fields,
      priceHistory: [{ from: fields.firstBillDate, price, currency }],
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
          submitLabel={existing ? 'Guardar' : 'Agregar Subscripción'}
          readOnly={readOnly}
          onSubmit={handleSubmit}
        />
      </div>

      <PriceChangeSheet
        isOpen={pendingEdit !== null}
        onClose={() => setPendingEdit(null)}
        nextCharge={editNextCharge}
        pastCharges={pendingEdit ? pastCharges(pendingEdit, today) : []}
        onPick={(from) => pendingEdit && saveEdit(pendingEdit, from)}
      />
    </div>
  )
}
