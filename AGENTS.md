<!-- FOR AI AGENTS - Repository-specific instructions -->

# AGENTS.md

## Scope

These instructions apply to the entire repository. Explicit user instructions take precedence.

## Content Modules

Each content module owns a directory, a schema, and a route. Module-specific
authoring rules live in a skill under `.claude/skills/`; this file only covers
what is shared.

| Module | Content | Route | Skill |
| --- | --- | --- | --- |
| 写作 | `src/content/blog/` | `/blog/<slug>` | see "Blog Content Paths" below |
| 专辑 | `src/content/albums/` | `/albums/<slug>` | `.claude/skills/album-curation/` |
| 项目 | `src/content/projects/` | `/projects/<slug>` | — |
| 独立页 | `src/content/pages/` | `/<slug>` | — |

Before authoring content for a module that has a skill, read that skill first.

## Blog Content Paths

- Store blog posts as flat Markdown or MDX files under `src/content/blog/`.
- Name each file with a stable, lowercase kebab-case slug, for example
  `src/content/blog/ai-agent-workflow.md`.
- A post's public detail URL is `/blog/<slug>`, for example
  `/blog/ai-agent-workflow`.
- Do not include dates, post types, or tags in detail URLs. Those values may
  change without changing the canonical post URL.
- Keep post types and tags as frontmatter metadata. Use `/blog/articles`,
  `/blog/notes`, and `/tags/<tag>` only as collection pages.
- Do not place posts in year, type, or category subdirectories while the detail
  route remains `src/pages/blog/[id].astro`. Nested post URLs require an
  intentional route migration to a rest parameter such as `[...id]`, including
  redirect handling for existing URLs.

## Blog Images

- Store normal blog images under `src/assets/images/blog/<slug>/` so every post
  owns a separate image directory.
- Use `cover.jpg` or `cover.webp` for the post cover. Give body images concise,
  semantic lowercase kebab-case names such as `agent-lifecycle.webp`.
- From a flat file in `src/content/blog/`, reference a body image with:

  ```md
  ![AI Agent workflow](../../assets/images/blog/ai-agent-workflow/agent-lifecycle.webp)
  ```

- Reference the cover or social image in frontmatter with:

  ```yaml
  seo:
    image:
      src: '../../assets/images/blog/ai-agent-workflow/cover.jpg'
      alt: AI Agent workflow overview
  ```

- Always write meaningful `alt` text that describes the image's content or
  purpose. Use an empty alt only for a genuinely decorative image.
- Prefer `src/assets` for blog images so Astro can validate and process them at
  build time.
- Use `public/` only when a file must keep a stable, unprocessed URL, such as a
  downloadable document, favicon, or externally referenced default share image.
  Reference those files from the site root, for example
  `/images/share/default-og.png`.

## Verification

- After adding or moving blog content or images, run `npm run build`.
- Confirm the generated post URL matches `/blog/<slug>` and that body and SEO
  images resolve without broken links.
- Run `npm test` after changing anything under `src/utils/` or `src/scripts/`.
- Album entries cite external pages. Verify every `url` returns 200 before
  committing, and store the post-redirect canonical URL. See the
  `album-curation` skill for the exact command.
