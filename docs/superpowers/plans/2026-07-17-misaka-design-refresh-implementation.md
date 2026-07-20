# misaka.design Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the current Dante-based Astro site into `misaka.design` with a Chinese-first editorial identity, a featured-writing homepage, minimal content-model extensions, and restrained interaction polish without replacing the existing theme architecture.

**Architecture:** Keep the current Astro collections, routes, and most component files intact. Implement the refresh as a sequence of small edits: extend blog frontmatter for `article` vs `note`, add lightweight content helpers, switch the homepage from projects-first to writing-first, localize navigation and archive pages, then refine typography, color tokens, and motion in the existing layout shell.

**Tech Stack:** Astro 5, Astro content collections, TypeScript utilities, Tailwind CSS 4, `astro:transitions`, existing Dante components.

---

## File map

### Content model and helpers

- Modify: `src/content.config.ts` - extend the blog schema with `type`, `lang`, optional `translationKey`, and optional `readingTime`.
- Modify: `src/utils/data-utils.ts` - add helpers for featured-article fallback, post-type filtering, and latest-update selection.
- Modify: `src/types.ts` - add a dedicated homepage intro type instead of overloading the current `hero` shape.

### Site configuration and brand copy

- Modify: `src/data/site-config.ts` - replace Dante defaults with `misaka.design` branding, Chinese navigation labels, footer links, and homepage intro copy.
- Modify: `src/content/pages/about.md` - replace fictional template copy with Chinese-first personal copy or a truthful temporary draft.
- Modify: `src/content/pages/contact.md` - replace template contact copy with the user's channels or a clean temporary draft that matches the new tone.

### Homepage and archive surfaces

- Modify: `src/pages/index.astro` - remove project-first composition and render brand intro, one featured article, latest mixed updates, and topic entry points.
- Modify: `src/pages/blog/[...page].astro` - relabel the archive as 写作 and add All or Article or Note filtering UI.
- Modify: `src/pages/blog/[id].astro` - add article-type-aware metadata display and a long-form reading-progress hook.
- Modify: `src/pages/tags/index.astro` - localize tags page into 主题.
- Modify: `src/pages/tags/[id]/[...page].astro` - localize the tag archive page and keep pagination intact.

### Components and shell

- Modify: `src/components/Header.astro` - keep the avatar slot and swap the wordmark and subtitle treatment to `misaka.design`.
- Modify: `src/components/PostPreview.astro` - add article or note labels, localized copy, and a featured variant.
- Modify: `src/components/Nav.astro` - localize labels and refine active-state treatment.
- Modify: `src/components/NavLink.astro` - support a stronger active-state class contract.
- Modify: `src/components/Footer.astro` - align footer links and tone with the new brand.
- Modify: `src/components/FormattedDate.astro` - switch to Chinese date formatting.
- Modify: `src/layouts/BaseLayout.astro` - set `lang="zh-CN"` and preserve the global shell.
- Modify: `public/theme-toggle.js` - keep theme persistence but align with reduced-motion-safe transitions.

### Styling and motion

- Modify: `src/styles/global.css` - replace color tokens, add electric-blue accent variables, improve Chinese typography rhythm, define link underline motion, theme transitions, and reduced-motion handling.
- Modify: `src/components/ThemeToggle.astro` - keep the simple control but align its accessible label and visual styling with the refreshed palette.

### Verification

- Use: `npm run build` - required completion gate.
- Optional during implementation: `npm run dev` for manual QA, but do not claim success without a fresh build.

---

## Task 1: Extend the blog content model for articles, notes, and future translations

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/utils/data-utils.ts`
- Test: `npm run build`

- [ ] Update the blog schema with the new frontmatter fields. Add `type`, `lang`, optional `translationKey`, and optional `readingTime` with safe defaults or optional status.
- [ ] Add focused helpers in `src/utils/data-utils.ts`, including `isArticle`, `getFeaturedArticle`, and `getPostsByType`, so page files do not duplicate filtering logic.
- [ ] Run `npm run build` and confirm Astro still compiles before any content files are edited.
- [ ] Commit with `feat: extend blog content model for misaka refresh`.

## Task 2: Replace template brand defaults with `misaka.design` site configuration

**Files:**
- Modify: `src/data/site-config.ts`
- Modify: `src/types.ts`
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/components/FormattedDate.astro`
- Test: `npm run build`

