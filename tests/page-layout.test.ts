import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const globalStyles = readFileSync(resolve('src/styles/global.css'), 'utf8');
const baseLayout = readFileSync(resolve('src/layouts/BaseLayout.astro'), 'utf8');
const siteHeader = readFileSync(resolve('src/components/Header.astro'), 'utf8');
const blogDetail = readFileSync(resolve('src/pages/blog/[id].astro'), 'utf8');
const projectDetail = readFileSync(resolve('src/pages/projects/[id].astro'), 'utf8');
const tagsIndex = readFileSync(resolve('src/pages/tags/index.astro'), 'utf8');
const wallPage = readFileSync(resolve('src/pages/wall.astro'), 'utf8');
const baseHead = readFileSync(resolve('src/components/BaseHead.astro'), 'utf8');
const blogPost = readFileSync(resolve('src/components/BlogPost.astro'), 'utf8');
const englishBlogDetail = readFileSync(resolve('src/pages/en/blog/[id].astro'), 'utf8');
const siteConfig = readFileSync(resolve('src/data/site-config.ts'), 'utf8');

describe('content page layout contract', () => {
    it('loads Umami Cloud tracking from the shared layout', () => {
        expect(baseLayout).toContain('siteConfig.umami?.websiteId');
        expect(baseLayout).toContain('data-website-id={siteConfig.umami.websiteId}');
        expect(siteConfig).toContain("websiteId: 'f4bacde3-1afc-45e7-84c3-1a3a6ea8361c'");
        expect(siteConfig).toContain("scriptUrl: 'https://cloud.umami.is/script.js'");
    });

    it('keeps all page content clear of the navigation divider', () => {
        expect(siteHeader).toMatch(/<header class="[^"]*\bpt-6\b[^"]*\bsm:pt-8\b/);
        expect(baseLayout).toContain("!showHeader && 'pt-6 sm:pt-8'");
        expect(blogDetail).not.toContain('detail-page');
        expect(projectDetail).not.toContain('detail-page');
        expect(globalStyles).not.toContain('.detail-page');
        expect(tagsIndex).not.toMatch(/\.tag-index\s*\{[\s\S]*?padding-top:/);
    });

    it('uses a sticky two-column tag directory that collapses on mobile', () => {
        expect(tagsIndex).toContain('<BaseLayout wide');
        expect(tagsIndex).toContain('class="tag-index"');
        expect(tagsIndex).toMatch(/\.tag-index\s*\{[\s\S]*?grid-template-columns:\s*minmax\(14rem, 18rem\) minmax\(0, 1fr\)/);
        expect(tagsIndex).toMatch(/\.tag-index__intro\s*\{[\s\S]*?position:\s*sticky/);
        expect(tagsIndex).toMatch(/@media \(max-width: 799px\)[\s\S]*?\.tag-index\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
        expect(tagsIndex).toMatch(/@media \(max-width: 799px\)[\s\S]*?\.tag-index__intro\s*\{[\s\S]*?position:\s*static/);
    });

    it('initializes the wall on direct visits as well as Astro route changes', () => {
        expect(wallPage).toContain('let activeRoot: HTMLElement | null = null');
        expect(wallPage).toContain('let cleanup: (() => void) | null = null');
        expect(wallPage).toContain('setup();');
        expect(wallPage).toContain("document.addEventListener('DOMContentLoaded', setup, { once: true })");
        expect(wallPage).toContain("document.addEventListener('astro:page-load', setup)");
        expect(wallPage).toContain("document.addEventListener('astro:before-swap', teardown)");
    });

    it('connects paired language editions without changing Chinese post URLs', () => {
        expect(baseLayout).toContain('<html lang={lang}');
        expect(baseHead).toContain('hreflang={alternate.lang}');
        expect(blogDetail).toContain("getPostsByLanguage(allPosts, 'zh-CN')");
        expect(englishBlogDetail).toContain("getPostsByLanguage(allPosts, 'en')");
        expect(blogPost).toContain('class="post-language-switch"');
    });

    it('shows a responsive table of contents only for structured long-form posts', () => {
        expect(blogPost).toContain("type === 'article' && headings.filter((heading) => heading.depth === 2)");
        expect(blogPost).toContain('const showTableOfContents = tableOfContents.length >= 3');
        expect(blogPost).toContain('class="post-toc post-toc--desktop"');
        expect(blogPost).toContain('class="post-toc post-toc--mobile"');
        expect(blogPost).not.toContain('overflow-y: auto');
        expect(blogPost).toMatch(/grid-template-columns:\s*16rem minmax\(0, 48rem\) 16rem/);
        expect(blogPost).toMatch(/\.post-layout--with-toc \.post-article\s*\{[\s\S]*?grid-column:\s*2/);
        expect(blogPost).toMatch(/@media \(max-width: 1439px\)[\s\S]*?\.post-toc--desktop[\s\S]*?display:\s*none/);
    });
});
