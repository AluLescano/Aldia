interface BackdropFilterProps {
  onClick: () => void
}

const BackdropFilter = ({ onClick }: BackdropFilterProps) => {
  return (
    <div
      onClick={onClick}
      className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      style={{ animation: 'fadeIn 200ms ease-out forwards' }}
    />
  )
}

export default BackdropFilter
