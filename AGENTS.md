<!-- FOR AI AGENTS - Repository-specific instructions -->

# AGENTS.md

## Scope

These instructions apply to the entire repository. Explicit user instructions
take precedence.

This file is an index only. Each module's rules live in its own skill under
`.claude/skills/`, so the detail loads into context only when it is relevant.
**Read the matching skill before working on a module.**

## Modules

| Module | Code and content | Route | Skill |
| --- | --- | --- | --- |
| 写作 | `src/content/blog/` | `/blog/<slug>`, `/en/blog/<slug>` | `blog-post` |
| 专辑 | `src/content/albums/` | `/albums/<slug>` | `album-curation` |
| 便利贴墙 | `src/{utils,components}/wall/` | `/wall` | `sticky-wall` |
| 首页叙事 | `src/data/home-story.ts`, `src/components/home/` | `/` | `home-story` |
| 时间线 | `src/pages/timeline.astro` | `/timeline` | — |
| 项目 | `src/content/projects/` | `/projects/<slug>` | — |
| 独立页 | `src/content/pages/` | `/<slug>` | — |
| 主题 | derived from blog tags | `/tags`, `/tags/<tag>` | — |

Cross-cutting: `design-tokens` governs every colour, font and theme change in
the repo.

## Shared rules

**URLs are permanent.** Once a page is public its path does not change. Dates,
types and tags are frontmatter, never path segments. Use `publicSlug` to pin a
URL when a filename has to change.

**No literal colours in CSS rules.** Everything goes through the custom
property contract. `tests/design-tokens.test.ts` enforces this and reports the
offending file and line. See the `design-tokens` skill.

**Images belong in `src/assets/`** so Astro validates and processes them at
build time. Use `public/` only when a file needs a stable, unprocessed URL
(downloads, favicon, the default share image), referenced from the site root.

**Write meaningful `alt` text.** Empty `alt` is only for genuinely decorative
images.

**The shell is deliberately thin.** `BaseLayout`, `Nav` and `Footer` carry no
module logic; modules bring their own layout inside the slot. Keep it that way
so the shell stays replaceable.

## Verification

Run both after any change:

```sh
npm run build
npm test
```

The build fails on broken image paths, so a clean build means images resolve.
Confirm generated URLs match the table above.

Album entries cite external pages — verify every `url` returns 200 and store
the post-redirect canonical URL. The `album-curation` skill has the command.

Tests cover utilities, scripts and the token contract, but not visual layout
or real pointer or scroll behaviour. After touching the wall or the homepage
story, exercise it in a browser.
