import type { CollectionEntry } from 'astro:content';
import { slugify } from './common-utils';

export type Album = CollectionEntry<'albums'>;
export type AlbumEntry = Album['data']['entries'][number];

export function sortAlbumsByDateDesc(albumA: Album, albumB: Album): number {
    const dateOf = (album: Album) => new Date(album.data.updatedDate ?? album.data.publishDate).getTime();
    return dateOf(albumB) - dateOf(albumA);
}

export function getAlbumHref(album: Album): string {
    return `/albums/${album.id}/`;
}

/** Tags across all albums, most used first, de-duplicated by slug. */
export function getAllAlbumTags(albums: Album[]): { name: string; id: string; count: number }[] {
    const counts = new Map<string, { name: string; id: string; count: number }>();

    for (const album of albums) {
        for (const tag of album.data.tags) {
            if (!tag) continue;
            const id = slugify(tag);
            const existing = counts.get(id);
            if (existing) {
                existing.count += 1;
            } else {
                counts.set(id, { name: tag, id, count: 1 });
            }
        }
    }

    return [...counts.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function getAlbumsByTag(albums: Album[], tagId: string): Album[] {
    return albums.filter((album) => album.data.tags.map((tag) => slugify(tag)).includes(tagId));
}

/** Distinct sources in an album, most cited first, preserving first-seen order on ties. */
export function getAlbumSources(album: Album): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const entry of album.data.entries) {
        counts.set(entry.source, (counts.get(entry.source) ?? 0) + 1);
    }
    return [...counts.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function getEntryDomain(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
}

export function countAlbumEntries(albums: Album[]): number {
    return albums.reduce((total, album) => total + album.data.entries.length, 0);
}
