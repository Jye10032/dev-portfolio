import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import { getHomepageRecommendations } from '../../src/utils/data-utils';

function post(id: string, type: 'article' | 'note', publishDate: string, isFeatured = false) {
    return {
        id,
        data: { type, publishDate: new Date(publishDate), isFeatured }
    } as CollectionEntry<'blog'>;
}

describe('getHomepageRecommendations', () => {
    it('orders a featured article, latest other article, then latest note', () => {
        const result = getHomepageRecommendations([
            post('featured', 'article', '2026-01-01', true),
            post('article', 'article', '2026-03-01'),
            post('note', 'note', '2026-04-01')
        ]);

        expect(result.map(({ id }) => id)).toEqual(['featured', 'article', 'note']);
    });

    it('never duplicates a post when inventory is small', () => {
        const result = getHomepageRecommendations([post('only', 'article', '2026-01-01', true)]);
        expect(result.map(({ id }) => id)).toEqual(['only']);
    });

    it('falls back to newest available public entries', () => {
        const result = getHomepageRecommendations([post('older-note', 'note', '2026-01-01'), post('newer-note', 'note', '2026-02-01')]);
        expect(result.map(({ id }) => id)).toEqual(['newer-note', 'older-note']);
    });

    it('returns an empty array for an empty inventory', () => {
        expect(getHomepageRecommendations([])).toEqual([]);
    });
});
