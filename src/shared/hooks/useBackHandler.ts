// DEPENDENCIES
import { useEffect, useRef } from 'react'

// Everything that can close itself with the Android back button and is open right now.
// Last one in is the one on top (a sheet opens over edit mode, which is over the screen).
// A plain module variable: one shared pile for the whole app, and nobody displays it.
const backHandlers: Array<() => void> = []

/**
 * Closes whatever is on top of the back-handler pile (an open sheet, edit mode).
 * Called by the back button listener in `App.tsx` before it pops overlays or changes tabs.
 *
 * @returns `true` if something handled the press, `false` if nothing was open
 * (the caller keeps going down its own list).
 */
export function runTopBackHandler(): boolean {
  const top = backHandlers.at(-1)
  if (top) {
    top()
    return true
  }
  return false
}

/**
 * While `isActive` is true, the Android back button runs `handler` before anything below it
 * (overlays, tabs, leaving the app). Stops when `isActive` turns false or the component unmounts.
 *
 * The pile gets one stable entry that reads the latest `handler` from a ref, so a new
 * inline arrow on every render never moves it out of order.
 *
 * @example
 * useBackHandler(() => setIsEditing(false), isEditing)
 */
export function useBackHandler(handler: () => void, isActive: boolean) {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(() => {
    if (!isActive) return
    const entry = () => handlerRef.current()
    backHandlers.push(entry)

    return () => {
      const index = backHandlers.indexOf(entry)
      if (index !== -1) backHandlers.splice(index, 1)
    }
  }, [isActive])
}
