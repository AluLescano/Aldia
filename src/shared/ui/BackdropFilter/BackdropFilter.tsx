import styles from './BackdropFilter.module.scss'

interface BackdropFilterProps {
  onClick: () => void
}

const BackdropFilter = ({ onClick }: BackdropFilterProps) => {
  const { backdrop } = styles

  return (
    <div
      onClick={onClick}
      className={backdrop}
    />
  )
}

export default BackdropFilter
