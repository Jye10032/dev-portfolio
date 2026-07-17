# misaka.design Dante Theme Refresh Design

## Summary

Refresh the existing Dante Astro portfolio/blog into `misaka.design`, a Chinese-first personal knowledge garden that presents the author as a front-end engineer with strong product, user-experience, and aesthetic judgment. Keep Dante's single-column information architecture and Astro content flow, but replace the template identity, homepage priorities, typography, and interaction language so the site feels editorial, restrained, and distinctly personal.

## Why this refresh exists

The current repo has already integrated the Dante Astro theme, but it still exposes template defaults such as the `Dante` site title, fictional author copy, stock imagery, English-first labels, and a homepage that gives projects equal priority with writing. That makes the site read like a generic template demo instead of a living knowledge garden.

The refresh should make visitors feel three things quickly:

1. This site belongs to `misaka` and not to the original theme demo.
2. The author thinks deeply about design, AI, and career growth.
3. The author can implement polished interactions without turning the site into a flashy portfolio.

## Goals

- Establish `misaka.design` as the primary brand and homepage identity.
- Shift the site from "portfolio with a blog" to "knowledge garden with supporting personal profile".
- Prioritize long-form writing and short notes over project listings.
- Preserve the current Dante codebase shape where possible; prefer style, copy, and small component changes over structural rewrites.
- Introduce restrained, high-quality micro-interactions that support reading instead of distracting from it.
- Keep the site Chinese-first while reserving room for future bilingual article pairs.

## Non-goals

- No CMS, database, or external content platform.
- No search system, full knowledge graph, or complex taxonomy redesign.
- No large visual rebuild that discards Dante's routing, content collections, or overall page skeleton.
- No always-on decorative animation such as particles, cursor trails, or heavy parallax.
- No forced English UI before actual English content exists.

## Audience

Primary audiences:

- Hiring managers and technical leads who need fast evidence of taste, clarity, and implementation ability.
- Front-end peers who care about design, AI workflows, and thoughtful engineering.

Secondary audience:

- Broader readers who discover the site through writing on design, AI, and career growth.

## Brand positioning

The site voice should frame `misaka` as a front-end engineer whose work is grounded in product thinking and user experience, not just framework proficiency. The homepage should feel like the front page of a personal editorial publication rather than a commercial portfolio.

Approved homepage lead line:

> 关于设计、AI，以及一个前端工程师如何持续成长。

Brand handling rules:

- Use `misaka.design` as the primary wordmark.
- Keep the avatar slot for now and swap in a user-provided image later.
- Do not use a real-person photo as the central identity treatment.
- Treat any `misaka` pop-culture reference as a subtle easter egg only; use small electric-blue accents rather than anime-themed visuals.

## Content strategy

### Content types

The site will center on two public writing formats:

1. `article`: complete long-form pieces with a clear point of view, structure, and durable value.
2. `note`: short updates, observations, and in-progress thinking that show continued growth.

Project retrospectives should be published as `article` posts rather than restored as a first-class homepage section.

### Topic pillars

The main editorial pillars are:

- Design with a product and user-experience emphasis.
- AI workflows, tooling, and changing ways of working.
- Career growth and personal observation.

Front-end engineering remains visible as the execution layer beneath these topics rather than the headline category.

### Language strategy

- Launch with Chinese UI and Chinese content only.
- Reserve data fields for future bilingual article mapping.
- Only show a language switcher when a matching alternate-language article exists.

## Information architecture

### Top navigation

Replace the current template navigation with:

- 首页
- 写作
- 主题
- 关于

`Projects` should be removed from the main navigation and from the homepage. The existing projects pages may remain in the repo, but they should not shape the public information architecture during this phase.

### Homepage structure

The homepage should be reorganized to:

1. Brand opening: avatar, `misaka.design`, lead line, and a short identity paragraph.
2. Featured article: exactly one highlighted long-form piece.
3. Latest updates: reverse-chronological mix of articles and notes.
4. Topic entry points: design, AI, career growth and observation.
5. Footer: GitHub, RSS, email, and copyright.

The homepage should not include a large hero photograph. The emotional weight should come from typography, rhythm, and curation.

### Writing archive

The current blog archive should become the canonical writing index. It should support three viewing states:

- 全部
- 长文
- 札记

This can be implemented with light filtering on top of the existing content collection instead of a new content system.

