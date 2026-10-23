// DEPENDENCIES
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

// STORES
import { useSettingsStore } from '@/features/settings/store/settingsStore'

// UTILS
import { cn } from '@/shared/lib/cn'
import { formatDayMonth } from '@/shared/lib/formatDate'
import { addDays, todayISO } from '@/shared/lib/isoDate'
import { ICONS } from '@/shared/lib/icons'
import { useBackHandler } from '@/shared/hooks/useBackHandler'
import {
  hasNotificationPermission,
  requestNotificationPermission,
} from '@/features/notifications/notificationSync'

// COMPONENTS
import Button from '@/shared/ui/Button/Button'
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import { IconBell } from '@/assets/icons/IconBell'
import { IconCheck } from '@/assets/icons/IconCheck'
import { IconShield } from '@/assets/icons/IconShield'
import styles from './OnboardingFlow.module.scss'

const {
  screen,
  dots,
  dot,
  dotActive,
  stage,
  step,
  art,
  logo,
  tile,
  badge,
  stack,
  stackBack,
  stackMiddle,
  stackFront,
  appIcon,
  notificationTexts,
  notificationHeader,
  texts,
  heading,
  accent,
  secondary,
  muted,
  card,
  cardIcon,
  statusRow,
  statusOn,
  actions,
  footnote,
} = styles

type Step = 'welcome' | 'notifications' | 'privacy'

const ALL_STEPS: Step[] = ['welcome', 'notifications', 'privacy']

