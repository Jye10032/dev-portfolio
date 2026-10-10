import type { CollectionEntry } from 'astro:content';
import { describe, expect, it } from 'vitest';
import {
    findPostTranslation,
    getHomepageFocusAreas,
    getHomepageRecommendations,
    getPostHref,
    getPostSeries,
    getPostSlug,
    getPostsByLanguage
} from '../src/utils/data-utils';

function post(
    id: string,
    publishDate: string,
    type: 'article' | 'note' = 'article',
    tags: string[] = [],
    lang: 'zh-CN' | 'en' = 'zh-CN',
    translationKey?: string,
    publicSlug?: string
) {
    return {
        id,
        data: {
            title: id,
            publishDate: new Date(publishDate),
            type,
            draft: false,
            lang,
            translationKey,
            publicSlug,
            isFeatured: false,
            tags
        }
    } as CollectionEntry<'blog'>;
}

describe('localized blog helpers', () => {
    const chinese = post('agent-workflow', '2026-04-03', 'article', [], 'zh-CN', 'agent-workflow');
    const english = post('agent-workflow-en', '2026-04-04', 'article', [], 'en', 'agent-workflow', 'agent-workflow');
    const unrelated = post('unrelated', '2026-04-05');

    it('keeps the established Chinese route and prefixes English posts', () => {
        expect(getPostHref(chinese)).toBe('/blog/agent-workflow/');
        expect(getPostHref(english)).toBe('/en/blog/agent-workflow/');
        expect(getPostSlug(english)).toBe('agent-workflow');
    });

    it('filters language editions explicitly', () => {
        expect(getPostsByLanguage([chinese, english, unrelated], 'zh-CN').map(({ id }) => id)).toEqual(['agent-workflow', 'unrelated']);
        expect(getPostsByLanguage([chinese, english, unrelated], 'en').map(({ id }) => id)).toEqual(['agent-workflow-en']);
    });

    it('only pairs published posts with the same translation key', () => {
        expect(findPostTranslation(chinese, [chinese, english, unrelated])?.id).toBe('agent-workflow-en');
        expect(findPostTranslation(unrelated, [chinese, english])).toBeUndefined();
    });
});

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

describe('series reading order', () => {
    const chapter = (id: string, order: number, date: string) => {
        const entry = post(id, date);
        entry.data.series = { id: 'fementor', order };
        return entry;
    };

    it('follows editorial order despite dates, interleaved projects, drafts and translations', () => {
        const first = chapter('first', 1, '2026-04-04');
        const current = chapter('current', 2, '2026-03-01');
        const next = chapter('next', 3, '2026-01-01');
        const draft = chapter('draft', 4, '2026-05-01');
        draft.data.draft = true;
        const translation = chapter('translated', 2, '2026-03-01');
        translation.data.lang = 'en';
        const otherProject = chapter('other-project', 3, '2026-03-02');
        otherProject.data.series = { id: 'videogaga', order: 3 };

        const series = getPostSeries(current, [next, draft, otherProject, translation, current, first]);
        expect(series?.posts.map(({ id }) => id)).toEqual(['first', 'current', 'next']);
        expect(series?.previous?.id).toBe('first');
        expect(series?.next?.id).toBe('next');
    });

    it('does not wrap at either end or invent siblings for a partially translated series', () => {
        const first = chapter('first', 1, '2026-01-01');
        const last = chapter('last', 4, '2026-02-01');
        const translated = chapter('translated', 2, '2026-01-15');
        translated.data.lang = 'en';
        translated.data.publicSlug = 'translated-chapter';
        const posts = [last, translated, first];

        expect(getPostSeries(first, posts)?.previous).toBeUndefined();
        expect(getPostSeries(last, posts)?.next).toBeUndefined();
        const series = getPostSeries(translated, posts)!;
        expect(series.order).toBe(2);
        expect(series.previous).toBeUndefined();
        expect(series.next).toBeUndefined();
        expect(series.posts.map(getPostHref)).toEqual(['/en/blog/translated-chapter/']);
    });
});