### Topics page

Reuse the existing tags system as the "主题" page. Rename labels and supporting copy into Chinese, and present topics as editorial discovery paths rather than raw taxonomy.

## Visual system

### Overall mood

Use an editorial black-and-white foundation with small electric-blue accents. The impression should be restrained, intelligent, and quietly engineered.

### Color rules

- Light mode: neutral paper-like off-white background, not the current warm beige.
- Dark mode: charcoal-black background, not blue-black.
- Main structure: black and gray text, dividers, and borders.
- Accent: electric blue used sparingly for focus, active states, selected text, and short interaction feedback.

Accent blue must stay rare; if it becomes a large-surface color, the site will lose its editorial balance.

### Typography

- UI and body text: Inter plus Chinese system or web-safe sans fallbacks.
- Display and long-form emphasis: serif-style Chinese headings or a serif-like treatment for titles and block quotes.
- Code: a dedicated monospace style that clearly separates implementation references from prose.

Typography should do most of the visual work. Avoid card-heavy layouts and decorative ornaments.

### Layout rules

- Keep Dante's narrow, single-column reading layout.
- Preserve strong whitespace and generous paragraph rhythm.
- Use thin dividers, metadata labels, and type scale to create hierarchy.
- Avoid masonry grids or dense card walls.

## Interaction design

Interactions should feel precise and lightweight. Every motion must either clarify state or reward deliberate interaction.

Approved interaction rules:

- Page transitions: short fade plus slight upward settling, around 200ms.
- Link hover: animated electric-blue underline or subtle directional motion.
- Archive item hover: small arrow shift and title emphasis only; no card lift.
- Navigation active state: understated blue dot, rule, or line treatment.
- Theme switch: smooth transition of background, text, and border colors.
- Wordmark easter egg: the dot in `misaka.design` may flash once on first load.
- Article reading progress: an ultra-thin progress line on long-form article pages only.

Motion safety rules:

- Respect reduced-motion preferences.
- Disable non-essential movement when reduced motion is enabled.
- Do not introduce cursor-follow, persistent glow, autoplay loops, or decorative parallax.

## Content model changes

Keep the existing Astro `blog` collection and extend it minimally.

Recommended frontmatter additions:

- `type: article | note`
- `lang: zh-CN | en`
- `translationKey` for future article pairing
- optional reading metadata for long-form entries, such as reading time if needed

Keep using:

- `isFeatured` to drive the single featured article
- `tags` for topic grouping
- `seo` for page metadata

Fallback behavior:

- If no post is manually featured, use the latest `article` entry as the featured piece.
- If no notes exist, the latest updates list still renders naturally with articles only.
- If no translation pair exists, hide language controls entirely.

## Component impact

The refresh should remain close to the current file structure. Expected touch points include:

- Site configuration for brand copy, nav labels, and footer links.
- Header and hero-related components to remove template language and photo-first emphasis.
- Homepage composition to swap `Projects` prominence for featured writing and latest updates.
- Blog/archive components to display article vs note labels and filtering.
- Global styles for typography, spacing, color tokens, and transitions.
- Theme toggle and navigation states for refined interaction behavior.

This phase should avoid introducing a parallel design system or duplicating whole page templates when targeted edits to existing components are sufficient.

## Accessibility and quality requirements

- Chinese typography must stay readable across desktop and mobile widths.
- Light and dark themes must maintain comfortable contrast.
- Keyboard focus states must remain visible and use the accent system clearly.
- Reduced-motion preference must disable optional movement.
- RSS and canonical metadata should continue working after copy and route changes.
- The site must still build cleanly with Astro after the refresh.

## Success criteria

The refresh is successful when:

- The site no longer reads like a stock Dante demo.
- A first-time visitor can identify `misaka.design` and the site's editorial direction within seconds.
- Writing clearly leads the homepage, with one featured article and a living stream of updates.
- The visual polish feels intentional but not showy.
- The change set remains incremental enough that the codebase still looks like a maintained Dante derivative rather than a fragmented fork.

## Open decisions intentionally deferred

These items are intentionally out of scope for this design and can be decided later without blocking implementation planning:

- Final avatar image selection and cropping.
- Exact accent-blue value after visual testing.
- Whether reading-time metadata is computed or stored manually.
- The first batch of posts that should be marked as `note` versus `article`.

Those are execution details, not blockers for the design itself.
