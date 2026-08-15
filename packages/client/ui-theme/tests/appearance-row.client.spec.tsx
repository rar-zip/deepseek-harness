// @vitest-environment jsdom
/** AppearanceRow behavior: three cubes, selection follows the persisted
 * preference, clicks drive setTheme. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { AppearanceRow } from '../src/client/AppearanceRow.tsx'
import type { AppearanceRowComponentProps } from '../src/client/AppearanceRow.tsx'
import { createAppearanceRowStore } from '../src/client/settings-store.ts'
import type { ThemeDefinition } from '../src/client/index.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'theme.editor-dark': 'Editor Dark',
  'theme.manga-ink': 'Manga Ink',
  'theme.pencil-paper': 'Pencil Paper',
}

/** Empty global standard-kit hooks (the row reads neither). */
function emptySessions() {
  const store = createSnapshotStore<SessionListState>(
    { ids: [], byId: {}, current: undefined, phase: 'ready', subagentsByParent: {}, jobsBySession: {}, currentAddress: undefined })
  return bindSnapshotSelector(store)
}
function emptyWorkspaces() {
  const store = createSnapshotStore<WorkspaceListState>({
    items: [], archivedSessionIds: [], state: 'idle', phase: 'ready', error: null,
    baselinesReady: true, recentWorkspaceId: undefined,
  })
  return bindSnapshotSelector(store)
}

function mount(preference: string = 'system', themes: readonly ThemeDefinition[] = []) {
  // Real store instance — the sanctioned zero-machinery path for tests.
  const store = createAppearanceRowStore().create()
  store.actions.sync(preference, themes, 0)
  const setTheme = vi.fn()
  const props: AppearanceRowComponentProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    t: (key: string) => COPY[key] ?? key,
    setTheme,
  }
  render(<AppearanceRow {...props} />)
  return { store, setTheme }
}

const pressed = (name: RegExp): string | null =>
  screen.getByRole('button', { name }).getAttribute('aria-pressed')

describe('AppearanceRow', () => {
  it('renders the title and three cubes with the preference cube selected', () => {
    mount('dark')
    expect(screen.getByText('Appearance')).toBeDefined()
    expect(pressed(/Dark/)).toBe('true')
    expect(pressed(/Light/)).toBe('false')
    expect(pressed(/System/)).toBe('false')
  })

  it('click drives setTheme; selection follows the store mirror, not the click echo', () => {
    const b = mount('dark')
    fireEvent.click(screen.getByRole('button', { name: /Light/ }))
    expect(b.setTheme).toHaveBeenCalledWith('light')
    // No store write yet: selection is unchanged.
    expect(pressed(/Dark/)).toBe('true')
    act(() => { b.store.actions.sync('light', [], 1) })
    expect(pressed(/Light/)).toBe('true')
    expect(pressed(/Dark/)).toBe('false')
  })

  it('renders curated themes beside the three cubes and marks the selected one', () => {
    const curated: readonly ThemeDefinition[] = [
      { id: 'editor-dark', colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': '#111', '--dsw-alias-brand-primary': '#4d9fff' } },
      { id: 'manga-ink', colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': '#222', '--dsw-alias-brand-primary': '#ffd60a' } },
    ]
    mount('editor-dark', curated)
    expect(screen.getByText('Editor Dark')).toBeDefined()
    expect(screen.getByText('Manga Ink')).toBeDefined()
    expect(pressed(/Editor Dark/)).toBe('true')
    expect(pressed(/Manga Ink/)).toBe('false')
  })

  it('click on a curated theme drives setTheme with its id', () => {
    const curated: readonly ThemeDefinition[] = [
      { id: 'pencil-paper', colorScheme: 'light', tokens: { '--dsw-alias-bg-base': '#fff' } },
    ]
    const b = mount('system', curated)
    fireEvent.click(screen.getByRole('button', { name: /Pencil Paper/ }))
    expect(b.setTheme).toHaveBeenCalledWith('pencil-paper')
  })
})
