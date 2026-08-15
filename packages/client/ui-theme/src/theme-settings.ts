/** Theme preferences stored in the Host user-settings document. */

import z from '@deepseek-ai/schemastery'

/** Built-in preferences accepted at the registry and settings boundaries. */
export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const

/** Settings namespace owned by the theme plugin. */
export const THEME_SETTINGS_NAMESPACE = 'ui-theme'

/** Field carrying the selected theme preference. */
export const THEME_PREFERENCE_FIELD = 'preference'

/** Field carrying the imported theme definitions. */
export const THEME_IMPORTED_FIELD = 'importedThemes'

/** Theme preference persisted by the product Appearance row. */
export type ThemePreference = typeof THEME_PREFERENCES[number]

/** Default preference when the user-settings document has no override. */
export const DEFAULT_PREFERENCE: ThemePreference = 'system'

/** One imported theme, structurally identical to the registry's ThemeDefinition. */
export interface ImportedTheme {
  /** Theme id. */
  id: string
  /** Display name; empty string means absent. */
  name: string
  /** Base palette the theme builds on. */
  colorScheme: 'light' | 'dark'
  /** Alias-token overrides. */
  tokens: Record<string, string>
  /** Raw stylesheet; empty string means absent. */
  css: string
}

/** Durable theme section shared by the Host schema and the browser scope. */
export interface ThemeSettings {
  /**
   * Selected preference: a built-in preference (`light`/`dark`/`system`) or a
   * registered theme id. Wider than `ThemePreference` because curated and
   * imported themes persist their id through the same field.
   */
  preference: string
  /** Imported theme definitions, re-registered at boot. */
  importedThemes: ImportedTheme[]
}

/** Durable theme schema; also the wire envelope the browser scope validates against. */
export const ThemeSettingsSchema: z<ThemeSettings> = z.object({
  [THEME_PREFERENCE_FIELD]: z.string().default(DEFAULT_PREFERENCE),
  [THEME_IMPORTED_FIELD]: z.array(z.object({
    id: z.string(),
    name: z.string().default(''),
    colorScheme: z.union(['light', 'dark']),
    tokens: z.dict(z.string()),
    css: z.string().default(''),
  })).default([]),
})

/**
 * Narrow one wire or registry value to a persistable preference.
 * @param value - value crossing the settings or registry boundary.
 * @returns whether the value is a built-in preference.
 */
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEME_PREFERENCES.some(preference => preference === value)
}
