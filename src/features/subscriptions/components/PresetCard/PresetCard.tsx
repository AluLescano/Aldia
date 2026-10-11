// COMPONENTS
import Typography from '@/shared/ui/Typography/Typography'

// ASSETS
import styles from './PresetCard.module.scss'

interface Props {
  name: string
  logo: string
  onClick: () => void
  className?: string
}

const PresetCard = ({ name, logo, onClick, className }: Props) => {
  const { container, text } = styles

  return (
    <div
      onClick={onClick}
      className={`${container} ${className || ''}`}
    >
      <img
        src={logo}
      />
      <div className={text}>
        <Typography variant="body" size="small">
          {name}
        </Typography>
      </div>
    </div>
  )
}

export default PresetCard
