---
name: design-tokens
description: 改这个博客的配色、字体或主题观感时使用。当用户说「换主题」「改配色」「调成暖色/冷色」「改字体」「暗色模式不对」「加一个新颜色」，或你要给组件写任何颜色值时触发。本站的颜色全部走 CSS 自定义属性契约，改主题只准动 token 块。
---

# 设计 token 契约

整站观感收敛成 CSS 自定义属性。**换主题 = 只改 token 块，不碰任何组件。**

这条契约由 `tests/design-tokens.test.ts` 强制执行，违反会让 `npm test` 失败并指出具体文件和行号。

## 唯一的硬规则

**规则里不准出现字面颜色值。** 任何 `#rrggbb`、`rgb(...)`、`hsl(...)` 只能出现在 token 块里——也就是「块内所有声明都以 `--` 开头」的那种块。组件和页面只能写 `var(--token)`。

原因不是洁癖。写在规则里的字面色值是主题切换碰不到的值，实践中它一定变成暗色模式的 bug——`rgb(0 0 0 / 0.08)` 的横线在浅色便签上好看，在深色便签上等于没有。

## token 住在哪

**全局 token** — `src/styles/global.css`，两个块必须成对：

```css
:root {
    /* 浅色 */
}
html.dark {
    /* 深色,每个颜色 token 都要有对应项 */
}
```

现有全局 token：

| 用途 | token |
| --- | --- |
| 文字与描边 | `--text-main` `--border-main` `--accent` `--accent-muted` |
| 背景 | `--bg-main` `--bg-muted` |
| 便利贴色板 | `--note-yellow` `--note-mint` `--note-blue` `--note-coral` `--note-lavender` `--note-cream` `--note-text` |
| 便利贴墙 | `--wall-paper` `--wall-dot` `--wall-tape` `--wall-tape-edge` `--wall-shadow-sm/md/lg` |
| 字体栈 | `--font-sans` `--font-serif`（在 `@theme inline` 里） |

**模块 token** — 模块样式表顶部自带一个块，加一个 `.dark` 对应块。`src/styles/home-story.css` 是范例：`--home-paper`、`--home-ink`、`--home-vermilion`、`--home-terminal-*`、`--home-shadow-*`，底部有 `.dark .home-story, .dark body:has(.home-story)` 覆盖。

模块 token 属于模块自己，别往 `global.css` 塞。这样模块才能整包拷给别人用。

## 怎么换主题

改 `global.css` 的 `:root` 和 `html.dark` 两个块，**只改值，不改名**。组件零改动。

有模块级 token 的模块（目前只有 home-story）要同步改它自己的两个块，否则首页会和其余页面脱节。

## 加新颜色时

1. 先看现有 token 能不能复用。能复用就别加。
2. 能从已有 token 派生的，用 `color-mix` 而不是新 token：
   ```css
   color: color-mix(in srgb, var(--text-main) 64%, transparent);
   ```
   派生值会跟着主题自动走。便签的横线和网格就是这么做的——从 `--note-text` 派生，深色模式下自动翻成浅色线。
3. 确实需要新 token 时，`:root` 和 `html.dark` 都要加，命名按 `--<模块>-<用途>`。
4. 阴影存完整的 `box-shadow` 值，不只存颜色。深色模式往往需要不同的模糊半径和透明度，不是单纯换个色。

## 刻意的例外

`--home-terminal-bg` / `--home-terminal-ink` / `--home-terminal-accent` 在深浅两套下是同一个值，因为它是终端模拟器的仿真外观，不是页面表面。测试里显式豁免了这三个。再加这类例外要同步更新测试的豁免清单，并在 CSS 里写清为什么。

## 验证

```sh
npm test                 # 契约检查 + 其余测试
npm run build
```

契约检查做三件事：扫全部 `src/**/*.{css,astro}` 找规则里的字面色值；核对 `:root` 的每个颜色 token 在 `html.dark` 里都有对应项；核对 home-story 的模块 token 同样成对。

改完配色后在浏览器里切一次亮暗模式实看。测试只能保证值能被主题触达，保证不了对比度合适。
