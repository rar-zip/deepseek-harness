/**
 * Appearance row slot store: a mirror of the theme service snapshot. The
 * plugin's apply-world change listener is the only writer; the row component
 * reads via props.useStore.
 */
import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'
import type { ThemeDefinition } from './index.ts'

/** Store state mirrored from the theme snapshot. */
export interface AppearanceRowState {
  /**
   * Selected preference or registered theme id. Wider than ThemePreference:
   * `setTheme` accepts curated theme ids, which the snapshot reports through
   * the same field.
   */
  preference: string
  /** Registered themes in registration order (light/dark plus curated). */
  themes: readonly ThemeDefinition[]
  /** Service revision; -1 until first sync so revision 0 lands as a change. */
  revision: number
}

/** Declared action shape giving the exported factory a stable return type. */
type AppearanceRowActions = {
  sync: (draft: AppearanceRowState, preference: string, themes: readonly ThemeDefinition[], revision: number) => void
}

/**
 * Declares the Appearance row state and write surface.
 * @returns the store handle.
 */
export function createAppearanceRowStore(): EngineStoreHandle<AppearanceRowState, AppearanceRowActions> {
  return defineStore({
    init: (): AppearanceRowState => ({ preference: 'system', themes: [], revision: -1 }),
    actions: {
      sync: (d, preference: string, themes: readonly ThemeDefinition[], revision: number) => {
        if (revision <= d.revision) return
        d.preference = preference
        d.themes = themes
        d.revision = revision
      },
    },
  })
}
