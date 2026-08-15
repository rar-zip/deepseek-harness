/**
 * Host-rendered theme bootstrap for the browser's pre-plugin interval. Each
 * index response embeds the current durable preference; the browser resolves
 * only `system` (and falls back to `system` for a registered theme id it
 * cannot yet resolve), then writes the same DOM fields ui-layout's
 * ThemePresenter owns after the client plugin tree activates.
 */

import { DEFAULT_PREFERENCE } from './theme-settings.ts'

/** Build the inline script for one durable preference (built-in or theme id). */
function bootThemeScript(preference: string): string {
  return `<script>(() => {
  const preference = ${JSON.stringify(preference)}
  const builtin = preference === 'light' || preference === 'dark' || preference === 'system'
  const effective = builtin ? preference : 'system'
  const systemDark = effective === 'system'
    && typeof matchMedia !== 'undefined'
    && matchMedia('(prefers-color-scheme: dark)').matches
  const dark = effective === 'dark' || systemDark
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.body.toggleAttribute('data-ds-dark-theme', dark)
})()</script>`
}

/**
 * Insert the theme bootstrap immediately after the opening body tag, before
 * the shell mount and module script. Body-less fragments receive it at the
 * end, where the HTML parser has already synthesized a body.
 * @param html - Raw application index HTML.
 * @param preference - Current Host-backed durable preference.
 * @returns HTML containing the theme bootstrap.
 */
export function injectBootTheme(
  html: string,
  preference: string = DEFAULT_PREFERENCE,
): string {
  const script = bootThemeScript(preference)
  const body = /<body(?:\s[^>]*)?>/i.exec(html)
  if (body === null) return `${html}${script}`
  const at = body.index + body[0].length
  return `${html.slice(0, at)}${script}${html.slice(at)}`
}
