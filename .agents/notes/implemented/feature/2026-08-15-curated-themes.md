# Agent Note: curated themes and theme-owned stylesheets

Status: implemented

[English](2026-08-15-curated-themes.md) | [中文](2026-08-15-curated-themes.zh.md)

## Problem

The theme service modeled a theme as alias-token overrides only (`ThemeDefinition.tokens`). Colors round-trip through tokens, but fonts, halftone textures, page zoom, and selection ink have no token, so they cannot be part of a registered theme. Separately, only `light`/`dark` were selectable; there was no curated gallery beyond the built-in pair, and any third-party theme needed its own registration and settings surface.

## Decision

`ThemeDefinition` gains an optional `css` field — a raw stylesheet the presenter injects while that theme is active and removes on switch or dispose. The `ui-layout` presenter owns one `style[data-theme-css]` node for the active theme's `css`, alongside its existing token variables and `theme-color` metadata. `ui-theme` ships three curated themes (`editor-dark`, `manga-ink`, `pencil-paper`) as data in `src/themes.ts` — each a token dictionary plus an optional `css` string, using system font stacks and CSS gradients only so a theme stays a few kilobytes with no webfont or image payload. The Appearance row lists registered non-built-in themes beside the three preference cubes, rendering an auto-generated swatch from each theme's own `bg-base` and `brand-primary` tokens instead of a screenshot asset.

## Alternatives considered

**A separate theme-library package.** Rejected: registering curated themes and their settings surface belongs to the feature that owns the theme registry and the Appearance row; a new package only splits the registry from its data for no current consumer.

**Screenshot previews.** Rejected: a token-derived swatch carries no image asset, and a curated theme is a token dictionary, so a screenshot would duplicate data that is already authoritative.

**Webfonts for the pencil theme.** Rejected: a Chinese webfont is several megabytes; the system handwriting stack (`Segoe Print`/`楷体` with `cursive` fallback) keeps the theme small and offline-safe.

## Consequences

- A registered theme can now express anything CSS can, through its `css` field, while colors stay token-driven.
- The Appearance row grows to show curated themes; selecting one calls `setTheme(id)` like any preference.
- Curated theme selection stays in-process: `setTheme` persists only the built-in `light`/`dark`/`system` preference, so a curated id does not survive a reload. That is recorded as a Known Limitation and is the follow-up (persist the selected theme id, and re-resolve it once the curated themes register at boot).
