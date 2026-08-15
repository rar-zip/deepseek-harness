/**
 * Appearance preference row registered into the General section item slot
 * (figma 501:30012 'Frame 2117131228'): title + three preference cubes, plus
 * one cube per registered curated theme with an auto-generated token swatch.
 * Registered by this package — the theme feature owns its own settings
 * surface. Selection follows the persisted preference, never the resolved
 * active theme.
 */
import clsx from 'clsx'
import {
  IconDarkOutline16, IconFollowsystemOutline16, IconLightOutline16,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { ThemeKey } from './locales.ts'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { createAppearanceRowStore } from './settings-store.ts'
import css from './AppearanceRow.module.css'

/** Injected business face: the preference write (t rides the standard locale seat). */
export interface AppearanceRowInjected {
  /** Switch the theme preference or a registered theme id. */
  setTheme: (id: string) => void
}

/** Full component props: runtime share + store share + locale seat + injected face. */
export type AppearanceRowComponentProps =
  PropsRuntime<'settings.general.item'> & PropsStore<ReturnType<typeof createAppearanceRowStore>>
  & PropsLocale<'settings.theme'> & AppearanceRowInjected

/** Cube order and icons (figma 501:30015-30017: Light, Dark, System). */
const CUBES: readonly { id: 'light' | 'dark' | 'system'; labelKey: ThemeKey; Icon: typeof IconLightOutline16 }[] = [
  { id: 'light', labelKey: 'appearance.light', Icon: IconLightOutline16 },
  { id: 'dark', labelKey: 'appearance.dark', Icon: IconDarkOutline16 },
  { id: 'system', labelKey: 'appearance.system', Icon: IconFollowsystemOutline16 },
]

/** Locale keys for curated theme display names; unknown ids render bare. */
const CURATED_LABEL_KEYS: Record<string, ThemeKey> = {
  'editor-dark': 'theme.editor-dark',
  'manga-ink': 'theme.manga-ink',
  'pencil-paper': 'theme.pencil-paper',
}

/**
 * Render the Appearance row.
 * @param props - composed slot props.
 * @returns the row element tree.
 */
export function AppearanceRow({ t, setTheme, useStore }: AppearanceRowComponentProps) {
  const { preference, themes } = useStore(s => ({ preference: s.preference, themes: s.themes }))
  const curated = themes.filter(theme => theme.id !== 'light' && theme.id !== 'dark')
  return (
    <div className={css.group}>
      <div className={css.title}>{t('appearance.title')}</div>
      <div className={css.cubeRow}>
        {CUBES.map(({ id, labelKey, Icon }) => (
          <button
            key={id}
            type="button"
            className={clsx(css.themeCube, preference === id && css.selected)}
            aria-pressed={preference === id}
            onClick={() => { setTheme(id) }}
          >
            <Icon />
            {t(labelKey)}
          </button>
        ))}
      </div>
      {curated.length > 0 && (
        <div className={css.cubeRow}>
          {curated.map(theme => {
            const labelKey = CURATED_LABEL_KEYS[theme.id]
            const label = labelKey !== undefined ? t(labelKey) : theme.id
            return (
              <button
                key={theme.id}
                type="button"
                className={clsx(css.themeCube, preference === theme.id && css.selected)}
                aria-pressed={preference === theme.id}
                onClick={() => { setTheme(theme.id) }}
              >
                <span className={css.swatch}>
                  <span style={{ background: theme.tokens['--dsw-alias-bg-base'] ?? 'transparent' }} />
                  <span style={{ background: theme.tokens['--dsw-alias-brand-primary'] ?? 'transparent' }} />
                </span>
                {label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
