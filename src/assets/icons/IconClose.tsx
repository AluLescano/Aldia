interface Props {
  classname?: string
}

export const IconClose = ({ classname }: Props) => {
  return (
    <svg
      className={classname}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6L6 18"></path>
      <path d="M6 6l12 12"></path>
    </svg>
  )
}
