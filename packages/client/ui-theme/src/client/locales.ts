/** `settings.theme` namespace dictionaries (the Appearance row's copy). */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'appearance.title': '外观',
  'appearance.light': '浅色',
  'appearance.dark': '深色',
  'appearance.system': '跟随系统',
  'theme.editor-dark': '沉浸深色',
  'theme.manga-ink': '线条动漫',
  'theme.pencil-paper': '黑白纸',
} satisfies Record<string, string>

/** The settings.theme namespace key union. */
export type ThemeKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'appearance.title': 'Appearance',
  'appearance.light': 'Light',
  'appearance.dark': 'Dark',
  'appearance.system': 'System',
  'theme.editor-dark': 'Editor Dark',
  'theme.manga-ink': 'Manga Ink',
  'theme.pencil-paper': 'Pencil Paper',
} satisfies Record<ThemeKey, string>
