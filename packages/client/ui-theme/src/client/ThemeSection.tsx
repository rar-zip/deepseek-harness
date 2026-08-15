/**
 * Themes settings section: the full theme gallery — the `system` preference
 * plus every registered theme (light/dark, built-in curated, imported). Each
 * card renders a large mini preview of the theme's surface, accent, and text
 * colors (Google-style theme picker), so imported themes need no screenshot
 * asset. An import row reads a theme JSON file through the browser file picker.
 */
import clsx from 'clsx'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ThemeKey } from './locales.ts'
import type { ThemeDefinition } from './index.ts'
import type { createAppearanceRowStore } from './settings-store.ts'
import styles from './ThemeSection.module.css'

/** Injected face for the Themes section (slot `inject`). */
export interface ThemeSectionInjected {
  /** Switch the preference or a registered theme id. */
  setTheme: (id: string) => void
  /** Section copy. */
  t: (key: ThemeKey) => string
  /** Import one theme file's text; returns an error message or null on success. */
  importTheme: (jsonText: string) => string | null
}

/** Full component props: runtime share + store share + injected face. */
export type ThemeSectionProps =
  PropsRuntime<'settings.section'> & PropsStore<ReturnType<typeof createAppearanceRowStore>> & ThemeSectionInjected

/** Locale name for the two built-in ids; every other id reads its own `name`. */
const BUILTIN_LABEL_KEYS: Record<string, ThemeKey> = {
  light: 'appearance.light',
  dark: 'appearance.dark',
}

/** One gallery entry: a selectable theme or the `system` preference. */
interface GalleryEntry {
  id: string
  name: string
  /** `undefined` only for the `system` entry (split preview). */
  scheme: 'light' | 'dark' | undefined
  bg: string | undefined
  accent: string | undefined
  label: string | undefined
}

function entryName(id: string, name: string | undefined, t: ThemeSectionInjected['t']): string {
  if (id === 'system') return t('appearance.system')
  if (name !== undefined) return name
  const key = BUILTIN_LABEL_KEYS[id]
  return key !== undefined ? t(key) : id
}

/** Preview colors, falling back to the base palette for built-in light/dark. */
function previewColors(theme: ThemeDefinition) {
  const tokens = theme.tokens
  const dark = theme.colorScheme === 'dark'
  return {
    bg: tokens['--dsw-alias-bg-base'] ?? (dark ? '#151517' : '#ffffff'),
    accent: tokens['--dsw-alias-brand-primary'] ?? (dark ? '#f5f5f5' : '#1a1a1a'),
    label: tokens['--dsw-alias-label-primary'] ?? (dark ? '#f5f5f5' : '#1a1a1a'),
  }
}

/**
 * Render the Themes section.
 * @param props - composed slot props.
 * @returns the gallery element tree.
 */
export function ThemeSection({ setTheme, t, useStore, importTheme }: ThemeSectionProps) {
  const { preference, themes } = useStore(s => ({ preference: s.preference, themes: s.themes }))
  const [error, setError] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const entries: readonly GalleryEntry[] = [
    { id: 'system', name: t('appearance.system'), scheme: undefined, bg: undefined, accent: undefined, label: undefined },
    ...themes.map((theme) => {
      const colors = previewColors(theme)
      return { id: theme.id, name: entryName(theme.id, theme.name, t), scheme: theme.colorScheme, ...colors }
    }),
  ]

  const onImportClick = (): void => { fileInput.current?.click() }
  const onFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file === undefined) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : ''
      setError(importTheme(text))
    }
    reader.readAsText(file)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.gallery}>
        {entries.map(entry => (
          <button
            key={entry.id}
            type="button"
            className={clsx(styles.card, preference === entry.id && styles.selected)}
            aria-pressed={preference === entry.id}
            onClick={() => { setTheme(entry.id) }}
          >
            <span
              className={styles.preview}
              style={{ background: entry.scheme === undefined ? 'linear-gradient(90deg,#ffffff 50%,#151517 50%)' : entry.bg }}
            >
              <span className={styles.previewBar} style={{ background: entry.accent ?? '#888888' }} />
              <span className={styles.previewLine} style={{ background: entry.label ?? '#888888' }} />
              <span className={styles.previewLine} style={{ background: entry.label ?? '#888888', opacity: 0.45, width: '62%' }} />
            </span>
            <span className={styles.name}>{entry.name}</span>
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.importButton} onClick={onImportClick}>{t('themes.import')}</button>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={onFileChange} />
      </div>
      {error !== null && <div className={styles.error}>{error}</div>}
    </div>
  )
}
