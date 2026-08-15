/** Theme-file import validation: the file boundary between user JSON and the theme registry. */

import type { ThemeDefinition } from './index.ts'

/** Structural face of the theme registry the importer writes through. */
export interface ThemeImportTarget {
  getTheme(): { themes: readonly ThemeDefinition[] }
  register(definition: ThemeDefinition): void
  setTheme(id: string): void
}

/**
 * Parse and validate one imported theme file. Every field is checked at
 * runtime because this is the file boundary; the registry trusts its typed callers.
 * @param jsonText - raw file text.
 * @returns the validated theme definition.
 */
export function parseThemeDefinition(jsonText: string): ThemeDefinition {
  let raw: unknown
  try {
    raw = JSON.parse(jsonText)
  } catch {
    throw new Error('主题文件不是有效的 JSON')
  }
  if (typeof raw !== 'object' || raw === null) throw new Error('主题必须是 JSON 对象')
  const obj = raw as Record<string, unknown>
  if (typeof obj.id !== 'string' || obj.id.length === 0) throw new Error('缺少字符串字段 id')
  if (obj.colorScheme !== 'light' && obj.colorScheme !== 'dark') throw new Error('colorScheme 必须是 "light" 或 "dark"')
  if (typeof obj.tokens !== 'object' || obj.tokens === null) throw new Error('缺少 tokens 对象')
  const tokens: Record<string, string> = {}
  for (const [name, value] of Object.entries(obj.tokens)) {
    if (typeof value !== 'string') throw new Error(`token "${name}" 必须是字符串`)
    tokens[name] = value
  }
  const definition: ThemeDefinition = { id: obj.id, colorScheme: obj.colorScheme, tokens }
  if (typeof obj.name === 'string') definition.name = obj.name
  if (typeof obj.css === 'string') definition.css = obj.css
  return definition
}

/**
 * Import one theme file, registering and selecting it. Returns an error
 * message on failure, or null on success.
 * @param target - the theme registry to write through.
 * @param jsonText - raw file text.
 * @returns a user-facing error message, or null.
 */
export function importTheme(target: ThemeImportTarget, jsonText: string): string | null {
  try {
    const definition = parseThemeDefinition(jsonText)
    if (target.getTheme().themes.some(t => t.id === definition.id)) {
      return `主题 "${definition.id}" 已存在`
    }
    target.register(definition)
    target.setTheme(definition.id)
    return null
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}
