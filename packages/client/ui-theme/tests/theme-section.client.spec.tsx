// @vitest-environment jsdom
/** ThemeSection behavior: gallery lists the system preference plus registered
 * themes with names, and clicks drive setTheme. */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { createSnapshotStore, type SessionListState, type WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import { bindSnapshotSelector } from '@deepseek-ai/dsh-client-web-react'
import { ThemeSection } from '../src/client/ThemeSection.tsx'
import type { ThemeSectionProps } from '../src/client/ThemeSection.tsx'
import { createAppearanceRowStore } from '../src/client/settings-store.ts'
import type { ThemeDefinition } from '../src/client/index.ts'

afterEach(cleanup)

const COPY: Record<string, string> = {
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'themes.nav': 'Themes',
}

/** Empty global standard-kit hooks (the section reads neither). */
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
  const store = createAppearanceRowStore().create()
  store.actions.sync(preference, themes, 0)
  const setTheme = vi.fn()
  const props: ThemeSectionProps = {
    useSessions: emptySessions(),
    useWorkspaces: emptyWorkspaces(),
    close: () => {},
    useStore: bindSnapshotSelector(store),
    actions: store.actions,
    setTheme,
    t: (key: string) => COPY[key] ?? key,
  }
  render(<ThemeSection {...props} />)
  return { store, setTheme }
}

describe('ThemeSection', () => {
  it('renders the system preference plus registered themes with names and selection', () => {
    const themes: readonly ThemeDefinition[] = [
      { id: 'light', colorScheme: 'light', tokens: {} },
      { id: 'dark', colorScheme: 'dark', tokens: {} },
      { id: 'neon-purple', name: '霓虹紫黑', colorScheme: 'dark', tokens: { '--dsw-alias-bg-base': '#0a0a14', '--dsw-alias-brand-primary': '#a855f7' } },
    ]
    mount('neon-purple', themes)
    expect(screen.getByText('System')).toBeDefined()
    expect(screen.getByText('Light')).toBeDefined()
    expect(screen.getByText('霓虹紫黑')).toBeDefined()
    expect(screen.getByRole('button', { name: /霓虹紫黑/ }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: /System/ }).getAttribute('aria-pressed')).toBe('false')
  })

  it('click drives setTheme with the entry id', () => {
    const themes: readonly ThemeDefinition[] = [
      { id: 'terminal-green', name: '终端绿黑', colorScheme: 'dark', tokens: {} },
    ]
    const b = mount('system', themes)
    fireEvent.click(screen.getByRole('button', { name: /终端绿黑/ }))
    expect(b.setTheme).toHaveBeenCalledWith('terminal-green')
  })
})
