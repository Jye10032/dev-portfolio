import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { getHomepageFocusAreas, getHomepageRecommendations } from '../src/utils/data-utils';

function post(id: string, publishDate: string, type: 'article' | 'note' = 'article', tags: string[] = []) {
    return {
        id,
        data: {
            title: id,
            publishDate: new Date(publishDate),
            type,
            draft: false,
            lang: 'zh-CN',
            isFeatured: false,
            tags
        }
    } as CollectionEntry<'blog'>;
}

describe('getHomepageRecommendations', () => {
    it('keeps curated representative posts in the configured order', () => {
        const posts = [post('latest', '2026-04-03'), post('frontend', '2026-03-31'), post('ai', '2026-03-17'), post('review', '2025-11-20')];

        const recommendations = getHomepageRecommendations(posts, 3, ['ai', 'frontend', 'review']);

        expect(recommendations.map(({ id }) => id)).toEqual(['ai', 'frontend', 'review']);
    });

    it('falls back to available posts when a curated id is missing', () => {
        const posts = [post('article', '2026-04-03'), post('note', '2026-03-31', 'note')];

        const recommendations = getHomepageRecommendations(posts, 2, ['missing']);

        expect(recommendations.map(({ id }) => id)).toEqual(['article', 'note']);
    });
});

describe('getHomepageFocusAreas', () => {
    it('only reports focus areas backed by published posts', () => {
        const posts = [post('ai', '2026-03-17', 'article', ['FEMentor'])];
        const areas = [
            { title: 'AI', tag: 'FEMentor' },
            { title: 'Frontend', tag: 'VideoGaga' }
        ];

        expect(getHomepageFocusAreas(posts, areas)).toEqual([{ title: 'AI', tag: 'FEMentor', count: 1 }]);
    });
});
