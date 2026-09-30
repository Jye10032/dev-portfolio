import { describe, expect, it } from 'vitest';
import { countAlbumEntries, getAlbumHref, getAlbumSources, getAllAlbumTags, getEntryDomain, sortAlbumsByDateDesc, type Album } from '../../src/utils/album-utils';

type EntryInput = { source: string; title?: string; url?: string };

function makeAlbum(id: string, options: { publishDate: string; updatedDate?: string; tags?: string[]; entries?: EntryInput[] }): Album {
    return {
        id,
        data: {
            title: id,
            publishDate: new Date(options.publishDate),
            updatedDate: options.updatedDate ? new Date(options.updatedDate) : undefined,
            tags: options.tags ?? [],
            entries: (options.entries ?? []).map((entry) => ({
                title: entry.title ?? 'entry',
                url: entry.url ?? 'https://example.com/a',
                source: entry.source
            }))
        }
    } as unknown as Album;
}

describe('sortAlbumsByDateDesc', () => {
    it('sorts newest first and prefers updatedDate over publishDate', () => {
        const stale = makeAlbum('stale', { publishDate: '2026-05-01' });
        const refreshed = makeAlbum('refreshed', { publishDate: '2026-01-01', updatedDate: '2026-09-01' });
        const newest = makeAlbum('newest', { publishDate: '2026-09-20' });

        const sorted = [stale, refreshed, newest].sort(sortAlbumsByDateDesc).map((album) => album.id);

        expect(sorted).toEqual(['newest', 'refreshed', 'stale']);
    });
});

describe('getAllAlbumTags', () => {
    it('counts tags across albums and orders by frequency', () => {
        const albums = [
            makeAlbum('a', { publishDate: '2026-01-01', tags: ['产品方法论', '竞品分析'] }),
            makeAlbum('b', { publishDate: '2026-01-02', tags: ['产品方法论'] })
        ];

        const tags = getAllAlbumTags(albums);

        expect(tags[0]).toMatchObject({ name: '产品方法论', count: 2 });
        expect(tags.map((tag) => tag.name)).toEqual(['产品方法论', '竞品分析']);
        expect(tags.every((tag) => tag.id.length > 0)).toBe(true);
    });

    it('returns an empty list when no album has tags', () => {
        expect(getAllAlbumTags([makeAlbum('a', { publishDate: '2026-01-01' })])).toEqual([]);
    });
});

describe('getAlbumSources', () => {
    it('de-duplicates sources and counts citations, most cited first', () => {
        const album = makeAlbum('a', {
            publishDate: '2026-01-01',
            entries: [{ source: 'NN/g' }, { source: 'Intercom' }, { source: 'NN/g' }, { source: 'NN/g' }]
        });

        expect(getAlbumSources(album)).toEqual([
            { name: 'NN/g', count: 3 },
            { name: 'Intercom', count: 1 }
        ]);
    });
});

describe('getEntryDomain', () => {
    it('strips the www prefix', () => {
        expect(getEntryDomain('https://www.nngroup.com/articles/comparison-tables/')).toBe('nngroup.com');
    });

    it('returns the raw value when the url cannot be parsed', () => {
        expect(getEntryDomain('not a url')).toBe('not a url');
    });
});

describe('countAlbumEntries and getAlbumHref', () => {
    it('sums entries across albums', () => {
        const albums = [
            makeAlbum('a', { publishDate: '2026-01-01', entries: [{ source: 'x' }, { source: 'y' }] }),
            makeAlbum('b', { publishDate: '2026-01-02', entries: [{ source: 'z' }] })
        ];

        expect(countAlbumEntries(albums)).toBe(3);
    });

    it('builds a trailing-slash album href', () => {
        expect(getAlbumHref(makeAlbum('product-methods', { publishDate: '2026-01-01' }))).toBe('/albums/product-methods/');
    });
});
