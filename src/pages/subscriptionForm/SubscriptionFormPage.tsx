// DEPENDENCIES
import { useState } from 'react'

// ZUSTAND
import { useUIStore } from '@/shared/store/uiStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store'
import { useToastStore } from '@/shared/store/toastStore'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import SubscriptionForm from '@/features/subscriptions/components/SubscriptionForm/SubscriptionForm'
import PauseToggleIcon from '@/features/subscriptions/components/PauseToggleIcon/PauseToggleIcon'

// HOOKS
import { useSubscriptionActions } from '@/features/subscriptions/hooks/useSubscriptionActions'

// UTILS
import { todayISO } from '@/shared/lib/isoDate'
import { createId } from '@/shared/lib/id'
import { OTHERS_ID } from '@/features/categories/categoryStore'
import { subscriptionToFormValues } from '@/features/subscriptions/utils/subscriptionToFormValues'
import { formValuesToSubscriptionData } from '@/features/subscriptions/utils/formValuesToSubscriptionData'
import { statusFor } from '@/features/subscriptions/utils/subscriptionStatus'

// TYPES
import type { SubscriptionFormValues } from '@/features/subscriptions/types'
import type { Preset } from '@/shared/types'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'
import { IconEdit } from '@/assets/icons/IconEdit'
import { IconDelete } from '@/assets/icons/IconDelete'

import styles from './SubscriptionFormPage.module.scss'

interface Props {
  preset?: Preset
  subscriptionId?: string
}

export const SubscriptionFormPage = ({ preset, subscriptionId }: Props) => {
  const { container, header, iconContainer, button } = styles
  const popOverlay = useUIStore((state) => state.popOverlay)
  const closeAllOverlays = useUIStore((state) => state.closeAllOverlays)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const updateSubscription = useSubscriptionStore((state) => state.updateSubscription)
  const showToast = useToastStore((state) => state.showToast)
  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)

  // Read from the store on every render, so pausing or editing shows up here right away
  const existing = useSubscriptionStore((state) =>
    state.subscriptions.find((sub) => sub.id === subscriptionId),
  )
  const { isPaused, togglePause, remove } = useSubscriptionActions(existing)

  const [isEditing, setIsEditing] = useState(false)
  const readOnly = existing !== undefined && !isEditing

  const initialValues: SubscriptionFormValues = existing
    ? subscriptionToFormValues(existing)
    : {
        name: preset?.name ?? '',
        price: '',
        currency: selectedCurrency,
        billingCycle: { type: 'every', interval: 1, unit: 'month' },
        firstBillDate: todayISO(),
        reminders: [],
        categoryId: preset?.defaultCategoryId ?? OTHERS_ID,
        iconUrl: preset?.iconUrl,
        iconKey: preset?.iconKey,
      }

  const handleSubmit = (values: SubscriptionFormValues) => {
    const data = formValuesToSubscriptionData(values)
    if (!data) return
    const status = statusFor(data.trial, todayISO())

    if (existing) {
      updateSubscription(existing.id, {
        ...data,
        // A paused subscription stays paused when it is edited
        status: existing.status === 'inactive' ? 'inactive' : status,
      })
      showToast('Cambios guardados', 'success')
      setIsEditing(false)
      return
    }

    addSubscription({
      ...data,
      id: createId(),
      status,
      createdAt: new Date().toISOString(),
    })
    showToast('¡Se ha agregado la subscripción!', 'success')
    closeAllOverlays()
  }

  return (
    <div className={container}>
      <header className={header}>
        <div>
          <Button
            variant="secondary"
            size="small"
            width="fit"
            onClick={popOverlay}
            aria-label="Volver"
            className={button}
          >
            <IconArrow />
          </Button>
          <div>
            <Typography variant="title" size="small">
              {existing?.name ?? 'Nueva Subscripción'}
            </Typography>
          </div>
          {existing && (
            <div className={iconContainer}>
              <Button
                variant="secondary"
                size="small"
                width="fit"
                onClick={togglePause}
                aria-label={isPaused ? 'Reanudar suscripción' : 'Pausar suscripción'}
                className={button}
              >
                <PauseToggleIcon isPaused={isPaused} />
              </Button>
              {!isEditing && (
                <Button
                  variant="secondary"
                  size="small"
                  width="fit"
                  onClick={() => setIsEditing(true)}
                  aria-label="Editar suscripción"
                  className={button}
                >
                  <IconEdit />
                </Button>
              )}
              <Button
                variant="secondary"
                size="small"
                width="fit"
                onClick={remove}
                aria-label="Eliminar suscripción"
                className={button}
              >
                <IconDelete />
              </Button>
            </div>
          )}
        </div>
      </header>
      <div>
        <SubscriptionForm
          initialValues={initialValues}
          submitLabel={existing ? 'Guardar' : 'Agregar Subscripción'}
          readOnly={readOnly}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
