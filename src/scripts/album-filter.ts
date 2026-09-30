export const ALL_TAGS = 'all';

export function matchesTag(cardTags: string, tagId: string): boolean {
    if (tagId === ALL_TAGS) return true;
    return cardTags.split(/\s+/).filter(Boolean).includes(tagId);
}

/**
 * Wires the tag filter on the album index. Filtering is client-side over the
 * already-rendered cards, so it stays instant and needs no extra routes.
 * Returns a cleanup function, or null when the expected markup is missing.
 */
/** Reads `?tag=` so `/albums?tag=foo` deep-links to a filtered view. */
export function readTagFromSearch(search: string): string {
    try {
        return new URLSearchParams(search).get('tag') || ALL_TAGS;
    } catch {
        return ALL_TAGS;
    }
}

export function initAlbumFilter(root: HTMLElement, search = globalThis.location?.search ?? '') {
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-album-filter]'));
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-album-tags]'));
    const status = root.querySelector<HTMLElement>('[data-album-filter-status]');
    if (buttons.length === 0 || cards.length === 0) return null;

    const knownTags = new Set(buttons.map((button) => button.dataset.albumFilter ?? ''));

    const apply = (tagId: string) => {
        let visible = 0;

        for (const card of cards) {
            const isMatch = matchesTag(card.dataset.albumTags ?? '', tagId);
            card.hidden = !isMatch;
            if (isMatch) visible += 1;
        }

        for (const button of buttons) {
            button.setAttribute('aria-pressed', String(button.dataset.albumFilter === tagId));
        }

        if (status) {
            status.textContent = tagId === ALL_TAGS ? `共 ${visible} 个专辑` : `筛选出 ${visible} 个专辑`;
        }
    };

    const onClick = (event: Event) => {
        const tagId = (event.currentTarget as HTMLButtonElement).dataset.albumFilter;
        if (tagId) apply(tagId);
    };

    for (const button of buttons) {
        button.addEventListener('click', onClick);
    }

    const requested = readTagFromSearch(search);
    apply(knownTags.has(requested) ? requested : ALL_TAGS);

    return () => {
        for (const button of buttons) {
            button.removeEventListener('click', onClick);
        }
        for (const card of cards) {
            card.hidden = false;
        }
    };
}
