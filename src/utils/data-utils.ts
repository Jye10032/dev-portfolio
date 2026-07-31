import type { CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

export function sortItemsByDateDesc(itemA: CollectionEntry<'blog' | 'projects'>, itemB: CollectionEntry<'blog' | 'projects'>) {
    return new Date(itemB.data.publishDate).getTime() - new Date(itemA.data.publishDate).getTime();
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

export function getHomepageRecommendations(posts: CollectionEntry<'blog'>[], count: number = 3): CollectionEntry<'blog'>[] {
    const sorted = [...posts].sort(sortItemsByDateDesc);
    const selected: CollectionEntry<'blog'>[] = [];

    const add = (candidate?: CollectionEntry<'blog'>) => {
        if (candidate && selected.length < count && !selected.some(({ id }) => id === candidate.id)) {
            selected.push(candidate);
        }
    };

    add(getFeaturedArticle(sorted));
    add(sorted.find((candidate) => isArticle(candidate) && !selected.some(({ id }) => id === candidate.id)));
    add(sorted.find((candidate) => isNote(candidate) && !selected.some(({ id }) => id === candidate.id)));
    sorted.forEach(add);

    return selected.slice(0, count);
}
