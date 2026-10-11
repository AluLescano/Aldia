import styles from './IconAdd.module.scss'

interface Props {
  className?: string
}

export const IconAdd = ({ className }: Props) => {
  const { icon } = styles

  return (
    <svg
      className={className ?? icon}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
