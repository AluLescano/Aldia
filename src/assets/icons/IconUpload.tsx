import Icon, { type IconProps } from './Icon'

/** Arrow up out of a tray: load something from a file (Ajustes, "Importar backup"). */
export const IconUpload = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 3v12" />
    <path d="m17 8-5-5-5 5" />
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  </Icon>
)
