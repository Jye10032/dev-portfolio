import type { CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

export type BlogLanguage = CollectionEntry<'blog'>['data']['lang'];

export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
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

export function getAllTags(posts: CollectionEntry<'blog'>[]) {
    const tags: string[] = [...new Set(posts.flatMap((post) => post.data.tags || []).filter(Boolean))];
    return tags
        .map((tag) => {
            return {
                name: tag,
                id: slugify(tag)
            };
        })
        .filter((obj, pos, arr) => {
            return arr.map((mapObj) => mapObj.id).indexOf(obj.id) === pos;
        });
}

export function getPostsByTag(posts: CollectionEntry<'blog'>[], tagId: string) {
    const filteredPosts: CollectionEntry<'blog'>[] = posts.filter((post) => (post.data.tags || []).map((tag) => slugify(tag)).includes(tagId));
    return filteredPosts;
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