// Same feel as switching tabs: a short slide plus a fade. `direction`: 1 forward, -1 back
const SHIFT = 32 // px
const stepVariants = {
  enter: (direction: number) => ({ x: direction * SHIFT, opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: (direction: number) => ({
    x: direction * -SHIFT,
    opacity: 0,
    transition: { duration: 0.15 },
  }),
} as const

// The picture on the notifications step: two of Aldia's notifications, the way the phone shows
// them. Generic bills (never real brands' logos) and the same texts the real ones use.
const NotificationsArt = () => {
  const PhoneIcon = ICONS.phone
  const BoltIcon = ICONS.electricity
  return (
    <div className={stack} aria-hidden="true">
      <div className={stackBack} />
      <div className={stackMiddle}>
        <span className={appIcon}>
          <PhoneIcon width={16} height={16} />
        </span>
        <div className={notificationTexts}>
          <span className={notificationHeader}>Aldia</span>
          <span className={secondary}>Celular se cobra hoy</span>
        </div>
      </div>
      <div className={stackFront}>
        <span className={appIcon}>
          <BoltIcon />
        </span>
        <div className={notificationTexts}>
          <span className={notificationHeader}>
            <span>Aldia</span>
            <span className={muted}>ahora</span>
          </span>
          <span>Luz se cobra mañana</span>
          <span className={secondary}>
            $ 2.450 · {formatDayMonth(addDays(todayISO(), 1))}
          </span>
        </div>
      </div>
    </div>
  )
}

/**
 * The first-open welcome: what Aldia is for, a request for notifications, and the privacy
 * promise. Covers the whole app until "Empezar", which marks it seen for good
 * (`finishOnboarding`). Closing the app halfway shows it again next time.
 *
 * The notifications step is skipped when they are already allowed (Android 12 and older, or
 * turned on by hand). "Ahora no" moves on without asking Android, so its prompt stays unspent
 * for the second ask.
 */
const OnboardingFlow = () => {
  const finishOnboarding = useSettingsStore((state) => state.finishOnboarding)
  const [steps, setSteps] = useState<Step[]>(ALL_STEPS)
  const [index, setIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [notificationsOn, setNotificationsOn] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isFirstRender = useRef(true)

  const current = steps[index]

  // Already allowed: nothing to ask, so that step goes away
  useEffect(() => {
    hasNotificationPermission().then((allowed) => {
      if (!allowed) return
      setNotificationsOn(true)
      setSteps(ALL_STEPS.filter((name) => name !== 'notifications'))
    })
  }, [])

  // Screen readers: each new step starts reading from its title (not on the first one, which
  // the reader already starts from)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true }) // the step is still sliding in
  }, [index])

  const go = (delta: 1 | -1) => {
    setDirection(delta)
    setIndex((value) => value + delta)
  }

  // Android back button: one step back. On the first step it falls through to App (leave)
  useBackHandler(() => go(-1), index > 0)

  const allowNotifications = async () => {
    setIsAsking(true)
    // If the plugin fails, carry on as a "no": the flow must never get stuck here
    const allowed = await requestNotificationPermission().catch(() => false)
    setNotificationsOn(allowed)
    setIsAsking(false)
    go(1)
  }

  const renderStep = () => {
    switch (current) {
      case 'welcome':
        return (
          <>
            <div className={art}>
              {/* Until the app has its real logo */}
              <div className={logo} aria-hidden="true">
                Aldia
              </div>
            </div>
            <div className={texts}>
              <h1 ref={headingRef} tabIndex={-1} className={heading}>
                No te sorprendas más.
                <br />
                Quédate <span className={accent}>al día</span> con Aldia.
              </h1>
              <Typography variant="body" className={secondary}>
                Anota lo que pagas cada mes y cuándo vence. Tu total, tus categorías y tu
                próximo cobro, de un vistazo.
              </Typography>
            </div>
            <div className={actions}>
              <Button width="full" onClick={() => go(1)}>
                Continuar
              </Button>
            </div>
          </>
        )

      case 'notifications':
        return (
          <>
            <div className={art}>
              <NotificationsArt />
            </div>
            <div className={texts}>
              <Typography variant="overline" size="xs" className={accent}>
                Recordatorios
              </Typography>
              <h1 ref={headingRef} tabIndex={-1} className={heading}>
                Te avisamos antes de cada cobro
              </h1>
              <Typography variant="body" size="sm" className={secondary}>
                Agrega notificaciones a las subscripciones que quieras y te avisamos unos
                días antes del cobro o del fin de la prueba gratis.
              </Typography>
            </div>
            <div className={card}>
              <span className={cardIcon}>
                <IconBell width={20} height={20} />
              </span>
              <div className={notificationTexts}>
                <Typography variant="label" size="xs" className={muted}>
                  Se solicita
                </Typography>
                <Typography variant="label" size="sm">
                  Notificaciones
                </Typography>
              </div>
            </div>
            <div className={actions}>
              <Button width="full" onClick={allowNotifications} disabled={isAsking}>
                Permitir notificaciones
              </Button>
              <Button
                variant="secondary"
                width="full"
                onClick={() => go(1)}
                disabled={isAsking}
              >
                Ahora no
              </Button>
              <Typography variant="body" size="xs" className={cn(muted, footnote)}>
                Puedes cambiarlo cuando quieras en los Ajustes del teléfono.
              </Typography>
            </div>
          </>
        )

      case 'privacy':
        return (
          <>
            <div className={art}>
              <div className={tile} aria-hidden="true">
                <IconShield width={64} height={64} strokeWidth={1.6} />
                <span className={badge}>
                  <IconCheck width={22} height={22} strokeWidth={3} />
                </span>
              </div>
            </div>
            <div className={texts}>
              <Typography variant="overline" size="xs" className={accent}>
                Privado y seguro
              </Typography>
              <h1 ref={headingRef} tabIndex={-1} className={heading}>
                Tus datos son tuyos
              </h1>
              <Typography variant="body" size="sm" className={secondary}>
                Todo se guarda en este teléfono, sin cuentas ni servidores. Lo único que
                descargamos son los tipos de cambio del día.
              </Typography>
            </div>
            <div className={cn(card, statusRow)}>
              <Typography variant="label" size="sm" className={secondary}>
                Notificaciones
              </Typography>
              <Typography
                variant="label"
                size="sm"
                className={notificationsOn ? statusOn : muted}
              >
                {notificationsOn ? 'Activadas' : 'Desactivadas'}
              </Typography>
            </div>
            <div className={actions}>
              <Button width="full" onClick={finishOnboarding}>
                Empezar
              </Button>
              <Typography variant="body" size="xs" className={cn(muted, footnote)}>
                Puedes cambiar los permisos cuando quieras en Ajustes.
              </Typography>
            </div>
          </>
        )
    }
  }

  return (
    <motion.div
      className={screen}
      initial={false}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
    >
      <div
        className={dots}
        role="img"
        aria-label={`Paso ${index + 1} de ${steps.length}`}
      >
        {steps.map((name, position) => (
          <span key={name} className={cn(dot, position === index && dotActive)} />
        ))}
      </div>

      <div className={stage}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.section
            key={current}
            className={step}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            {renderStep()}
          </motion.section>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default OnboardingFlow
