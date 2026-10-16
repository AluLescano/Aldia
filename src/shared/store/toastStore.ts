// DEPENDENCIES
import { create } from 'zustand'

interface ToastData {
  /** Changes on every `showToast`, so the same message twice still animates in again. */
  id: number
  message: string
  type: 'success' | 'alert' | 'info'
}

interface ToastState {
  /** The toast on screen, or `null`. Only one at a time: a new one replaces the old. */
  toast: ToastData | null
  showToast: (message: string, type: ToastData['type']) => void
  hideToast: () => void
}

/** The app-wide toast. `App.tsx` renders it; any screen can call `showToast`. */
export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  showToast: (message, type) => set({ toast: { id: Date.now(), message, type } }),
  hideToast: () => set({ toast: null }),
}))
