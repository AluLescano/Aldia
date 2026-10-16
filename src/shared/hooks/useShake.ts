// DEPENDENCIES
import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'

/**
 * Shakes an element sideways once each time `active` turns true (used when a field
 * shows an error). Does nothing for people who turned on "reduce motion".
 *
 * @returns a ref to put on the element to shake.
 * @example
 * const boxRef = useShake<HTMLDivElement>(Boolean(errorMessage))
 * return <div ref={boxRef}>...</div>
 */
export function useShake<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!active || reduceMotion || !ref.current) return
    animate(ref.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.3 })
  }, [active, reduceMotion])

  return ref
}
