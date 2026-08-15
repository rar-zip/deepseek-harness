/**
 * Themes settings section: the full theme gallery — the `system` preference
 * plus every registered theme (light/dark, built-in curated, imported). Each
 * card renders an auto-generated swatch from the theme's own surface and
 * accent tokens, so imported themes need no screenshot asset.
 */
import clsx from 'clsx'
import type { PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the settings shell's SlotMap merge (the 'settings.section' entry).
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { ThemeKey } from './locales.ts'
import type { createAppearanceRowStore } from './settings-store.ts'
import styles from './ThemeSection.module.css'

/** Injected face for the Themes section (slot `inject`). */
export interface ThemeSectionInjected {
  /** Switch the preference or a registered theme id. */
  setTheme: (id: string) => void
  /** Section copy. */
  t: (key: ThemeKey) => string
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
  bg: string | undefined
  accent: string | undefined
}

function entryName(id: string, name: string | undefined, t: ThemeSectionInjected['t']): string {
  if (id === 'system') return t('appearance.system')
  if (name !== undefined) return name
  const key = BUILTIN_LABEL_KEYS[id]
  return key !== undefined ? t(key) : id
}

/**
 * Render the Themes section.
 * @param props - composed slot props.
 * @returns the gallery element tree.
 */
export function ThemeSection({ setTheme, t, useStore }: ThemeSectionProps) {
  const { preference, themes } = useStore(s => ({ preference: s.preference, themes: s.themes }))
  const entries: readonly GalleryEntry[] = [
    { id: 'system', name: t('appearance.system'), bg: undefined, accent: undefined },
    ...themes.map(theme => ({
      id: theme.id,
      name: entryName(theme.id, theme.name, t),
      bg: theme.tokens['--dsw-alias-bg-base'],
      accent: theme.tokens['--dsw-alias-brand-primary'],
    })),
  ]
  return (
    <div className={styles.gallery}>
      {entries.map(entry => (
        <button
          key={entry.id}
          type="button"
          className={clsx(styles.card, preference === entry.id && styles.selected)}
          aria-pressed={preference === entry.id}
          onClick={() => { setTheme(entry.id) }}
        >
          <span className={styles.swatch}>
            <span style={{ background: entry.bg ?? 'transparent' }} />
            <span style={{ background: entry.accent ?? 'transparent' }} />
          </span>
          <span className={styles.name}>{entry.name}</span>
        </button>
      ))}
    </div>
  )
}
