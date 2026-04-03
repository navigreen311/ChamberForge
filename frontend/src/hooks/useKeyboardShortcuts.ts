import { useEffect, useCallback } from 'react'

type ShortcutHandler = () => void

export interface Shortcut {
  key: string
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
  handler: ShortcutHandler
  description: string
}

export function useKeyboardShortcut(
  key: string,
  handler: ShortcutHandler,
  options?: { ctrl?: boolean; meta?: boolean; shift?: boolean },
) {
  const stableHandler = useCallback(handler, [handler])

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      if (options?.ctrl && !e.ctrlKey) return
      if (options?.meta && !(e.metaKey || e.ctrlKey)) return // Treat Ctrl as Meta for cross-platform
      if (options?.shift && !e.shiftKey) return
      // Don't fire when typing in inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return
      if ((e.target as HTMLElement).isContentEditable) return
      e.preventDefault()
      stableHandler()
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [key, stableHandler, options?.ctrl, options?.meta, options?.shift])
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      for (const s of shortcuts) {
        if (e.key.toLowerCase() !== s.key.toLowerCase()) continue
        if (s.meta && !(e.metaKey || e.ctrlKey)) continue
        if (s.ctrl && !e.ctrlKey) continue
        if (s.shift && !e.shiftKey) continue
        if (!s.shift && e.shiftKey && s.key !== '?') continue
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
          // Allow Escape inside inputs
          if (s.key !== 'Escape') continue
        }
        if ((e.target as HTMLElement).isContentEditable && s.key !== 'Escape') continue
        e.preventDefault()
        s.handler()
        return
      }
    }
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [shortcuts])
}

export const SHORTCUTS = {
  SEARCH: { key: 'k', meta: true, description: 'Open search' },
  DASHBOARD: { key: 'd', meta: true, shift: true, description: 'Go to Dashboard' },
  NEW_PROBLEM: { key: 'n', meta: true, description: 'New Problem' },
  NEW_OFFER: { key: 'o', meta: true, shift: true, description: 'New Offer' },
  PROBLEMS: { key: 'p', meta: true, shift: true, description: 'Go to Problems' },
  SAVE: { key: 's', meta: true, description: 'Save' },
  ESCAPE: { key: 'Escape', description: 'Close modal/panel' },
  HELP: { key: '?', shift: true, description: 'Show shortcuts help' },
} as const