- [ ] Add a dedicated `HomeIntro` type in `src/types.ts` and reference it from `SiteConfig`.
- [ ] Rewrite `src/data/site-config.ts` with Chinese-first branding: `misaka.design`, the approved lead line, Chinese navigation labels, and updated footer or social links.
- [ ] Update the header, footer, and date formatting so they no longer expose Dante defaults or English-first copy.
- [ ] Run `npm run build` and confirm the site compiles with the new config contract.
- [ ] Commit with `feat: apply misaka site branding`.

## Task 3: Recompose the homepage around featured writing and latest updates

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/components/PostPreview.astro`
- Modify: `src/utils/data-utils.ts`
- Test: `npm run build`

- [ ] Replace the current homepage composition so it no longer renders featured projects.
- [ ] Query one featured article and a limited list of latest mixed updates from the blog collection.
- [ ] Add a `featured` variant and a type label (`长文` or `札记`) to `src/components/PostPreview.astro`.
- [ ] Render the homepage in this order: brand intro, featured article, latest updates, topic entry points.
- [ ] Run `npm run build` and confirm the homepage compiles with no `projects` dependency.
- [ ] Commit with `feat: recompose homepage around writing`.

## Task 4: Localize the writing archive and topics pages

**Files:**
- Modify: `src/pages/blog/[...page].astro`
- Modify: `src/pages/tags/index.astro`
- Modify: `src/pages/tags/[id]/[...page].astro`
- Modify: `src/components/Pagination.astro`
- Test: `npm run build`

- [ ] Rename the archive page to 写作 and add a simple type-filter UI for all entries, articles, and notes.
- [ ] Localize the tags index to 主题 and use localized wording for each tag archive page.
- [ ] Replace pagination copy with `第 current / total 页`.
- [ ] Run `npm run build` and confirm archive, topic index, and paginated topic routes all still build.
- [ ] Commit with `feat: localize writing and topic archives`.

## Task 5: Refresh the visual tokens, typography, and restrained interaction system

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/Nav.astro`
- Modify: `src/components/NavLink.astro`
- Modify: `src/components/ThemeToggle.astro`
- Modify: `public/theme-toggle.js`
- Test: `npm run build`

- [ ] Replace the default color tokens with a neutral off-white light mode, charcoal dark mode, and electric-blue accent.
- [ ] Add improved Chinese typography rhythm, link underline motion, selection color, and reduced-motion-safe transitions in `src/styles/global.css`.
- [ ] Set `lang="zh-CN"` in `src/layouts/BaseLayout.astro` and add a stronger active-state hook in `src/components/NavLink.astro`.
- [ ] Keep theme persistence in `public/theme-toggle.js`, but make sure any transitions remain lightweight and reduced-motion-safe.
- [ ] Run `npm run build` and confirm the refreshed shell still compiles.
- [ ] Commit with `feat: refresh visual system and navigation interactions`.

## Task 6: Add article-page polish and seed the content with the new frontmatter

**Files:**
- Modify: `src/pages/blog/[id].astro`
- Modify: selected files in `src/content/blog/*.md`
- Modify: `src/content/pages/about.md`
- Modify: `src/content/pages/contact.md`
- Test: `npm run build`

- [ ] Add a long-form-only reading progress hook to `src/pages/blog/[id].astro` and skip it for notes.
- [ ] Update selected content files with `type` and `lang`, and mark at least one entry as `note` so the mixed-update behavior is exercised.
- [ ] Rewrite `src/content/pages/about.md` and `src/content/pages/contact.md` so they no longer mention fictional identities or theme demos.
- [ ] Run `npm run build` as the completion gate.
- [ ] Commit with `feat: finalize article polish and localized content`.

---

## Plan self-review

### Spec coverage

- Brand identity and Chinese-first positioning are covered in Tasks 2, 5, and 6.
- Homepage order of brand intro, featured article, latest updates, and topic entry points is covered in Task 3.
- Writing vs notes content model and bilingual slot reservation are covered in Tasks 1 and 6.
- Navigation, 写作, and 主题 localization are covered in Tasks 2 and 4.
- Editorial visual system and restrained motion are covered in Task 5.
- Long-form-only reading progress is covered in Task 6.

### Placeholder scan

- No `TBD` or `TODO` placeholders remain inside the actionable tasks.

### Type consistency

- `type` uses `article | note` consistently across schema, helpers, previews, archive logic, and post-page logic.
- `lang` uses `zh-CN | en` consistently across schema and future language-slot handling.
- `homeIntro` is defined once in `src/types.ts` and referenced consistently in `site-config.ts` and `index.astro`.
