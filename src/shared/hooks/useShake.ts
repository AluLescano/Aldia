import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'motion/react'

export function useShake<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    if (!active || reduceMotion || !ref.current) return
    animate(ref.current, { x: [0, -6, 6, -4, 4, 0] }, { duration: 0.3 })
  }, [active, reduceMotion])

  return ref
}
