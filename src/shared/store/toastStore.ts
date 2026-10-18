// DEPENDENCIES
import type { ReactNode } from 'react'
import { create } from 'zustand'

/** A button inside the toast, like "Deshacer". Tapping it runs `onClick` and closes the toast. */
export interface ToastAction {
  /** Read by screen readers, and shown as text when there is no `icon`. */
  label: string
  /** Optional icon instead of the text, e.g. `<IconUndo />`. */
  icon?: ReactNode
  onClick: () => void
}

interface ToastOptions {
  action?: ToastAction
  /**
   * Runs once when this toast goes away for any reason: time out, swipe, close button,
   * its action, or another toast replacing it. E.g. forgetting the deleted subscription.
   */
  onClose?: () => void
}

interface ToastData extends ToastOptions {
  /** Changes on every `showToast`, so the same message twice still animates in again. */
  id: number
  message: string
  type: 'success' | 'alert' | 'info'
}

interface ToastState {
  /** The toast on screen, or `null`. Only one at a time: a new one replaces the old. */
  toast: ToastData | null
  showToast: (message: string, type: ToastData['type'], options?: ToastOptions) => void
  hideToast: () => void
}

/** The app-wide toast. `App.tsx` renders it; any screen can call `showToast`. */
export const useToastStore = create<ToastState>((set, get) => ({
  toast: null,
  showToast: (message, type, options) => {
    // The replaced toast is gone too, so its cleanup still has to run
    get().toast?.onClose?.()
    set({ toast: { id: Date.now(), message, type, ...options } })
  },
  hideToast: () => {
    get().toast?.onClose?.()
    set({ toast: null })
  },
}))
