// DEPENDENCIES
import type { CSSProperties, ReactNode, Ref } from 'react'
import { cn } from '@/shared/lib/cn'

// COMPONENTS
import Typography from '../Typography/Typography'

// ASSETS
import styles from './Field.module.scss'

/** Figma "Default" (`large`) or "Small" (`medium`). */
export type FieldSize = 'large' | 'medium'
/** How wide the box is. See `FieldControlProps.width`. */
export type FieldWidth = 'full' | 'fit' | 'auto'

const {
  base,
  sizeLarge,
  sizeMedium,
  widthFull,
  widthFit,
  widthAuto,
  floated,
  errorState,
  labelContainer,
  adornmentContainer,
  description,
  error,
  info,
} = styles

interface Props {
  /** Id of the control inside, so the label can point at it with `htmlFor`. */
  id: string
  size?: FieldSize
  width?: FieldWidth
  /** Smallest width with `width="fit"`, as a CSS length. Defaults to 9rem (in the SCSS). */
  minWidth?: string
  /** Floating label, shown only on `size="large"`. */
  label?: string
  /** The control has a value: the floating label stays up on the border. */
  filled?: boolean
  /** Hint under the box. An error replaces it. */
  subText?: string
  /** Error under the box. Also turns the border and the label red. */
  errorMessage?: string
  /** Goes on the box (not the wrapper), so the shake moves only the box. */
  ref?: Ref<HTMLDivElement>
  /** Something on the left inside the box, like the currency symbol or the calendar icon. */
  startAdornment?: ReactNode
  /** The real control: an `<input>` or a `<button>`. */
  children: ReactNode
  /** Dims the box and blocks clicks. The control itself still needs `disabled`. */
  disabled?: boolean
  className?: string
  /** Id for the hint/error element. The control points at it with `aria-describedby`. */
  descriptionId?: string
  style?: CSSProperties
}

const widthClasses: Record<FieldWidth, string> = {
  full: widthFull,
  fit: widthFit,
  auto: widthAuto,
}

const sizeClasses: Record<FieldSize, string> = {
  large: sizeLarge,
  medium: sizeMedium,
}

/**
 * The box every input shares: border, size, floating label, hint or error underneath.
 * It holds no logic: use it through an `Input*` component, which wires it with `useFieldControl`.
 */
const Field = ({
  id,
  size = 'large',
  width = 'full',
  minWidth,
  label,
  filled,
  subText,
  errorMessage,
  ref,
  startAdornment,
  children,
  disabled,
  descriptionId,
  className,
  style,
}: Props) => {
  // Only the large size floats its label; medium rows get theirs from FormRow
  const showLabel = Boolean(label) && size === 'large'

  // An error replaces the hint, never shows next to it
  const message = errorMessage || subText

  const classes = cn(
    base,
    sizeClasses[size],
    widthClasses[width],
    filled && floated,
    errorMessage && errorState,
    className,
  )

  // The adornment sits next to the control, not over it, so a tap on it is passed on
  // by hand: an input gets the focus, a button (like the date picker) gets the click
  const forwardTap = () => {
    const control = document.getElementById(id)
    control?.focus()
    if (control instanceof HTMLButtonElement) control.click()
  }

  // The SCSS reads `--field-min-width` and falls back to 9rem when it isn't set
  const boxStyle = minWidth
    ? ({ ...style, '--field-min-width': minWidth } as CSSProperties)
    : style

  return (
    <div>
      <div
        ref={ref}
        aria-disabled={disabled || undefined}
        className={classes}
        style={boxStyle}
      >
        {showLabel && (
          <label htmlFor={id} className={labelContainer}>
            {label}
          </label>
        )}
        {startAdornment && (
          <div className={adornmentContainer} onClick={forwardTap}>
            {startAdornment}
          </div>
        )}
        {children}
      </div>
      {message && (
        <div id={descriptionId} className={description}>
          <Typography variant="label" size="xs" className={errorMessage ? error : info}>
            {message}
          </Typography>
        </div>
      )}
    </div>
  )
}

export default Field
