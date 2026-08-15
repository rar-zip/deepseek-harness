# Agent Note: curated themes and theme-owned stylesheets

Status: implemented

[English](2026-08-15-curated-themes.md) | 中文

## Problem

主题服务只把主题建模为别名 token 覆盖（`ThemeDefinition.tokens`）。颜色能通过 token 往返，但字体、网点纹理、页面缩放与选中墨色没有对应 token，因而无法成为已注册主题的一部分。此外，只有 `light`／`dark` 可选；内置一对之外没有精选主题库，任何第三方主题都要自带注册与设置界面。

## Decision

`ThemeDefinition` 增加可选 `css` 字段——一段原始样式表，由呈现器在该主题激活时注入、在切换或卸载时移除。`ui-layout` 呈现器为激活主题的 `css` 持有一个 `style[data-theme-css]` 节点，与既有的 token 变量和 `theme-color` 元数据并列。`ui-theme` 在 `src/themes.ts` 中以数据形式内置三套精选主题（`editor-dark`、`manga-ink`、`pencil-paper`）——每套都是一个 token 字典加一段可选 `css` 字符串，只使用系统字体栈与 CSS 渐变，因此一套主题保持几 KB，无 webfont、无图片负载。外观行在三个偏好立方体旁列出非内置的已注册主题，用主题自身 `bg-base` 与 `brand-primary` token 自动生成色板，而非截图资产。

## Alternatives considered

**独立的主题库包。** 拒绝：注册精选主题及其设置界面，本就属于拥有主题注册表与外观行的特性；拆一个包只会把注册表与其数据分开，却没有当前消费方。

**截图预览。** 拒绝：由 token 派生的色板不携带图片资产，且精选主题本就是 token 字典，截图会重复一份本已权威的数据。

**铅笔主题使用 webfont。** 拒绝：中文字体动辄数 MB；系统手写字体栈（`Segoe Print`／`楷体` 加 `cursive` 回退）让主题保持小体积且离线可用。

## Consequences

- 注册主题现在能通过其 `css` 字段表达任何 CSS 能表达的内容，而颜色仍由 token 驱动。
- 外观行扩展为展示精选主题；选择任一主题都会像内置偏好一样调用 `setTheme(id)`。
- 精选主题选择仍是进程内的：`setTheme` 只持久化内置的 `light`／`dark`／`system` 偏好，因此精选主题 id 不会跨刷新保留。这一点记为已知限制，作为后续事项（持久化所选主题 id，并在启动时精选主题注册后重新解析它）。
