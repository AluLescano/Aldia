import { motion } from 'motion/react'
import styles from './BackdropFilter.module.scss'

interface BackdropFilterProps {
  onClick: () => void
}

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
