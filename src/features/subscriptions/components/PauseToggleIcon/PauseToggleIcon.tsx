// DEPENDENCIES
import { motion, AnimatePresence, useReducedMotion } from 'motion/react'

// ASSETS
import { IconPause } from '@/assets/icons/IconPause'
import { IconPlay } from '@/assets/icons/IconPlay'

interface Props {
  /** Paused shows "play" (the action to resume); running shows "pause". */
  isPaused: boolean
}

/** The pause/play icon of the detail header. They swap with a small turn: the old one leaves, then the new one comes in. */
const PauseToggleIcon = ({ isPaused }: Props) => {
  const reduceMotion = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={isPaused ? 'play' : 'pause'}
        style={{ display: 'grid' }}
        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
        transition={{ duration: reduceMotion ? 0 : 0.15 }}
      >
        {isPaused ? <IconPlay /> : <IconPause />}
      </motion.span>
    </AnimatePresence>
  )
}

export default PauseToggleIcon
