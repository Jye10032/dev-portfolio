import { type CollectionEntry } from 'astro:content';
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
    const featured = posts.filter((post) => post.data.isFeatured && isArticle(post));
    return featured.sort(sortItemsByDateDesc)[0];
}

export function getPostsByType(posts: CollectionEntry<'blog'>[], type: 'article' | 'note' | 'all' = 'all'): CollectionEntry<'blog'>[] {
    if (type === 'all') return posts.sort(sortItemsByDateDesc);
    return posts.filter((post) => post.data.type === type).sort(sortItemsByDateDesc);
}

export function getLatestPosts(posts: CollectionEntry<'blog'>[], count: number = 5): CollectionEntry<'blog'>[] {
    return posts.sort(sortItemsByDateDesc).slice(0, count);
}
