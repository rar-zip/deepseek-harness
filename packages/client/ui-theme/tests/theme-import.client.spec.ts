/** Theme-file import validation: parse and registry-write boundaries. */
import { describe, expect, it } from 'vitest'
import { importTheme, parseThemeDefinition, type ThemeImportTarget } from '../src/client/theme-import.ts'
import type { ThemeDefinition } from '../src/client/index.ts'

/** A minimal registry double recording register and setTheme writes. */
function target(initial: readonly ThemeDefinition[] = []) {
  const registered: ThemeDefinition[] = [...initial]
  const selected: string[] = []
  const t: ThemeImportTarget & { registered: ThemeDefinition[]; selected: string[] } = {
    getTheme: () => ({ themes: registered }),
    register: (d) => { registered.push(d) },
    setTheme: (id) => { selected.push(id) },
    registered,
    selected,
  }
  return t
}

describe('parseThemeDefinition', () => {
  it('parses a full theme file', () => {
    const d = parseThemeDefinition(JSON.stringify({ id: 'x', name: 'X', colorScheme: 'dark', tokens: { '--a': '#111' }, css: 'body{}' }))
    expect(d).toEqual({ id: 'x', name: 'X', colorScheme: 'dark', tokens: { '--a': '#111' }, css: 'body{}' })
  })

  it('rejects malformed input', () => {
    expect(() => parseThemeDefinition('not json')).toThrow('JSON')
    expect(() => parseThemeDefinition('{}')).toThrow('id')
    expect(() => parseThemeDefinition(JSON.stringify({ id: 'x', colorScheme: 'sepia', tokens: {} }))).toThrow('colorScheme')
    expect(() => parseThemeDefinition(JSON.stringify({ id: 'x', colorScheme: 'light', tokens: { '--a': 1 } }))).toThrow('字符串')
  })
})

describe('importTheme', () => {
  it('registers and selects a valid theme', () => {
    const t = target()
    const err = importTheme(t, JSON.stringify({ id: 'x', colorScheme: 'light', tokens: { '--a': '#111' } }))
    expect(err).toBeNull()
    expect(t.registered.map(d => d.id)).toEqual(['x'])
    expect(t.selected).toEqual(['x'])
  })

  it('reports a duplicate id', () => {
    const t = target([{ id: 'x', colorScheme: 'light', tokens: {} }])
    expect(importTheme(t, JSON.stringify({ id: 'x', colorScheme: 'light', tokens: {} }))).toContain('已存在')
  })

  it('reports a parse error', () => {
    expect(importTheme(target(), 'not json')).toContain('JSON')
  })
})
