import styles from './IconAddEmpty.module.scss'

interface Props {
  className?: string
}

export const IconAddEmpty = ({ className }: Props) => {
  const { icon } = styles

  return (
    <svg
      className={className ?? icon}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}