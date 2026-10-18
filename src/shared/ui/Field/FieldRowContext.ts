import { createContext, useContext } from 'react'

/** What a row that labels one control (like the form's `FormRow`) shares with that control. */
export interface FieldRow {
  /** Id the row's `<label htmlFor>` points at; the control uses it as its own id. */
  controlId: string
  /** Id of the row's `<label>`, for buttons that need `aria-labelledby` (see `useFieldControl`). */
  labelId: string
  /**
   * Element under the whole row where `Field` sends its hint or error (with a portal),
   * so the message gets the row's full width instead of the box's. `null` until mounted.
   */
  messageSlot: HTMLElement | null
}

/** `null` outside a row: controls then use their own id and keep the message under the box. */
export const FieldRowContext = createContext<FieldRow | null>(null)

/** The row this control sits in, or `null` when it isn't in one. */
export const useFieldRow = () => useContext(FieldRowContext)
