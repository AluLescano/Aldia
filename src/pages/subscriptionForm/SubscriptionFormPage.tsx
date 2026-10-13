// DEPENDENCIES

// ZUSTAND
import { useUIStore } from '@/shared/store/uiStore'
import { useSubscriptionStore } from '@/features/subscriptions/store/subscriptionStore'
import { useSettingsStore } from '@/features/settings/store'
import { useToastStore } from '@/features/subscriptions/store/toastStore'

// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'
import Button from '@/shared/ui/Button/Button'
import SubscriptionForm from '@/features/subscriptions/components/SubscriptionForm/SubscriptionForm'

// HOOKS
import { nextBillDate } from '@/features/subscriptions/utils/billingCycle'
import { todayISO } from '@/shared/lib/isoDate'

// TYPES
import {
  parsePrice,
  type SubscriptionFormValues,
} from '@/features/subscriptions/utils/validateSubscriptionForm'
import type { SubscriptionTemplate } from '@/shared/types'

// ASSETS
import { IconArrow } from '@/assets/icons/IconArrow'

import styles from './SubscriptionFormPage.module.scss'

interface Props {
  preset?: SubscriptionTemplate
}

export const SubscriptionFormPage = ({ preset }: Props) => {
  const { container, header, button } = styles
  const popOverlay = useUIStore((state) => state.popOverlay)
  const addSubscription = useSubscriptionStore((state) => state.addSubscription)
  const closeAllOverlays = useUIStore((state) => state.closeAllOverlays)

  const showToast = useToastStore((state) => state.showToast)

  const selectedCurrency = useSettingsStore((state) => state.selectedCurrency)

  const initialValues: SubscriptionFormValues = {
    name: preset?.name ?? '',
    price: '',
    currency: selectedCurrency,
    billingCycle: 'monthly',
    firstBillDate: todayISO(),
    reminders: [],
    categoryId: preset?.defaultCategoryId ?? 'Others',
    iconUrl: preset?.iconUrl
  }

  const handleSubmit = (values: SubscriptionFormValues) => {
    const price = parsePrice(values.price)
    if (price === null || values.currency === '' || values.billingCycle === '') return

    addSubscription({
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`, /* Replace with crypto.randomUUID() after testing */
      name: values.name.trim(),
      price,
      currency: values.currency,
      billingCycle: values.billingCycle,
      firstBillDate: values.firstBillDate,
      nextBillDate: nextBillDate(values.firstBillDate, values.billingCycle, todayISO()),
      endDate: values.endDate || undefined,
      paymentMethodId: values.paymentMethodId || undefined,
      trial: values.trial,
      categoryId: values.categoryId,
      reminders: values.reminders,
      iconUrl: values?.iconUrl,
      brandColor: preset?.brandColor,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
    showToast(`¡Se ha agregado la subscripción!`, 'success')
    closeAllOverlays()
  }

  return (
    <div className={container}>
      <header className={header}>
        <div>
          <Button size="small" onClick={popOverlay} className={button}>
            <IconArrow />
          </Button>
          <div>
            <Typography variant="title" size="small">
              Nueva Subscripción
            </Typography>
          </div>
        </div>
      </header>
      <div>
        <SubscriptionForm
          initialValues={initialValues}
          submitLabel={'Agregar Subscripción'}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  )
}
