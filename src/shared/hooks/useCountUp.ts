import { useEffect, useRef, useState } from 'react'
import { useMotionValueEvent, useReducedMotion, useSpring } from 'motion/react'

interface Options {
  /** Show the value right away, no roll (e.g. while loading, so opening the app doesn't count from 0). */
  instant?: boolean
  /**
   * When this changes, jump to the new value instead of rolling. For changes that aren't
   * "more or less money", like switching currency or new exchange rates arriving.
   */
  jumpKey?: string
}

/**
 * A number that moves smoothly to each new `value` instead of jumping (up or down, about
 * half a second), so a total visibly reacts to adding, pausing or deleting. The spring is
 * overdamped, so it never shoots past the real amount on its way there. With "reduce
 * motion" on, it jumps.
 *
 * @returns the number to show this frame.
 *
 * @example
 * const shownTotal = useCountUp(total, { instant: isLoading, jumpKey: currency })
 * <Typography variant="currency">{shownTotal}</Typography>
 */
export function useCountUp(
  value: number,
  { instant = false, jumpKey }: Options = {},
): number {
  const prefersReducedMotion = useReducedMotion()
  // Damping above the critical point (2 × √stiffness ≈ 22): eases in, no overshoot.
  // useSpring only uses its first value; every later one is passed in with set() below.
  const spring = useSpring(value, { stiffness: 120, damping: 24 })
  const [shown, setShown] = useState(value)
  const lastJumpKeyRef = useRef(jumpKey)

  useMotionValueEvent(spring, 'change', setShown)

  useEffect(() => {
    const keyChanged = lastJumpKeyRef.current !== jumpKey
    lastJumpKeyRef.current = jumpKey

    if (instant || prefersReducedMotion || keyChanged) spring.jump(value)
    else spring.set(value)
  }, [value, instant, jumpKey, prefersReducedMotion, spring])

  return shown
}
