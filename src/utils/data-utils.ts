import type { CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

export type BlogLanguage = CollectionEntry<'blog'>['data']['lang'];

type DatedEntry = CollectionEntry<'blog' | 'projects'>;

const publishedAt = (item: DatedEntry) => new Date(item.data.publishDate).getTime();

/** Comparator for newest-first ordering. */
export function sortItemsByDateDesc(itemA: DatedEntry, itemB: DatedEntry): number {
    return publishedAt(itemB) - publishedAt(itemA);
}

export function getPostSlug(post: CollectionEntry<'blog'>): string {
    return post.data.publicSlug ?? post.id;
}

export function getPostHref(post: CollectionEntry<'blog'>): string {
    const slug = getPostSlug(post);
    return post.data.lang === 'en' ? `/en/blog/${slug}/` : `/blog/${slug}/`;
}

export function getPostsByLanguage(posts: CollectionEntry<'blog'>[], lang: BlogLanguage): CollectionEntry<'blog'>[] {
    return posts.filter((post) => post.data.lang === lang);
}

export function findPostTranslation(post: CollectionEntry<'blog'>, posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'> | undefined {
    if (!post.data.translationKey) return undefined;
    return posts.find(
        (candidate) => candidate.id !== post.id && candidate.data.lang !== post.data.lang && candidate.data.translationKey === post.data.translationKey
    );
}

export type TagSummary = { name: string; id: string; count: number };

/**
 * Tags across the given posts, de-duplicated by slug and already ordered
 * most-used first. Tags that slugify to nothing are dropped so no route is
 * generated for them.
 */
export function getAllTags(posts: CollectionEntry<'blog'>[]): TagSummary[] {
    const bySlug = new Map<string, TagSummary>();

    for (const post of posts) {
        for (const tag of post.data.tags ?? []) {
            const id = slugify(tag);
            if (!id) continue;

            const existing = bySlug.get(id);
            if (existing) existing.count += 1;
            else bySlug.set(id, { name: tag, id, count: 1 });
        }
    }

    return [...bySlug.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tagId: string): CollectionEntry<'blog'>[] {
    return posts.filter((post) => (post.data.tags ?? []).some((tag) => slugify(tag) === tagId));
}

export function isArticle(post: CollectionEntry<'blog'>): boolean {
    return post.data.type === 'article';
}

export function isNote(post: CollectionEntry<'blog'>): boolean {
    return post.data.type === 'note';
}

export function getFeaturedArticle(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'> | undefined {
    const articles = posts.filter(isArticle);
    const featured = articles.filter((post) => post.data.isFeatured);
    return [...featured].sort(sortItemsByDateDesc)[0] ?? [...articles].sort(sortItemsByDateDesc)[0];
}

export function getPostsByType(posts: CollectionEntry<'blog'>[], type: 'article' | 'note' | 'all' = 'all'): CollectionEntry<'blog'>[] {
    if (type === 'all') return [...posts].sort(sortItemsByDateDesc);
    return posts.filter((post) => post.data.type === type).sort(sortItemsByDateDesc);
}

export function getLatestPosts(posts: CollectionEntry<'blog'>[], count: number = 5): CollectionEntry<'blog'>[] {
    return [...posts].sort(sortItemsByDateDesc).slice(0, count);
}

export function getHomepageFocusAreas<T extends { tag: string }>(posts: CollectionEntry<'blog'>[], areas: readonly T[]): Array<T & { count: number }> {
    return areas
        .map((area) => ({
            ...area,
            count: getPostsByTag(posts, slugify(area.tag)).length
        }))
        .filter(({ count }) => count > 0);
}

export function getHomepageRecommendations(
    posts: CollectionEntry<'blog'>[],
    count: number = 3,
    preferredIds: readonly string[] = []
): CollectionEntry<'blog'>[] {
    const sorted = [...posts].sort(sortItemsByDateDesc);
    const selected: CollectionEntry<'blog'>[] = [];

    const add = (candidate?: CollectionEntry<'blog'>) => {
        if (candidate && selected.length < count && !selected.some(({ id }) => id === candidate.id)) {
            selected.push(candidate);
        }
    };

    preferredIds.forEach((id) => add(sorted.find((candidate) => candidate.id === id)));
    add(getFeaturedArticle(sorted));
    add(sorted.find((candidate) => isArticle(candidate) && !selected.some(({ id }) => id === candidate.id)));
    add(sorted.find((candidate) => isNote(candidate) && !selected.some(({ id }) => id === candidate.id)));
    sorted.forEach(add);

    return selected.slice(0, count);
}
