// DEPENDENCIES
import { motion } from 'motion/react'

// ASSETS
import styles from './BackdropFilter.module.scss'

interface BackdropFilterProps {
  /** Tapping the dimmed area (usually closes whatever is on top). */
  onClick: () => void
}

/** The dimmed, blurred layer behind a bottom sheet. Fades in and out. */
const BackdropFilter = ({ onClick }: BackdropFilterProps) => (
  <motion.div
    className={styles.backdrop}
    onClick={onClick}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  />
)

export default BackdropFilter
